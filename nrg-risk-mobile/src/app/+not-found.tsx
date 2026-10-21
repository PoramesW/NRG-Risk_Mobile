import { Link, usePathname } from 'expo-router';
import { Text, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function NotFoundScreen() {
  const pathname = usePathname();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
        backgroundColor: colors.background,
      }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>ไม่พบหน้านี้</Text>
      <Text style={{ color: colors.text }}>เส้นทางที่พยายามเปิด: {pathname}</Text>
      <Link href="/login" style={{ color: colors.text, fontWeight: '700' }}>
        ไปหน้าเข้าสู่ระบบ
      </Link>
      <Link href="/" style={{ color: colors.text, fontWeight: '700' }}>
        ไปหน้า Dashboard
      </Link>
    </View>
  );
}