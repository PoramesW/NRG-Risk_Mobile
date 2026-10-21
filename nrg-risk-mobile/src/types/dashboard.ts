export type RiskLevel = 'low' | 'medium' | 'high';

export type EnergyShare = {
  source: string;
  percent: number;
};

export type ForecastStatus = 'ready' | 'pending' | 'failed';

export type ForecastHorizon = {
  months: 1 | 3 | 6 | 12;
  status: ForecastStatus;
};

export type DashboardSummary = {
  asOf: string; // วันที่ของข้อมูล รูปแบบ YYYY-MM-DD
  isSample: boolean;
  risk: {
    score: number;
    level: RiskLevel;
  };
  energyMix: EnergyShare[];
  forecast: {
    generatedAt: string | null; // วันที่สร้างผลพยากรณ์ ถ้ายังไม่มีเป็น null
    horizons: ForecastHorizon[];
  };
  anomalies: {
    count: number;
    latest: string | null;
  };
};