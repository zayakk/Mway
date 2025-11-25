import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Api, UserSummary } from '@/lib/api';

type User = UserSummary;
type SessionState = { token: string; user: User };

type AuthContextType = {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'mway.auth.session.v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        let parsed: SessionState | null = null;
        try {
          parsed = JSON.parse(raw) as SessionState;
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEY);
          return;
        }
        if (!parsed?.token) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          return;
        }
        try {
          const profile = await Api.auth.me(parsed.token);
          if (!active) return;
          setToken(parsed.token);
          setUser(profile);
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ token: parsed.token, user: profile })
          );
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const persistSession = useCallback(async (session: SessionState | null) => {
    if (session) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    initializing,
    login: async (email: string, password: string) => {
      if (!email?.trim() || !password) throw new Error('Имэйл болон нууц үг шаардлагатай');
      const normalizedEmail = email.trim().toLowerCase();
      const { token: authToken, user: nextUser } = await Api.auth.login({
        email: normalizedEmail,
        password,
      });
      const session: SessionState = { token: authToken, user: nextUser };
      await persistSession(session);
      setToken(authToken);
      setUser(nextUser);
    },
    register: async (name: string, email: string, password: string) => {
      if (!name?.trim() || !email?.trim() || !password) {
        throw new Error('Нэр, имэйл, нууц үг заавал шаардлагатай');
      }
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      await Api.auth.register({
        name: trimmedName,
        email: normalizedEmail,
        password,
      });
      await persistSession(null);
      setToken(null);
      setUser(null);
    },
    logout: async () => {
      await persistSession(null);
      setToken(null);
      setUser(null);
    },
  }), [user, token, initializing, persistSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

