// Auto-generated Supabase database types
// Run: supabase gen types typescript --project-id rfsnytjoucfgrmajyszg > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: string;
          status: string;
          progress: number;
          duration: number | null;
          file_url: string | null;
          thumbnail_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Row']>;
      };
      voices: {
        Row: {
          id: string;
          name: string;
          language: string;
          gender: string;
          provider: string;
          preview_url: string | null;
          avatar_url: string | null;
          tags: string[];
          is_premium: boolean;
          is_cloned: boolean;
          stability: number;
          similarity: number;
          style: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['voices']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['voices']['Row']>;
      };
      voice_clones: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          sample_urls: string[];
          clone_id: string | null;
          quality_score: number;
          status: string;
          provider: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['voice_clones']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['voice_clones']['Row']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          paddle_customer_id: string | null;
          paddle_subscription_id: string | null;
          plan_id: string | null;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          trial_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes: string[];
          last_used_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['api_keys']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['api_keys']['Row']>;
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          type: string;
          units: number;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usage_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['usage_logs']['Row']>;
      };
      brand_kits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          preferred_voices: string[];
          pronunciation_rules: Json;
          brand_tone: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['brand_kits']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['brand_kits']['Row']>;
      };
      templates: {
        Row: {
          id: string;
          created_by: string | null;
          title: string;
          description: string | null;
          type: string;
          content: Json;
          preview_url: string | null;
          thumbnail_url: string | null;
          tags: string[];
          use_count: number;
          is_public: boolean;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['templates']['Row']>;
      };
      team_members: {
        Row: {
          id: string;
          workspace_owner_id: string;
          member_id: string | null;
          email: string;
          role: string;
          status: string;
          invited_at: string;
          joined_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'invited_at' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['team_members']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          is_read: boolean;
          data: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_template_use_count: {
        Args: { template_id: string };
        Returns: void;
      };
    };
    Enums: {
      subscription_status: 'active' | 'canceled' | 'past_due' | 'pending';
      workspace_role: 'admin' | 'editor' | 'viewer';
      project_type: 'voice' | 'podcast' | 'audiobook' | 'story' | 'video' | 'reel';
      project_status: 'draft' | 'generating' | 'completed' | 'archived' | 'error';
    };
  };
}
