import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

// หน้าที่ต้องล็อกอินก่อนเข้า
// หน้าอื่นทั้งหมด (login, register, ลืมรหัสผ่าน) ถือเป็นหน้าสาธารณะ
const PROTECTED_SCREENS = ['index', 'historical', 'forecast', 'energy-mix', 'risk', 'assistant'];

function RootNavigator() {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // หน้าแรก (/) ไม่มี segment จึงถือเป็น index
    const first = (segments[0] ?? 'index') as string;

    // บันทึกไว้ดูตอนตรวจปัญหา ลบทิ้งได้เมื่อระบบนำทางนิ่งแล้ว
    console.log('[nav]', { segments, isLoggedIn });

    // อย่าเปลี่ยนหน้าซ้ำเมื่ออยู่หน้า "ไม่พบหน้า" เพื่อกันวนลูป
    if (first === '+not-found') {
      return;
    }

    const isProtected = PROTECTED_SCREENS.includes(first);

    if (!isLoggedIn && isProtected) {
      router.replace('/login');
    } else if (isLoggedIn && !isProtected) {
      router.replace('/');
    }
  }, [isLoggedIn, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="historical" options={{ title: 'Historical Data' }} />
      <Stack.Screen name="forecast" options={{ title: 'Forecast' }} />
      <Stack.Screen name="energy-mix" options={{ title: 'Energy Mix' }} />
      <Stack.Screen name="risk" options={{ title: 'Risk Analysis' }} />
      <Stack.Screen name="assistant" options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'สมัครสมาชิก' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'ลืมรหัสผ่าน' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}