// EchoVerse AI — Application Types
// Generated from database schema + UI requirements

// ── Re-export generated database types ─────────────────────────
export type { Database } from './database';

// ── Core Enums ─────────────────────────────────────────────────
export type SubscriptionTier = 'free' | 'pro' | 'studio' | 'enterprise';
export type ProjectType = 'voice' | 'podcast' | 'audiobook' | 'story' | 'video' | 'reel';
export type ProjectStatus = 'draft' | 'generating' | 'completed' | 'archived' | 'error';
export type VoiceLanguage = 'ur' | 'hi' | 'en' | 'ar' | 'all';
export type EmotionType = 'calm' | 'happy' | 'sad' | 'angry' | 'excited' | 'fearful' | 'neutral' | 'whisper' | 'shouting';
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ── User & Auth ──────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

// ── Voice ──────────────────────────────────────────────────────
export interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  provider?: string;
  preview_url?: string | null;
  avatar_url?: string | null;
  tags?: string[];
  is_premium?: boolean;
  is_cloned?: boolean;
  stability?: number;
  similarity?: number;
  style?: number;
  created_at?: string;
}

export interface VoiceClone {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sample_urls?: string[];
  clone_id?: string;
  quality_score?: number;
  status: GenerationStatus;
  provider?: string;
  created_at: string;
}

// ── Project ────────────────────────────────────────────────────
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  duration?: number | null;
  file_url?: string | null;
  thumbnail_url?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ── Brand Kit ──────────────────────────────────────────────────
export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  tone_description?: string;
  preferred_voice_ids?: string[];
  pronunciation_rules?: Record<string, any>;
  templates?: string[];
  is_shared?: boolean;
  created_at: string;
  updated_at: string;
}

// ── Template ───────────────────────────────────────────────────
export interface Template {
  id: string;
  name: string;
  category?: string;
  description?: string;
  content: string;
  type?: ProjectType;
  use_count?: number;
  is_premium?: boolean;
  is_featured?: boolean;
  thumbnail_url?: string | null;
  created_at: string;
}

// ── API Key ────────────────────────────────────────────────────
export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes?: string[];
  last_used_at?: string | null;
  expires_at?: string | null;
  created_at: string;
}

// ── Usage & Analytics ──────────────────────────────────────────
export interface UsageLog {
  id: string;
  user_id: string;
  type: string;
  units: number;
  created_at: string;
}

// ── Team & Workspace ───────────────────────────────────────────
export interface TeamMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_by?: string;
  joined_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: SubscriptionTier;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ── Notification ─────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  type: 'info' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

// ── Audio Generation ─────────────────────────────────────────
export interface AudioGeneration {
  id: string;
  project_id: string;
  voice_id?: string | null;
  text: string;
  ssml?: string | null;
  emotion?: string | null;
  duration?: number | null;
  file_url?: string | null;
  status: GenerationStatus;
  created_at: string;
}

// ── Voice Settings ────────────────────────────────────────────
export interface VoiceSettings {
  stability: number;
  similarity: number;
  style: number;
  speed: number;
}

// ── SSML Tag ───────────────────────────────────────────────────
export interface SSMLTag {
  name: string;
  tag: string;
  description: string;
}

// ── Dialogue / Speaker ─────────────────────────────────────────
export interface Speaker {
  id: string;
  label: string;
  name: string;
  voiceId: string;
  color: string;
}

export interface DialogueLine {
  id: string;
  speakerId: string;
  text: string;
}
