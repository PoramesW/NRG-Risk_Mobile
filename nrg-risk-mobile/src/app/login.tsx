import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';

import AuthScreen from '@/components/auth-screen';
import PrimaryButton from '@/components/primary-button';
import TextField from '@/components/text-field';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/auth/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // ล็อกอินสำเร็จ: Stack.Protected จะพาไปหน้า Dashboard เอง
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="NRG Risk" subtitle="เข้าสู่ระบบเพื่อใช้งาน">
      <TextField
        label="อีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <TextField
        label="รหัสผ่าน"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="อย่างน้อย 6 ตัวอักษร"
      />

      {error ? <Text style={{ color: '#DC2626' }}>{error}</Text> : null}

      <PrimaryButton title="เข้าสู่ระบบ" onPress={handleSubmit} loading={loading} />

      <View style={{ alignItems: 'center', gap: 12, marginTop: 8 }}>
        <Link href="/forget-password" style={{ color: colors.text }}>
          ลืมรหัสผ่าน?
        </Link>
        <Link href="/register" style={{ color: colors.text, fontWeight: '700' }}>
          ยังไม่มีบัญชี? สมัครสมาชิก
        </Link>
      </View>
    </AuthScreen>
  );
}