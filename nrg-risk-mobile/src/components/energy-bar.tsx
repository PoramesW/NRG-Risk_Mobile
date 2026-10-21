import { Text, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import type { EnergyShare } from '@/types/dashboard';

const PALETTE = ['#2563EB', '#F59E0B', '#6B7280', '#16A34A', '#8B5CF6', '#EC4899'];

export default function EnergyBar({ shares }: { shares: EnergyShare[] }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden' }}>
        {shares.map((share, index) => (
          <View
            key={share.source}
            style={{ flex: share.percent, backgroundColor: PALETTE[index % PALETTE.length] }}
          />
        ))}
      </View>

      {shares.map((share, index) => (
        <View key={share.source} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: PALETTE[index % PALETTE.length],
            }}
          />
          <Text style={{ flex: 1, color: colors.text }}>{share.source}</Text>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{share.percent}%</Text>
        </View>
      ))}
    </View>
  );
}