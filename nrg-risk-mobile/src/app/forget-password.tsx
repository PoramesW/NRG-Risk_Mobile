import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';

import AuthScreen from '@/components/auth-screen';
import PrimaryButton from '@/components/primary-button';
import TextField from '@/components/text-field';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/auth/auth-context';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="ลืมรหัสผ่าน" subtitle="กรอกอีเมลเพื่อขอรีเซ็ตรหัสผ่าน">
      <TextField
        label="อีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@example.com"
      />

      {error ? <Text style={{ color: '#DC2626' }}>{error}</Text> : null}
      {sent ? (
        <Text style={{ color: colors.text }}>
          ส่งคำขอรีเซ็ตรหัสผ่านแล้ว (ขั้นตอนนี้เป็นการจำลอง ยังไม่มีการส่งอีเมลจริง)
        </Text>
      ) : null}

      <PrimaryButton title="ส่งคำขอรีเซ็ตรหัสผ่าน" onPress={handleSubmit} loading={loading} />

      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Link href="/login" style={{ color: colors.text, fontWeight: '700' }}>
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </View>
    </AuthScreen>
  );
}