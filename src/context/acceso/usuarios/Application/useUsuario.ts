'use client';
import { useCallback, useState } from 'react';
import { AdapterStorage, STORAGE_KEYS } from '@shared/Infrastructure/AdapterStorage';
import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { RepositoryUsuarioImpl } from '../Infrastructure/RepositoryImpl';
import type { IAuthSession, IDtoLogin, IDtoSignUp } from '../Domain/IUsuario';

const repo = new RepositoryUsuarioImpl();

const persist = (s: IAuthSession) => {
  AdapterStorage.set(STORAGE_KEYS.ACCESS_TOKEN, s.accessToken);
  AdapterStorage.set(STORAGE_KEYS.REFRESH_TOKEN, s.refreshToken);
  AdapterStorage.set(STORAGE_KEYS.USER, JSON.stringify(s.user));
};

const clear = () => {
  AdapterStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  AdapterStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  AdapterStorage.remove(STORAGE_KEYS.USER);
};

interface UseUsuarioReturn {
  loading: boolean;
  error: string | null;
  login: (dto: IDtoLogin) => Promise<IAuthSession>;
  signUp: (dto: IDtoSignUp) => Promise<void>;
  logout: () => void;
}

export const useUsuario = (): UseUsuarioReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (dto: IDtoLogin) => {
    setLoading(true);
    setError(null);
    try {
      const session = await repo.login(dto);
      persist(session);
      return session;
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? 'Login failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (dto: IDtoSignUp) => {
    setLoading(true);
    setError(null);
    try {
      await repo.signUp(dto);
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? 'Sign up failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Best-effort backend revocation — fire and forget so UI doesn't block on it.
    AdapterApi.post('/acceso/token/logout').catch(() => {});
    clear();
    // AuthGate listens for this and redirects to /login.
    AdapterApi.triggerLogout();
  }, []);

  return { loading, error, login, signUp, logout };
};
