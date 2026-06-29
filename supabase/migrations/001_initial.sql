-- EchoVerse AI Database Migration
-- Version: 001_initial.sql
-- Description: Initial database schema with all tables, RLS policies, and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enums
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'studio', 'enterprise');
CREATE TYPE project_type AS ENUM ('voice', 'podcast', 'audiobook', 'story', 'video', 'reel');
CREATE TYPE project_status AS ENUM ('draft', 'generating', 'completed', 'archived', 'error');
CREATE TYPE language_type AS ENUM ('urdu', 'hindi', 'english', 'arabic');
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE: profiles
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: projects
-- ============================================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type project_type NOT NULL,
    status project_status DEFAULT 'draft' NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    duration FLOAT,
    file_url TEXT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: voices
-- ============================================================================
CREATE TABLE voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    language language_type NOT NULL,
    gender TEXT,
    provider TEXT,
    preview_url TEXT,
    avatar_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    is_cloned BOOLEAN DEFAULT false,
    stability FLOAT CHECK (stability >= 0 AND stability <= 1),
    similarity FLOAT CHECK (similarity >= 0 AND similarity <= 1),
    style FLOAT CHECK (style >= 0 AND style <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voices (publicly readable)
CREATE POLICY "Anyone can view voices"
    ON voices FOR SELECT
    USING (true);

-- ============================================================================
-- TABLE: audio_generations
-- ============================================================================
CREATE TABLE audio_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    voice_id UUID REFERENCES voices(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    ssml TEXT,
    emotion TEXT,
    duration FLOAT,
    file_url TEXT,
    status generation_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE audio_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audio_generations
CREATE POLICY "Users can view their own audio generations"
    ON audio_generations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_generations.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own audio generations"
    ON audio_generations FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_generations.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own audio generations"
    ON audio_generations FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_generations.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own audio generations"
    ON audio_generations FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_generations.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: voice_clones
-- ============================================================================
CREATE TABLE voice_clones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sample_urls TEXT[] DEFAULT '{}',
    clone_id TEXT,
    quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
    status generation_status DEFAULT 'pending' NOT NULL,
    provider TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE voice_clones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_clones
CREATE POLICY "Users can view their own voice clones"
    ON voice_clones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice clones"
    ON voice_clones FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice clones"
    ON voice_clones FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice clones"
    ON voice_clones FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: brand_kits
-- ============================================================================
CREATE TABLE brand_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tone_description TEXT,
    preferred_voice_ids TEXT[] DEFAULT '{}',
    pronunciation_rules JSONB DEFAULT '{}'::jsonb,
    templates TEXT[] DEFAULT '{}',
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_kits
CREATE POLICY "Users can view their own brand kits"
    ON brand_kits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand kits"
    ON brand_kits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand kits"
    ON brand_kits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand kits"
    ON brand_kits FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_brand_kits_updated_at
    BEFORE UPDATE ON brand_kits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: templates
-- ============================================================================
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    content TEXT NOT NULL,
    type project_type,
    use_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates (publicly readable)
CREATE POLICY "Anyone can view templates"
    ON templates FOR SELECT
    USING (true);

-- ============================================================================
-- TABLE: podcasts
-- ============================================================================
CREATE TABLE podcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    host_voice_id UUID REFERENCES voices(id) ON DELETE SET NULL,
    guest_voice_ids TEXT[] DEFAULT '{}',
    script JSONB DEFAULT '{}'::jsonb,
    segments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for podcasts
CREATE POLICY "Users can view their own podcasts"
    ON podcasts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = podcasts.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own podcasts"
    ON podcasts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = podcasts.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own podcasts"
    ON podcasts FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = podcasts.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own podcasts"
    ON podcasts FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = podcasts.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: stories
-- ============================================================================
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    characters JSONB DEFAULT '[]'::jsonb,
    narrator_voice_id UUID REFERENCES voices(id) ON DELETE SET NULL,
    scenes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Users can view their own stories"
    ON stories FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = stories.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own stories"
    ON stories FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = stories.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own stories"
    ON stories FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = stories.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own stories"
    ON stories FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = stories.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: audiobooks
-- ============================================================================
CREATE TABLE audiobooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapters JSONB DEFAULT '[]'::jsonb,
    narrator_voice_id UUID REFERENCES voices(id) ON DELETE SET NULL,
    character_map JSONB DEFAULT '{}'::jsonb,
    pronunciation_dict JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE audiobooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audiobooks
CREATE POLICY "Users can view their own audiobooks"
    ON audiobooks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audiobooks.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own audiobooks"
    ON audiobooks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audiobooks.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own audiobooks"
    ON audiobooks FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audiobooks.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own audiobooks"
    ON audiobooks FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audiobooks.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: videos
-- ============================================================================
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    video_url TEXT,
    scenes JSONB DEFAULT '[]'::jsonb,
    subtitles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos"
    ON videos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = videos.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own videos"
    ON videos FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = videos.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own videos"
    ON videos FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = videos.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own videos"
    ON videos FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = videos.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: reels
-- ============================================================================
CREATE TABLE reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    script TEXT,
    caption_style JSONB DEFAULT '{}'::jsonb,
    voice_id UUID REFERENCES voices(id) ON DELETE SET NULL,
    music_id TEXT,
    platform TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reels
CREATE POLICY "Users can view their own reels"
    ON reels FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = reels.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own reels"
    ON reels FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = reels.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own reels"
    ON reels FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = reels.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own reels"
    ON reels FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = reels.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: exports
-- ============================================================================
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    format TEXT NOT NULL,
    file_url TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exports
CREATE POLICY "Users can view their own exports"
    ON exports FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own exports"
    ON exports FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own exports"
    ON exports FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own exports"
    ON exports FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: workspace_members
-- ============================================================================
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role workspace_role DEFAULT 'viewer' NOT NULL,
    last_active TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_members
CREATE POLICY "Users can view workspace members where they are members"
    ON workspace_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid()
    ));

