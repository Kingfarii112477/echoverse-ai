-- EchoVerse AI — Migration 003: Teams, Workspaces & Production Hardening
-- Run after 002_missing_tables.sql

-- ============================================================
-- TABLE: workspaces  (proper team container)
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'pro', 'agency')),
    max_members INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);

CREATE POLICY "Workspace members can view workspace"
    ON workspaces FOR SELECT
    USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM team_members WHERE team_members.workspace_owner_id = workspaces.owner_id AND team_members.member_id = auth.uid() AND team_members.status = 'active')
    );

CREATE POLICY "Owners can update workspace"
    ON workspaces FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create workspaces"
    ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: workspace_invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role workspace_role DEFAULT 'viewer' NOT NULL,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_invitations_owner ON workspace_invitations(workspace_owner_id);
CREATE INDEX idx_invitations_email ON workspace_invitations(email);
CREATE INDEX idx_invitations_token ON workspace_invitations(token);

CREATE POLICY "Owners can manage invitations"
    ON workspace_invitations FOR ALL USING (workspace_owner_id = auth.uid() OR invited_by = auth.uid());

-- ============================================================
-- TABLE: audit_logs  (security + compliance)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Only service role can insert audit logs (from API routes)
CREATE POLICY "Service role can insert audit logs"
    ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own audit logs"
    ON audit_logs FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- TABLE: rate_limits  (request throttling)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, endpoint, window_start)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, window_start);

-- ============================================================
-- TABLE: feature_flags
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    allowed_tiers TEXT[] DEFAULT ARRAY['free', 'creator', 'pro', 'agency'],
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature flags"
    ON feature_flags FOR SELECT USING (true);

-- Seed default feature flags
INSERT INTO feature_flags (key, enabled, allowed_tiers, description) VALUES
    ('voice_studio', true, ARRAY['free', 'creator', 'pro', 'agency'], 'Basic TTS generation'),
    ('voice_cloning', true, ARRAY['creator', 'pro', 'agency'], 'Custom voice cloning'),
    ('multi_speaker', true, ARRAY['pro', 'agency'], 'Multi-speaker dialogue'),
    ('video_studio', true, ARRAY['pro', 'agency'], 'AI video generation'),
    ('reels_generator', true, ARRAY['creator', 'pro', 'agency'], 'Short-form reel generation'),
    ('ssml_studio', true, ARRAY['creator', 'pro', 'agency'], 'Advanced SSML editor'),
    ('emotion_engine', true, ARRAY['pro', 'agency'], 'Emotional voice synthesis'),
    ('team_collaboration', true, ARRAY['agency'], 'Team workspace features'),
    ('api_access', true, ARRAY['pro', 'agency'], 'API key generation'),
    ('batch_generation', true, ARRAY['pro', 'agency'], 'Batch voice generation'),
    ('analytics_advanced', true, ARRAY['creator', 'pro', 'agency'], 'Advanced analytics dashboard')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- TABLE: usage_quotas  (plan limits)
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier TEXT NOT NULL UNIQUE,
    monthly_tts_minutes INTEGER DEFAULT 30,
    monthly_clones INTEGER DEFAULT 0,
    monthly_ai_scripts INTEGER DEFAULT 5,
    monthly_video_exports INTEGER DEFAULT 0,
    max_team_members INTEGER DEFAULT 1,
    max_projects INTEGER DEFAULT 10,
    storage_gb INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO usage_quotas (tier, monthly_tts_minutes, monthly_clones, monthly_ai_scripts, monthly_video_exports, max_team_members, max_projects, storage_gb) VALUES
    ('free',    30,    0,   5,   0,   1,   10,  1),
    ('creator', 300,   3,   50,  5,   1,   100, 10),
    ('pro',     1000,  10,  200, 20,  3,   500, 50),
    ('agency',  5000,  50,  999, 100, 20,  9999, 500)
ON CONFLICT (tier) DO NOTHING;

ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quotas" ON usage_quotas FOR SELECT USING (true);

-- ============================================================
-- Auto-create workspace on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    workspace_slug TEXT;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create default free subscription
    INSERT INTO public.subscriptions (user_id, status)
    VALUES (NEW.id, 'active')
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default workspace
    workspace_slug := lower(regexp_replace(
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'workspace'),
        '[^a-z0-9]', '-', 'g'
    )) || '-' || substr(NEW.id::text, 1, 8);

    INSERT INTO public.workspaces (owner_id, name, slug)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
        workspace_slug
    )
    ON CONFLICT (slug) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
