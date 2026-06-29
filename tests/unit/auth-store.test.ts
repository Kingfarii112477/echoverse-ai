import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
  });

  it('should initialize with default state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('should set user and mark authenticated', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@echoverse.ai',
      full_name: 'Test User',
      subscription_tier: 'free' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear user on setUser(null)', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@echoverse.ai',
      full_name: 'Test User',
      subscription_tier: 'free' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setUser(null);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});
