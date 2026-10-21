import { MOCK_DASHBOARD } from '@/mock/dashboard';
import type { DashboardSummary } from '@/types/dashboard';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ตอนนี้คืนข้อมูลจำลอง ตอนมี Backend จริงให้เปลี่ยนเป็น fetch ที่นี่ที่เดียว
export async function getDashboardSummary(): Promise<DashboardSummary> {
  await wait(700);
  return MOCK_DASHBOARD;
}