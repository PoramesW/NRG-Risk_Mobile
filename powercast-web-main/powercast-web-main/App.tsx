import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DashboardScreen, LoginScreen, RegisterScreen } from '@/screens';
import { colors } from '@/utils/theme';
import { User } from '@/types';
import { logoutUser } from '@/services/auth';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {user ? (
        <DashboardScreen
          user={user}
          onLogout={async () => {
            await logoutUser();
            setUser(null);
          }}
        />
      ) : currentScreen === 'login' ? (
        <LoginScreen
          onNavigateToRegister={() => setCurrentScreen('register')}
          onLoginSuccess={setUser}
        />
      ) : (
        <RegisterScreen
          onNavigateToLogin={() => setCurrentScreen('login')}
          onRegisterSuccess={setUser}
        />
      )}
    </SafeAreaProvider>
  );
}
