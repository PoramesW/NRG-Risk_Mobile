import { ActivityIndicator, Text, View, useColorScheme } from 'react-native';

import PrimaryButton from '@/components/primary-button';
import { Colors } from '@/constants/theme';

export function LoadingView({ message = 'กำลังโหลดข้อมูล...' }: { message?: string }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
      <ActivityIndicator />
      <Text style={{ color: colors.text }}>{message}</Text>
    </View>
  );
}

type ErrorViewProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={{ gap: 12, paddingVertical: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
        โหลดข้อมูลไม่สำเร็จ
      </Text>
      <Text style={{ color: colors.text }}>{message}</Text>
      <PrimaryButton title="ลองอีกครั้ง" onPress={onRetry} />
    </View>
  );
}