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

// หน้าที่เข้าได้โดยไม่ต้องล็อกอิน
const AUTH_SCREENS = ['login', 'register', 'forgot-password'];

function RootNavigator() {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const first = (segments[0] ?? '') as string;

    // อย่าเปลี่ยนหน้าซ้ำเมื่ออยู่หน้า "ไม่พบหน้า" เพื่อกันวนลูป
    if (first === '+not-found') {
      return;
    }

    const inAuthScreen = AUTH_SCREENS.includes(first);

    if (!isLoggedIn && !inAuthScreen) {
      router.replace('/login');
    } else if (isLoggedIn && inAuthScreen) {
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