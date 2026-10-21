import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthScreen({ title, subtitle, children }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>{title}</Text>
          {subtitle ? (
            <Text style={{ marginTop: 4, color: colors.text }}>{subtitle}</Text>
          ) : null}
          <View style={{ marginTop: 24, gap: 16 }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}