-- EchoVerse AI — Migration 002: Missing tables + security hardening
-- Run after 001_initial.sql

-- ============================================================
-- TABLE: usage_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'tts_generation', 'voice_clone', 'ai_script', etc.
    units INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_type ON usage_logs(type);

CREATE POLICY "Users can view own usage logs"
    ON usage_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs"
    ON usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    paddle_customer_id TEXT,
    paddle_subscription_id TEXT UNIQUE,
    plan_id TEXT,
    status subscription_status DEFAULT 'active' NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_customer ON subscriptions(paddle_customer_id);

CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: billing_events
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paddle_customer_id TEXT,
    paddle_transaction_id TEXT UNIQUE,
    amount BIGINT,
    currency TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_billing_events_customer ON billing_events(paddle_customer_id);

-- ============================================================
-- TABLE: api_keys
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of the actual key
    key_prefix TEXT NOT NULL,      -- first 8 chars shown in UI: ev_live_xxxxxxxx
    scopes TEXT[] DEFAULT ARRAY['read', 'write'],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

CREATE POLICY "Users can view own API keys"
    ON api_keys FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
    ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
    ON api_keys FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
    ON api_keys FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: voice_clones (extended from 001 if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_clones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sample_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    clone_id TEXT,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
    provider TEXT DEFAULT 'elevenlabs',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE voice_clones ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_voice_clones_user_id ON voice_clones(user_id);

CREATE POLICY "Users can manage own voice clones"
    ON voice_clones FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_voice_clones_updated_at
    BEFORE UPDATE ON voice_clones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: brand_kits
-- ============================================================
CREATE TABLE IF NOT EXISTS brand_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    preferred_voices TEXT[] DEFAULT ARRAY[]::TEXT[],
    pronunciation_rules JSONB DEFAULT '[]'::jsonb,
    brand_tone TEXT DEFAULT 'professional',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_brand_kits_user_id ON brand_kits(user_id);

CREATE POLICY "Users can manage own brand kits"
    ON brand_kits FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_brand_kits_updated_at
    BEFORE UPDATE ON brand_kits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: templates
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'podcast', 'story', 'audiobook', 'educational', 'islamic', 'marketing', 'corporate'
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    use_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_templates_use_count ON templates(use_count DESC);

CREATE POLICY "Anyone can read public templates"
    ON templates FOR SELECT USING (is_public = TRUE OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create templates"
    ON templates FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authors can update own templates"
    ON templates FOR UPDATE USING (auth.uid() = created_by);

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment template use count
CREATE OR REPLACE FUNCTION increment_template_use_count(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE templates SET use_count = use_count + 1 WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TABLE: voices (seeded catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS voices (
    id TEXT PRIMARY KEY, -- elevenlabs voice_id
    name TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'english',
    gender TEXT DEFAULT 'neutral',
    provider TEXT DEFAULT 'elevenlabs',
    preview_url TEXT,
    avatar_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_premium BOOLEAN DEFAULT FALSE,
    is_cloned BOOLEAN DEFAULT FALSE,
    stability FLOAT DEFAULT 0.5,
    similarity FLOAT DEFAULT 0.75,
    style FLOAT DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE voices ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_voices_language ON voices(language);

CREATE POLICY "All authenticated users can read voices"
    ON voices FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- TABLE: team_members
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role workspace_role DEFAULT 'viewer' NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_team_members_owner ON team_members(workspace_owner_id);
CREATE INDEX idx_team_members_email ON team_members(email);

CREATE POLICY "Workspace owners can manage members"
    ON team_members FOR ALL USING (auth.uid() = workspace_owner_id);

CREATE POLICY "Members can read their own membership"
    ON team_members FOR SELECT USING (auth.uid() = member_id);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE POLICY "Users can manage own notifications"
    ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: exports
-- ============================================================
CREATE TABLE IF NOT EXISTS exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    format TEXT NOT NULL, -- 'mp3', 'wav', 'aac', 'm4a'
    file_url TEXT NOT NULL,
    file_size INTEGER,
    duration FLOAT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_exports_user_id ON exports(user_id);

CREATE POLICY "Users can manage own exports"
    ON exports FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: pronunciation_dictionary
-- ============================================================
CREATE TABLE IF NOT EXISTS pronunciation_dictionary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    phonetic TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'urdu',
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE pronunciation_dictionary ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pronunciation_user ON pronunciation_dictionary(user_id);
CREATE INDEX idx_pronunciation_lang ON pronunciation_dictionary(language);

CREATE POLICY "Users can manage own dictionary"
    ON pronunciation_dictionary FOR ALL
    USING (auth.uid() = user_id OR is_global = TRUE);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('audio-generations', 'audio-generations', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/x-m4a', 'audio/ogg']),
    ('voice-samples', 'voice-samples', false, 26214400, ARRAY['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg']),
    ('project-files', 'project-files', false, 104857600, ARRAY['audio/mpeg', 'audio/wav', 'video/mp4', 'application/pdf', 'text/plain']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Users can manage own audio files"
    ON storage.objects FOR ALL
    USING (bucket_id = 'audio-generations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can manage own voice samples"
    ON storage.objects FOR ALL
    USING (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can manage own project files"
    ON storage.objects FOR ALL
    USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public avatar access"
    ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

