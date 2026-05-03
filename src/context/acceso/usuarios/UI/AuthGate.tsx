'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdapterStorage, STORAGE_KEYS } from '@shared/Infrastructure/AdapterStorage';
import { AUTH_LOGOUT_EVENT } from '@shared/Infrastructure/AdapterApi';

// Mounted inside (app) layout. Listens for forced logout events emitted by AdapterApi
// when a refresh fails or the user explicitly triggers logout. Clears auth storage
// and routes back to /login. Render-less.
export const AuthGate = () => {
  const router = useRouter();

  useEffect(() => {
    const onLogout = () => {
      AdapterStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      AdapterStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      AdapterStorage.remove(STORAGE_KEYS.USER);
      router.replace('/login');
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout as EventListener);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout as EventListener);
  }, [router]);

  // On first mount, also redirect immediately if there is no access token at all
  // (e.g. user landed on a /(app) route directly without logging in).
  useEffect(() => {
    const t = AdapterStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (!t) router.replace('/login');
  }, [router]);

  return null;
};
