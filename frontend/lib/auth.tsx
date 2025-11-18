import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type User = { id: number; name: string; email: string; token?: string };
type StoredUser = User & { password: string };

type AuthContextType = {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'mway.auth.user.v1';
const USERS_KEY = 'mway.auth.users.v1';

async function readStoredUsers(): Promise<StoredUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse stored users', e);
    return [];
  }
}

async function writeStoredUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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
      if (!email?.trim() || !password) throw new Error('Имэйл болон нууц үг шаардлагатай');
      const normalizedEmail = email.trim().toLowerCase();
      const users = await readStoredUsers();
      const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!found || found.password !== password) {
        throw new Error('Имэйл эсвэл нууц үг буруу байна');
      }
      const sessionUser: User = { id: found.id, name: found.name, email: found.email };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
    },
    register: async (name: string, email: string, password: string) => {
      if (!name?.trim() || !email?.trim() || !password) {
        throw new Error('Нэр, имэйл, нууц үг заавал шаардлагатай');
      }
      const normalizedEmail = email.trim().toLowerCase();
      const users = await readStoredUsers();
      if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        throw new Error('Энэ имэйлээр аль хэдийн бүртгэл хийгдсэн байна');
      }
      const newUser: StoredUser = {
        id: Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password,
      };
      await writeStoredUsers([...users, newUser]);
      const sessionUser: User = { id: newUser.id, name: newUser.name, email: newUser.email };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
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