CREATE POLICY "Workspace owners can insert members"
    ON workspace_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM workspace_members WHERE workspace_id = workspace_members.workspace_id AND user_id = auth.uid() AND role = 'owner'
    ));

CREATE POLICY "Workspace owners can update members"
    ON workspace_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM workspace_members WHERE workspace_id = workspace_members.workspace_id AND user_id = auth.uid() AND role = 'owner'
    ));

CREATE POLICY "Workspace owners can delete members"
    ON workspace_members FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM workspace_members WHERE workspace_id = workspace_members.workspace_id AND user_id = auth.uid() AND role = 'owner'
    ));

-- ============================================================================
-- TABLE: workspace_activity
-- ============================================================================
CREATE TABLE workspace_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE workspace_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_activity
CREATE POLICY "Users can view activity in their workspaces"
    ON workspace_activity FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_activity.workspace_id AND workspace_members.user_id = auth.uid()
    ));

CREATE POLICY "Workspace members can insert activity"
    ON workspace_activity FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_activity.workspace_id AND workspace_members.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: api_keys
-- ============================================================================
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    last_used TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view their own API keys"
    ON api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
    ON api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
    ON api_keys FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
    ON api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: subscriptions
-- ============================================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    status subscription_status DEFAULT 'trialing' NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    price NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: pronunciation_dictionary
-- ============================================================================
CREATE TABLE pronunciation_dictionary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    phonetic TEXT NOT NULL,
    language language_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE pronunciation_dictionary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pronunciation_dictionary
CREATE POLICY "Users can view their own pronunciation entries"
    ON pronunciation_dictionary FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pronunciation entries"
    ON pronunciation_dictionary FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pronunciation entries"
    ON pronunciation_dictionary FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pronunciation entries"
    ON pronunciation_dictionary FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: conversation_scenes
