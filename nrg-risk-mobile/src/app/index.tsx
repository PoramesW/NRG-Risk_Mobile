import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ModuleCard from '@/components/module-card';
import { Colors } from '@/constants/theme';

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>NRG Risk</Text>
        <Text style={{ marginTop: 4, marginBottom: 20, color: colors.text }}>
          ภาพรวมความเสี่ยงด้านพลังงาน
        </Text>

        <View style={{ gap: 12 }}>
          <ModuleCard
            title="Historical Data"
            description="ข้อมูลพลังงานย้อนหลัง"
            href="./historical"
          />
          <ModuleCard
            title="Forecast"
            description="ผลพยากรณ์ 1, 3, 6, 12 เดือน"
            href="/forecast"
          />
          <ModuleCard
            title="Energy Mix"
            description="สัดส่วนแหล่งพลังงาน"
            href="/energy-mix"
          />
          <ModuleCard
            title="Risk Analysis"
            description="Risk Score และปัจจัยเสี่ยง"
            href="/risk"
          />
          <ModuleCard
            title="AI Assistant"
            description="ถามตอบด้วยภาษาธรรมชาติ"
            href="/assistant"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}