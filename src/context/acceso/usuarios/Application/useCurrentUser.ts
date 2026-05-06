'use client';
import { useEffect, useState } from 'react';
import { AdapterStorage, STORAGE_KEYS } from '@shared/Infrastructure/AdapterStorage';
import type { IUsuario } from '../Domain/IUsuario';

const EVENT = 'wahub:user-changed';

// Read cached user from storage. Listens to:
//   - native `storage` events (other tabs)
//   - custom `wahub:user-changed` events (same tab — dispatch after profile updates)
export const useCurrentUser = (): IUsuario | null => {
  const [user, setUser] = useState<IUsuario | null>(null);

  useEffect(() => {
    const read = () => {
      const raw = AdapterStorage.get(STORAGE_KEYS.USER);
      if (!raw) return setUser(null);
      try {
        setUser(JSON.parse(raw) as IUsuario);
      } catch {
        setUser(null);
      }
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER) read();
    };
    const onCustom = () => read();
    window.addEventListener('storage', onStorage);
    window.addEventListener(EVENT, onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(EVENT, onCustom);
    };
  }, []);

  return user;
};

// Call after writing a fresh user to storage so listeners in the same tab refresh.
export const broadcastUserChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EVENT));
};

// Full display name from nombres + primerApellido (fallback to username/email).
export const displayNameOf = (u: IUsuario | null): string => {
  if (!u) return '';
  const nombres = (u.nombres ?? '').trim();
  const apellido = (u.primerApellido ?? '').trim();
  const full = [nombres, apellido].filter(Boolean).join(' ').trim();
  return full || u.username || u.email || '';
};

// Helpers
export const initialsOf = (u: IUsuario | null): string => {
  if (!u) return '?';
  const name = (displayNameOf(u) || u.email || '').trim();
  if (!name) return '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};
