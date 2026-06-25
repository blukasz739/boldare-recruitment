import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { UNAUTHORIZED_EVENT } from '../api/client';
import type { LoginInput, User } from '../types/auth';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../types/auth';
import { AuthContext } from './authContext';

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as User).id === 'number' &&
      typeof (parsed as User).username === 'string'
    ) {
      return parsed as User;
    }

    return null;
  } catch {
    return null;
  }
}

function persistSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return token ? readStoredUser() : null;
  });

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      queryClient.clear();
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [queryClient]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await authApi.login(input);
    persistSession(response.token, response.user);
    setUser(response.user);
  }, []);

  const register = useCallback(async (input: LoginInput) => {
    const response = await authApi.register(input);
    persistSession(response.token, response.user);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
