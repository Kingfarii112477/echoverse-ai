'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    initialize().then((fn) => { unsub = fn; });
    return () => { unsub?.(); };
  }, [initialize]);

  return <>{children}</>;
}
