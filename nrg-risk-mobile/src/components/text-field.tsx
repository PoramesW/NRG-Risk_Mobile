import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
};

export default function TextField({ label, secureTextEntry, style, ...rest }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [visible, setVisible] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.backgroundElement,
          borderRadius: 12,
          paddingHorizontal: 14,
        }}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#888888"
          {...rest}
          secureTextEntry={isPassword && !visible}
          style={[{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 16 }, style]}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setVisible((value) => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {visible ? 'ซ่อน' : 'แสดง'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}