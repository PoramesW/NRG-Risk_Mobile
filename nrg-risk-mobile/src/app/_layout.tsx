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
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

// หน้าที่ต้องล็อกอินก่อนเข้า
// หน้าอื่นทั้งหมด (login, register, ลืมรหัสผ่าน) ถือเป็นหน้าสาธารณะ
const PROTECTED_SCREENS = ['index', 'historical', 'forecast', 'energy-mix', 'risk', 'assistant'];

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // รอให้อ่านโทเค็นที่เก็บไว้เสร็จก่อน ไม่งั้นจะถูกดีดไปหน้า Login ทั้งที่ล็อกอินค้างไว้
    if (isLoading) {
      return;
    }

    // หน้าแรก (/) ไม่มี segment จึงถือเป็น index
    const first = (segments[0] ?? 'index') as string;

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
  }, [isLoggedIn, isLoading, segments, router]);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="historical" options={{ title: 'Historical Data' }} />
        <Stack.Screen name="forecast" options={{ title: 'Forecast' }} />
        <Stack.Screen name="energy-mix" options={{ title: 'Energy Mix' }} />
        <Stack.Screen name="risk" options={{ title: 'Risk Analysis' }} />
        <Stack.Screen name="assistant" options={{ title: 'AI Assistant' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'สมัครสมาชิก' }} />
        <Stack.Screen name="forget-password" options={{ title: 'ลืมรหัสผ่าน' }} />
      </Stack>

      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.loading,
            { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' },
          ]}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
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

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});