import { Text, TextInput, TextInputProps, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
};

export default function TextField({ label, style, ...rest }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor="#888888"
        {...rest}
        style={[
          {
            backgroundColor: colors.backgroundElement,
            color: colors.text,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
          },
          style,
        ]}
      />
    </View>
  );
}