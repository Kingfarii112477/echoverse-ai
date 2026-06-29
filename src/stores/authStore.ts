import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, SubscriptionTier } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<() => void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    set({ isLoading: true });

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Fetch profile from our profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const user: User = profile
        ? {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name || session.user.user_metadata?.full_name || '',
            avatar_url: profile.avatar_url || session.user.user_metadata?.avatar_url,
            bio: profile.bio,
            subscription_tier: (profile.subscription_tier as SubscriptionTier) || 'free',
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          }
        : {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            avatar_url: session.user.user_metadata?.avatar_url,
            subscription_tier: 'free',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          };

      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user: User = profile
          ? {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || session.user.user_metadata?.full_name || '',
              avatar_url: profile.avatar_url || session.user.user_metadata?.avatar_url,
              bio: profile.bio,
              subscription_tier: (profile.subscription_tier as SubscriptionTier) || 'free',
              created_at: profile.created_at,
              updated_at: profile.updated_at,
            }
          : {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || '',
              avatar_url: session.user.user_metadata?.avatar_url,
              subscription_tier: 'free',
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            };

        set({ user, isAuthenticated: true, isLoading: false });
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Silently refresh — keep existing user state
        set({ isLoading: false });
      }
    });

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  },
}));
