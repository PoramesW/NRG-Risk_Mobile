import type { RiskLevel } from '@/types/dashboard';

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  low: 'ความเสี่ยงต่ำ',
  medium: 'ความเสี่ยงปานกลาง',
  high: 'ความเสี่ยงสูง',
};

export const RISK_LEVEL_COLOR: Record<RiskLevel, string> = {
  low: '#16A34A',
  medium: '#F59E0B',
  high: '#DC2626',
};