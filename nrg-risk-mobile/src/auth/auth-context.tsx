import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type User = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ===== ข้อมูลจำลอง: ตอนต่อ Backend จริงให้แก้เฉพาะในไฟล์นี้ =====
const wait = (ms = 600) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function checkEmail(email: string) {
  if (!email.includes('@')) {
    throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
  }
}

function checkPassword(password: string) {
  if (password.length < 6) {
    throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: user !== null,

      async signIn(email, password) {
        await wait();
        checkEmail(email);
        checkPassword(password);
        setUser({ name: email.split('@')[0], email });
      },

      async signUp(name, email, password) {
        await wait();
        if (name.trim().length === 0) {
          throw new Error('กรุณากรอกชื่อ');
        }
        checkEmail(email);
        checkPassword(password);
        setUser({ name: name.trim(), email });
      },

      signOut() {
        setUser(null);
      },

      async requestPasswordReset(email) {
        await wait();
        checkEmail(email);
      },
    }),
    [user],
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