-- ============================================================================
CREATE TABLE conversation_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    speaker_name TEXT NOT NULL,
    speaker_voice_id UUID REFERENCES voices(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    emotion TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE conversation_scenes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_scenes
CREATE POLICY "Users can view their own conversation scenes"
    ON conversation_scenes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = conversation_scenes.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own conversation scenes"
    ON conversation_scenes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = conversation_scenes.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own conversation scenes"
    ON conversation_scenes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = conversation_scenes.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own conversation scenes"
    ON conversation_scenes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = conversation_scenes.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: audio_drama_scenes
-- ============================================================================
CREATE TABLE audio_drama_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_name TEXT NOT NULL,
    voice_layers JSONB DEFAULT '[]'::jsonb,
    music_layer JSONB DEFAULT '{}'::jsonb,
    sfx_layer JSONB DEFAULT '{}'::jsonb,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE audio_drama_scenes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audio_drama_scenes
CREATE POLICY "Users can view their own audio drama scenes"
    ON audio_drama_scenes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_drama_scenes.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own audio drama scenes"
    ON audio_drama_scenes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_drama_scenes.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own audio drama scenes"
    ON audio_drama_scenes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_drama_scenes.project_id AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own audio drama scenes"
    ON audio_drama_scenes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects WHERE projects.id = audio_drama_scenes.project_id AND projects.user_id = auth.uid()
    ));

-- ============================================================================
-- TABLE: analytics
-- ============================================================================
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    minutes_generated FLOAT DEFAULT 0,
    synthesis_count INTEGER DEFAULT 0,
    cloning_count INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    revenue NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics
CREATE POLICY "Users can view their own analytics"
    ON analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
    ON analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
    ON analytics FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES for performance optimization
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Voices indexes
CREATE INDEX idx_voices_language ON voices(language);
CREATE INDEX idx_voices_is_premium ON voices(is_premium);
CREATE INDEX idx_voices_is_cloned ON voices(is_cloned);

-- Audio generations indexes
CREATE INDEX idx_audio_generations_project_id ON audio_generations(project_id);
CREATE INDEX idx_audio_generations_voice_id ON audio_generations(voice_id);
CREATE INDEX idx_audio_generations_status ON audio_generations(status);

-- Voice clones indexes
CREATE INDEX idx_voice_clones_user_id ON voice_clones(user_id);
CREATE INDEX idx_voice_clones_status ON voice_clones(status);

-- Brand kits indexes
CREATE INDEX idx_brand_kits_user_id ON brand_kits(user_id);

-- Templates indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_is_premium ON templates(is_premium);
CREATE INDEX idx_templates_is_featured ON templates(is_featured);

-- Podcasts indexes
CREATE INDEX idx_podcasts_project_id ON podcasts(project_id);

-- Stories indexes
CREATE INDEX idx_stories_project_id ON stories(project_id);

-- Audiobooks indexes
CREATE INDEX idx_audiobooks_project_id ON audiobooks(project_id);

-- Videos indexes
CREATE INDEX idx_videos_project_id ON videos(project_id);

-- Reels indexes
CREATE INDEX idx_reels_project_id ON reels(project_id);

-- Exports indexes
CREATE INDEX idx_exports_project_id ON exports(project_id);

-- Workspace members indexes
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- Workspace activity indexes
CREATE INDEX idx_workspace_activity_workspace_id ON workspace_activity(workspace_id);
CREATE INDEX idx_workspace_activity_created_at ON workspace_activity(created_at DESC);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Pronunciation dictionary indexes
CREATE INDEX idx_pronunciation_dictionary_user_id ON pronunciation_dictionary(user_id);
CREATE INDEX idx_pronunciation_dictionary_language ON pronunciation_dictionary(language);

-- Conversation scenes indexes
CREATE INDEX idx_conversation_scenes_project_id ON conversation_scenes(project_id);
CREATE INDEX idx_conversation_scenes_order_index ON conversation_scenes(order_index);

-- Audio drama scenes indexes
CREATE INDEX idx_audio_drama_scenes_project_id ON audio_drama_scenes(project_id);
CREATE INDEX idx_audio_drama_scenes_order_index ON audio_drama_scenes(order_index);

-- Analytics indexes
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_date ON analytics(date DESC);
CREATE INDEX idx_analytics_user_date ON analytics(user_id, date DESC);
