import { createBrowserClient } from '@supabase/ssr';
import type { User, Project, Voice, VoiceClone, BrandKit, Template, ApiKey, Subscription } from '@/types';

// Safe accessor — throws only at runtime, not during Next.js build
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (typeof window !== 'undefined') {
      throw new Error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    return { url: 'https://placeholder.supabase.co', key: 'placeholder' };
  }
  return { url, key };
}

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ── Auth Operations ────────────────────────────────────────────
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback` },
    });
    if (error) throw error;
    return data;
  },
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/reset-password`,
    });
    if (error) throw error;
    return data;
  },
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },
};

// ── Project CRUD ───────────────────────────────────────────────
export const projectService = {
  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects').select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Project[];
  },
  async getProject(projectId: string): Promise<Project> {
    const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (error) throw error;
    return data as Project;
  },
  async createProject(project: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase.from('projects').insert([project]).select().single();
    if (error) throw error;
    return data as Project;
  },
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', projectId).select().single();
    if (error) throw error;
    return data as Project;
  },
  async deleteProject(projectId: string) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
  },
  async duplicateProject(projectId: string, userId: string): Promise<Project> {
    const original = await this.getProject(projectId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...rest } = original;
    return await this.createProject({ ...rest, user_id: userId, title: `${original.title} (Copy)`, status: 'draft' });
  },
};

// ── Voice service ──────────────────────────────────────────────
export const voiceService = {
  async getVoices(): Promise<Voice[]> {
    const { data, error } = await supabase.from('voices').select('*').order('name');
    if (error) throw error;
    return (data ?? []) as Voice[];
  },
};

// ── Voice Clone ────────────────────────────────────────────────
export const voiceCloneService = {
  async getVoiceClones(userId: string): Promise<VoiceClone[]> {
    const { data, error } = await supabase.from('voice_clones').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as VoiceClone[];
  },
  async createVoiceClone(voiceClone: Partial<VoiceClone>): Promise<VoiceClone> {
    const { data, error } = await supabase.from('voice_clones').insert([voiceClone]).select().single();
    if (error) throw error;
    return data as VoiceClone;
  },
  async updateVoiceClone(cloneId: string, updates: Partial<VoiceClone>): Promise<VoiceClone> {
    const { data, error } = await supabase.from('voice_clones').update(updates).eq('id', cloneId).select().single();
    if (error) throw error;
    return data as VoiceClone;
  },
  async deleteVoiceClone(cloneId: string) {
    const { error } = await supabase.from('voice_clones').delete().eq('id', cloneId);
    if (error) throw error;
  },
};

// ── Brand Kit ──────────────────────────────────────────────────
export const brandKitService = {
  async getBrandKits(userId: string): Promise<BrandKit[]> {
    const { data, error } = await supabase.from('brand_kits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as BrandKit[];
  },
  async createBrandKit(brandKit: Partial<BrandKit>): Promise<BrandKit> {
    const { data, error } = await supabase.from('brand_kits').insert([brandKit]).select().single();
    if (error) throw error;
    return data as BrandKit;
  },
  async updateBrandKit(kitId: string, updates: Partial<BrandKit>): Promise<BrandKit> {
    const { data, error } = await supabase.from('brand_kits').update(updates).eq('id', kitId).select().single();
    if (error) throw error;
    return data as BrandKit;
  },
  async deleteBrandKit(kitId: string) {
    const { error } = await supabase.from('brand_kits').delete().eq('id', kitId);
    if (error) throw error;
  },
};

// ── Templates ──────────────────────────────────────────────────
export const templateService = {
  async getTemplates(type?: string): Promise<Template[]> {
    let query = supabase.from('templates').select('*');
    if (type) query = query.eq('type', type);
    const { data, error } = await query.order('use_count', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Template[];
  },
  async incrementUseCount(templateId: string) {
    await supabase.rpc('increment_template_use_count', { template_id: templateId });
  },
};

// ── Storage ────────────────────────────────────────────────────
export const storageService = {
  async uploadAudioBlob(bucket: string, path: string, blob: Blob) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType: blob.type || 'audio/mpeg',
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
    return data;
  },
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    return data;
  },
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};

// ── Subscriptions ──────────────────────────────────────────────
export const subscriptionService = {
  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single();
    return data as Subscription | null;
  },
  async upsertSubscription(userId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase.from('subscriptions').upsert({ ...updates, user_id: userId }).select().single();
    if (error) throw error;
    return data as Subscription;
  },
};

// ── API Keys ───────────────────────────────────────────────────
export const apiKeyService = {
  async getApiKeys(userId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ApiKey[];
  },
  async createApiKey(apiKey: Partial<ApiKey>): Promise<ApiKey> {
    const { data, error } = await supabase.from('api_keys').insert([apiKey]).select().single();
    if (error) throw error;
    return data as ApiKey;
  },
  async deleteApiKey(keyId: string) {
    const { error } = await supabase.from('api_keys').delete().eq('id', keyId);
    if (error) throw error;
  },
};

// ── Usage Logs ─────────────────────────────────────────────────
export const usageService = {
  async logUsage(userId: string, type: string, units: number, projectId?: string) {
    const { error } = await supabase.from('usage_logs').insert([{
      user_id: userId, type, units,
      project_id: projectId,
      created_at: new Date().toISOString(),
    }]);
    if (error) console.warn('Usage log error:', error);
  },
  async getUsageSummary(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data, error } = await supabase.from('usage_logs').select('*').eq('user_id', userId).gte('created_at', since.toISOString()).order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

// ── Profile ────────────────────────────────────────────────────
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },
  async updateProfile(userId: string, updates: { full_name?: string; bio?: string; avatar_url?: string }) {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },
};

// ── Notifications ──────────────────────────────────────────────
export const notificationService = {
  async getNotifications(userId: string) {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data ?? [];
  },
  async markAllRead(userId: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  },
};

// ── Team Members ───────────────────────────────────────────────
export const teamService = {
  async getTeamMembers(workspaceOwnerId: string) {
    const { data, error } = await supabase.from('team_members').select('*').eq('workspace_owner_id', workspaceOwnerId).order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async inviteMember(workspaceOwnerId: string, email: string, role: string) {
    const { data, error } = await supabase.from('team_members').insert([{
      workspace_owner_id: workspaceOwnerId, email, role, status: 'pending',
    }]).select().single();
    if (error) throw error;
    return data;
  },
  async removeMember(memberId: string) {
    const { error } = await supabase.from('team_members').delete().eq('id', memberId);
    if (error) throw error;
  },
};
