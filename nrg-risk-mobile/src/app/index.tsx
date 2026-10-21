import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getDashboardSummary } from '@/api/dashboard';
import { useAuth } from '@/auth/auth-context';
import DashboardSummaryView from '@/components/dashboard-summary';
import ModuleCard from '@/components/module-card';
import PrimaryButton from '@/components/primary-button';
import { ErrorView, LoadingView } from '@/components/state-views';
import { Colors } from '@/constants/theme';
import { useAsyncData } from '@/hooks/use-async-data';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { data, loading, error, reload } = useAsyncData(getDashboardSummary);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>NRG Risk</Text>
          <Text style={{ marginTop: 4, color: colors.text }}>
            สวัสดี {user?.name} · ภาพรวมความเสี่ยงด้านพลังงาน
          </Text>
        </View>

        {loading ? <LoadingView /> : null}
        {error ? <ErrorView message={error} onRetry={reload} /> : null}
        {data ? <DashboardSummaryView data={data} /> : null}

        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>โมดูล</Text>
          <ModuleCard
            title="Historical Data"
            description="ข้อมูลพลังงานย้อนหลัง"
            href="/historical"
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

        <PrimaryButton title="ออกจากระบบ" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}