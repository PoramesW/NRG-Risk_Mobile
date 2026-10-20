import { Href, Link } from 'expo-router';
import { Pressable, Text, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = {
  title: string;
  description: string;
  href: Href;
};

export default function ModuleCard({ title, description, href }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: colors.backgroundElement,
          borderRadius: 16,
          padding: 20,
          opacity: pressed ? 0.7 : 1,
        })}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
        <Text style={{ marginTop: 4, color: colors.text }}>{description}</Text>
      </Pressable>
    </Link>
  );
}