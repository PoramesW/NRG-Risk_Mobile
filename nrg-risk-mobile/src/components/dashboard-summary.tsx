import { Text, View, useColorScheme } from 'react-native';

import Card, { SampleBadge } from '@/components/card';
import EnergyBar from '@/components/energy-bar';
import { Colors } from '@/constants/theme';
import { RISK_LEVEL_COLOR, RISK_LEVEL_LABEL } from '@/constants/risk';
import type { DashboardSummary, ForecastStatus } from '@/types/dashboard';
import { formatThaiDate } from '@/utils/format';

const STATUS_LABEL: Record<ForecastStatus, string> = {
  ready: 'พร้อมใช้งาน',
  pending: 'กำลังประมวลผล',
  failed: 'ล้มเหลว',
};

const STATUS_COLOR: Record<ForecastStatus, string> = {
  ready: '#16A34A',
  pending: '#F59E0B',
  failed: '#DC2626',
};

export default function DashboardSummaryView({ data }: { data: DashboardSummary }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const riskColor = RISK_LEVEL_COLOR[data.risk.level];

  return (
    <View style={{ gap: 16 }}>
      {data.isSample ? <SampleBadge /> : null}

      <Card title="Risk Score">
        <Text style={{ fontSize: 48, fontWeight: '700', color: riskColor }}>
          {data.risk.score}
        </Text>
        <Text style={{ color: riskColor, fontWeight: '700' }}>
          {RISK_LEVEL_LABEL[data.risk.level]}
        </Text>
        <Text style={{ color: colors.text }}>ข้อมูล ณ วันที่ {formatThaiDate(data.asOf)}</Text>
      </Card>

      <Card title="Energy Mix">
        <EnergyBar shares={data.energyMix} />
        <Text style={{ color: colors.text }}>ข้อมูล ณ วันที่ {formatThaiDate(data.asOf)}</Text>
      </Card>

      <Card title="ผลพยากรณ์">
        {data.forecast.horizons.map((horizon) => (
          <View
            key={horizon.months}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text }}>ล่วงหน้า {horizon.months} เดือน</Text>
            <Text style={{ color: STATUS_COLOR[horizon.status], fontWeight: '700' }}>
              {STATUS_LABEL[horizon.status]}
            </Text>
          </View>
        ))}
        <Text style={{ color: colors.text }}>
          {data.forecast.generatedAt
            ? `สร้างเมื่อ ${formatThaiDate(data.forecast.generatedAt)}`
            : 'ยังไม่มีผลพยากรณ์'}
        </Text>
      </Card>

      <Card title="ความผิดปกติ">
        {data.anomalies.count === 0 ? (
          <Text style={{ color: colors.text }}>ไม่พบความผิดปกติ</Text>
        ) : (
          <>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              พบ {data.anomalies.count} รายการ
            </Text>
            {data.anomalies.latest ? (
              <Text style={{ color: colors.text }}>ล่าสุด: {data.anomalies.latest}</Text>
            ) : null}
          </>
        )}
      </Card>
    </View>
  );
}