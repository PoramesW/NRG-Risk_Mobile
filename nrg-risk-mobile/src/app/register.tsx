import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';

import AuthScreen from '@/components/auth-screen';
import PrimaryButton from '@/components/primary-button';
import TextField from '@/components/text-field';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/auth/auth-context';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (password !== confirm) {
      setError('รหัสผ่านและการยืนยันไม่ตรงกัน');
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email.trim(), password);
      // สมัครสำเร็จ (จำลอง): ล็อกอินให้ทันที แล้ว Stack.Protected พาไป Dashboard เอง
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="สมัครสมาชิก" subtitle="สร้างบัญชีใหม่">
      <TextField
        label="ชื่อ"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholder="ชื่อที่ใช้แสดง"
      />
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
      <TextField
        label="ยืนยันรหัสผ่าน"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="กรอกรหัสผ่านอีกครั้ง"
      />

      {error ? <Text style={{ color: '#DC2626' }}>{error}</Text> : null}

      <PrimaryButton title="สมัครสมาชิก" onPress={handleSubmit} loading={loading} />

      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Link href="/login" style={{ color: colors.text, fontWeight: '700' }}>
          มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
        </Link>
      </View>
    </AuthScreen>
  );
}