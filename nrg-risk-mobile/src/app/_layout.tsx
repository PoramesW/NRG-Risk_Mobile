import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="historical" options={{ title: 'Historical Data' }} />
        <Stack.Screen name="forecast" options={{ title: 'Forecast' }} />
        <Stack.Screen name="energy-mix" options={{ title: 'Energy Mix' }} />
        <Stack.Screen name="risk" options={{ title: 'Risk Analysis' }} />
        <Stack.Screen name="assistant" options={{ title: 'AI Assistant' }} />
      </Stack>
    </ThemeProvider>
  );
}