import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type User = { id: number; name: string; email: string; token?: string };

type AuthContextType = {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'mway.auth.user.v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as User;
          setUser(parsed);
        }
      })
      .finally(() => setInitializing(false));
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    initializing,
    login: async (email: string, password: string) => {
      // TODO: replace with real API
      if (!email || !password) throw new Error('Credentials required');
      const fakeUser: User = { id: 1, name: email.split('@')[0] || 'User', email, token: 'mock-token' };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fakeUser));
      setUser(fakeUser);
    },
    logout: async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    },
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


