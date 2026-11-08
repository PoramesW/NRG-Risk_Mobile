import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import * as authApi from '@/api/auth';
import { ApiError } from '@/api/client';

type User = {
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'nrg_auth_token';

function toUser(apiUser: authApi.ApiUser): User {
  return { name: apiUser.username, email: apiUser.email, role: apiUser.role };
}

async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // เก็บไม่สำเร็จไม่ถือว่าล็อกอินล้มเหลว แค่รอบหน้าต้องล็อกอินใหม่
  }
}

async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ไม่ทำอะไร
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ตอนเปิดแอป: อ่านโทเค็นที่เก็บไว้ แล้วให้ Backend ตรวจว่ายังใช้ได้อยู่
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!saved) {
          return;
        }
        const me = await authApi.fetchMe(saved);
        if (!cancelled) {
          setToken(saved);
          setUser(toUser(me));
        }
      } catch (error) {
        // โทเค็นหมดอายุหรือไม่ถูกต้อง -> ลบทิ้ง
        // ถ้าแค่เชื่อมต่อ Backend ไม่ได้ (status 0) -> เก็บโทเค็นไว้ลองใหม่รอบหน้า
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          await clearToken();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoggedIn: user !== null && token !== null,
      isLoading,

      async signIn(email, password) {
        const result = await authApi.login(email.trim(), password);
        await saveToken(result.access_token);
        setToken(result.access_token);
        setUser(toUser(result.user));
      },

      async signUp(name, email, password) {
        const result = await authApi.register(name.trim(), email.trim(), password);
        await saveToken(result.access_token);
        setToken(result.access_token);
        setUser(toUser(result.user));
      },

      signOut() {
        setUser(null);
        setToken(null);
        clearToken();
      },

      // Backend ยังไม่มี endpoint นี้ จึงยังเป็นฉบับจำลอง
      async requestPasswordReset(email) {
        await new Promise<void>((resolve) => setTimeout(resolve, 600));
        if (!email.includes('@')) {
          throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
        }
      },
    }),
    [user, token, isLoading],
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