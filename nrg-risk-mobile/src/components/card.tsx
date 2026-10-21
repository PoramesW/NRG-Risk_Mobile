import { ReactNode } from 'react';
import { Text, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

type CardProps = {
  title?: string;
  children: ReactNode;
};

export default function Card({ title, children }: CardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={{
        backgroundColor: colors.backgroundElement,
        borderRadius: 16,
        padding: 16,
        gap: 10,
      }}>
      {title ? (
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

export function SampleBadge() {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: '#FEF3C7',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}>
      <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '700' }}>
        ข้อมูลตัวอย่าง ไม่ใช่ผลวิเคราะห์จริง
      </Text>
    </View>
  );
}