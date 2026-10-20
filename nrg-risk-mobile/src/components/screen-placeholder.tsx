import { Text, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = {
  title: string;
  description: string;
};

export default function ScreenPlaceholder({ title, description }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: colors.background,
      }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{title}</Text>
      <Text style={{ marginTop: 8, textAlign: 'center', color: colors.text }}>{description}</Text>
    </View>
  );
}