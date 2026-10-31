import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import * as authApi from '@/api/auth';

type User = {
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(apiUser: authApi.ApiUser): User {
  return { name: apiUser.username, email: apiUser.email, role: apiUser.role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoggedIn: user !== null && token !== null,

      async signIn(email, password) {
        const result = await authApi.login(email.trim(), password);
        setToken(result.access_token);
        setUser(toUser(result.user));
      },

      async signUp(name, email, password) {
        const result = await authApi.register(name.trim(), email.trim(), password);
        setToken(result.access_token);
        setUser(toUser(result.user));
      },

      signOut() {
        setUser(null);
        setToken(null);
      },

      // Backend ยังไม่มี endpoint นี้ จึงยังเป็นฉบับจำลอง
      async requestPasswordReset(email) {
        await new Promise<void>((resolve) => setTimeout(resolve, 600));
        if (!email.includes('@')) {
          throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
        }
      },
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth ต้องใช้ภายใน AuthProvider');
  }
  return context;
}