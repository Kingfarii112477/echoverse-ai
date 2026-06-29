import { create } from 'zustand';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  read: boolean;
  timestamp: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  currentPage: string;
  theme: 'dark';
  notifications: Notification[];
  toggleSidebar: () => void;
  setSidebarMobile: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  currentPage: 'dashboard',
  theme: 'dark',
  notifications: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarMobile: (sidebarMobileOpen) => set({ sidebarMobileOpen }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        {
          id: `notif-${Date.now()}`,
          message,
          type,
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearAllNotifications: () => set({ notifications: [] }),

  fetchNotifications: async (userId: string) => {
    try {
      const { notificationService } = await import('@/lib/supabase');
      const data = await notificationService.getNotifications(userId);
      set({
        notifications: (data as any[]).map((n) => ({
          id: n.id,
          message: n.title + (n.body ? `: ${n.body}` : ''),
          type: (n.type as 'info' | 'success' | 'error') || 'info',
          read: n.is_read,
          timestamp: n.created_at,
        })),
      });
    } catch {
      // Silently fail — notifications are non-critical
    }
  },
}));
