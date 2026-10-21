import type { DashboardSummary } from '@/types/dashboard';

// ข้อมูลตัวอย่างเพื่อดู UI เท่านั้น ไม่ใช่ผลวิเคราะห์จริง
export const MOCK_DASHBOARD: DashboardSummary = {
  asOf: '2026-09-30',
  isSample: true,
  risk: { score: 62, level: 'medium' },
  energyMix: [
    { source: 'ก๊าซธรรมชาติ', percent: 55 },
    { source: 'พลังงานนำเข้า', percent: 20 },
    { source: 'ถ่านหิน', percent: 12 },
    { source: 'พลังงานหมุนเวียน', percent: 13 },
  ],
  forecast: {
    generatedAt: '2026-10-01',
    horizons: [
      { months: 1, status: 'ready' },
      { months: 3, status: 'ready' },
      { months: 6, status: 'ready' },
      { months: 12, status: 'pending' },
    ],
  },
  anomalies: {
    count: 2,
    latest: 'สัดส่วนพลังงานนำเข้าสูงกว่าปกติ',
  },
};