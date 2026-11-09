import {
  ActivityLogRecord,
  AnomalyRecord,
  DateRangePreset,
  DatasetRecord,
  EnergyType,
  ForecastJobRecord,
  Granularity,
  ImportHistoryRecord,
  ManagedUserRecord,
  MenuId,
  QualityIssueRecord,
  RegionName,
  RiskFactor,
  SitemapPageId,
  SystemLogRecord,
} from '@/types';
import { tokens } from '@/utils/theme';

export interface SitemapItem {
  id: SitemapPageId;
  menu: MenuId;
  shortLabel: string;
  title: string;
  subtitle: string;
}

export const SITEMAP_PAGES: SitemapItem[] = [
  {
    id: '1.1',
    menu: 'analyze',
    shortLabel: 'Overview & Trend',
    title: 'Energy Overview & Mix',
    subtitle: 'Historical demand trends, moving averages, and carrier distribution.',
  },
  {
    id: '1.2',
    menu: 'analyze',
    shortLabel: 'Forecast vs Actual',
    title: 'Forecast vs Actual',
    subtitle: 'Compare GRU predictions against metered load and inspect residual errors.',
  },
  {
    id: '1.3',
    menu: 'analyze',
    shortLabel: 'Risk & Anomaly',
    title: 'Risk Score & Anomalies',
    subtitle: 'Evaluate operational risk drivers and triage detected telemetry outliers.',
  },
  {
    id: '2.1',
    menu: 'data',
    shortLabel: 'Datasets',
    title: 'Datasets & Freshness',
    subtitle: 'Monitor connected energy sources, coverage windows, and ingestion SLAs.',
  },
  {
    id: '2.2',
    menu: 'data',
    shortLabel: 'Import & Run',
    title: 'Data Import & Pipeline Trigger',
    subtitle: 'Ingest new files or API streams and trigger reprocessing or GRU retraining.',
  },
  {
    id: '2.3',
    menu: 'data',
    shortLabel: 'Quality & History',
    title: 'Data Quality & Import History',
    subtitle: 'Audit missing values, duplicates, schema errors, and historical ingestion runs.',
  },
  {
    id: '3.1',
    menu: 'system',
    shortLabel: 'Health Dashboard',
    title: 'System Health Dashboard',
    subtitle: 'Live status across Backend API, Data Pipeline, GRU Model, latency, and jobs.',
  },
  {
    id: '3.2',
    menu: 'system',
    shortLabel: 'Logs & Errors',
    title: 'Operational Logs & Errors',
    subtitle: 'Inspect, filter, acknowledge, and export service events across components.',
  },
  {
    id: '4.1',
    menu: 'users',
    shortLabel: 'Users',
    title: 'User Accounts & Roles',
    subtitle: 'Manage workspace members, role permissions, account status, and security controls.',
  },
  {
    id: '4.2',
    menu: 'users',
    shortLabel: 'Activity Log',
    title: 'Access & Audit Activity Log',
    subtitle: 'Track sign-ins, administrative changes, pipeline triggers, and flagged events.',
  },
];

export const INITIAL_DATASETS: DatasetRecord[] = [
  {
    id: 'DS-01',
    name: 'Grid Load Metered (National)',
    slug: 'grid-load-hourly',
    source: 'API',
    energyType: 'Electricity',
    rows: 2485200,
    rowsFormatted: '2.49M',
    coverage: '2023-01-01 to 2026-11-03',
    sizeMb: 412,
    sizeFormatted: '412 MB',
    status: 'Active',
    importedBy: 'Thanawat P.',
    importedDate: '2026-10-28',
    lastUpdated: '2 min ago (01:01)',
    freshness: 'Current',
    expectedFreq: 'Every 15 min',
    actualFreq: 'Every 15 min',
    completenessPct: 99.6,
    endpointOrFile: 'https://telemetry.egat-grid.internal/v2/load/stream',
  },
  {
    id: 'DS-02',
    name: 'Solar & Wind Generation Feed',
    slug: 'renewables-generation',
    source: 'API',
    energyType: 'Renewables',
    rows: 1184000,
    rowsFormatted: '1.18M',
    coverage: '2023-06-01 to 2026-11-03',
    sizeMb: 198,
    sizeFormatted: '198 MB',
    status: 'Active',
    importedBy: 'Ananya S.',
    importedDate: '2026-10-30',
    lastUpdated: '8 min ago (00:55)',
    freshness: 'Current',
    expectedFreq: 'Every 15 min',
    actualFreq: 'Every 16 min',
    completenessPct: 98.9,
    endpointOrFile: 'https://scada.renewables.internal/v1/generation',
  },
  {
    id: 'DS-03',
    name: 'Natural Gas Turbine Dispatch',
    slug: 'gas-turbine-dispatch',
    source: 'Database',
    energyType: 'Gas',
    rows: 964500,
    rowsFormatted: '964.5K',
    coverage: '2022-01-01 to 2026-11-02',
    sizeMb: 164,
    sizeFormatted: '164 MB',
    status: 'Active',
    importedBy: 'Nattapong K.',
    importedDate: '2026-10-25',
    lastUpdated: '47 min ago (00:16)',
    freshness: 'Delayed',
    expectedFreq: 'Every 30 min',
    actualFreq: 'Every 52 min',
    completenessPct: 97.4,
    endpointOrFile: 'postgres://dispatch-replica:5432/ccgt_telemetry',
  },
  {
    id: 'DS-04',
    name: 'Thermal & Fuel Oil Reserve Ledger',
    slug: 'oil-thermal-ledger',
    source: 'File',
    energyType: 'Oil',
    rows: 342800,
    rowsFormatted: '342.8K',
    coverage: '2023-01-01 to 2026-10-31',
    sizeMb: 68,
    sizeFormatted: '68 MB',
    status: 'Active',
    importedBy: 'Ananya S.',
    importedDate: '2026-10-31',
    lastUpdated: '2 days ago',
    freshness: 'Stalled',
    expectedFreq: 'Daily at 00:00',
    actualFreq: '49 hours elapsed',
    completenessPct: 95.8,
    endpointOrFile: 'thermal_reserve_oct2026.csv',
  },
  {
    id: 'DS-05',
    name: 'East Industrial Substation Feeder',
    slug: 'east-industrial-feeder',
    source: 'API',
    energyType: 'Electricity',
    rows: 1620400,
    rowsFormatted: '1.62M',
    coverage: '2024-01-01 to 2026-11-03',
    sizeMb: 276,
    sizeFormatted: '276 MB',
    status: 'Active',
    importedBy: 'Thanawat P.',
    importedDate: '2026-11-01',
    lastUpdated: '5 min ago (00:58)',
    freshness: 'Current',
    expectedFreq: 'Every 15 min',
    actualFreq: 'Every 15 min',
    completenessPct: 99.2,
    endpointOrFile: 'https://eec-substation.internal/api/v3/feeders',
  },
  {
    id: 'DS-06',
    name: 'Legacy Coal Archive (2019–2023)',
    slug: 'legacy-coal-archive',
    source: 'File',
    energyType: 'Oil',
    rows: 510000,
    rowsFormatted: '510K',
    coverage: '2019-01-01 to 2023-12-31',
    sizeMb: 89,
    sizeFormatted: '89 MB',
    status: 'Inactive',
    importedBy: 'Siriporn W.',
    importedDate: '2025-12-15',
    lastUpdated: 'Archived',
    freshness: 'Current',
    expectedFreq: 'Static archive',
    actualFreq: 'Static archive',
    completenessPct: 100.0,
    endpointOrFile: 'archive_thermal_2019_2023.parquet',
  },
];

export function generateTrendSeries(
  range: DateRangePreset,
  energyType: EnergyType,
  region: RegionName,
  granularity: Granularity,
) {
  const labelsByRange: Record<DateRangePreset, string[]> = {
    Today: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    '7D': ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon (Yesterday)', 'Tue (Today)', 'Peak AM', 'Midday', 'Peak PM', 'Now'],
    '30D': ['W1-A', 'W1-B', 'W1-C', 'W2-A', 'W2-B', 'W2-C', 'W3-A', 'W3-B', 'W3-C', 'W4-A', 'W4-B', 'Now'],
    '1Y': ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    Custom: ['D-11', 'D-10', 'D-9', 'D-8', 'D-7', 'D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'End'],
  };

  const baseCurve = [2.18, 2.09, 2.14, 2.42, 2.76, 2.98, 3.12, 3.24, 3.08, 3.31, 2.94, 2.72];
  const carrierScale: Record<EnergyType, number> = {
    All: 1.0,
    Electricity: 0.62,
    Renewables: 0.21,
    Gas: 0.12,
    Oil: 0.05,
  };
  const regionScale: Record<RegionName, number> = {
    'All Regions': 1.0,
    'Central Grid': 0.42,
    'East Industrial': 0.24,
    Northeast: 0.14,
    North: 0.11,
    South: 0.09,
  };
  const granOffset =
    granularity === 'Hourly' ? 0 : granularity === 'Daily' ? 0.06 : granularity === 'Weekly' ? -0.04 : 0.09;

  const mult = carrierScale[energyType] * regionScale[region];
  const values = baseCurve.map((v, idx) =>
    Number(((v + Math.sin(idx * 0.9) * 0.08 + granOffset) * mult).toFixed(2)),
  );
  const movingAvg = values.map((v, idx) => {
    const start = Math.max(0, idx - 2);
    const slice = values.slice(start, idx + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return Number(avg.toFixed(2));
  });

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const avgVal = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
  const deltaPct = range === 'Today' ? '+4.2%' : range === '7D' ? '+6.8%' : range === '30D' ? '+3.1%' : '+9.4%';

  return {
    labels: labelsByRange[range],
    values,
    movingAvg,
    minVal,
    maxVal,
    avgVal,
    deltaPct,
  };
}

export function getEnergyMixData(viewBy: 'type' | 'region', range: DateRangePreset) {
  const shift = range === 'Today' ? 0 : range === '7D' ? 2 : -1;
  if (viewBy === 'type') {
    return [
      {
        label: 'Electricity',
        share: 58 + shift,
        prevShare: 56,
        actualGwh: (18.4 * ((58 + shift) / 100)).toFixed(2),
        color: tokens.color.electricity,
      },
      {
        label: 'Renewables',
        share: 23 - shift,
        prevShare: 21,
        actualGwh: (18.4 * ((23 - shift) / 100)).toFixed(2),
        color: tokens.color.renewables,
      },
      {
        label: 'Gas',
        share: 13,
        prevShare: 15,
        actualGwh: (18.4 * 0.13).toFixed(2),
        color: tokens.color.gas,
      },
      {
        label: 'Oil',
        share: 6,
        prevShare: 8,
        actualGwh: (18.4 * 0.06).toFixed(2),
        color: tokens.color.oil,
      },
    ];
  }
  return [
    {
      label: 'Central Grid',
      share: 41 + shift,
      prevShare: 40,
      actualGwh: (18.4 * ((41 + shift) / 100)).toFixed(2),
      color: tokens.color.electricity,
    },
    {
      label: 'East Industrial',
      share: 25 - shift,
      prevShare: 24,
      actualGwh: (18.4 * ((25 - shift) / 100)).toFixed(2),
      color: tokens.color.renewables,
    },
    {
      label: 'Northeast',
      share: 14,
      prevShare: 15,
      actualGwh: (18.4 * 0.14).toFixed(2),
      color: tokens.color.gas,
    },
    {
      label: 'North & South',
      share: 20,
      prevShare: 21,
      actualGwh: (18.4 * 0.2).toFixed(2),
      color: tokens.color.oil,
    },
  ];
}

export interface ForecastPoint {
  index: number;
  label: string;
  actual: number;
  forecast: number;
  residual: number;
  residualPct: number;
  highError: boolean;
  driverNote: string;
}

export function generateForecastComparison(
  horizon: '1 Day' | '7 Days' | '30 Days',
  modelVersion: string,
  energyType: EnergyType,
): {
  points: ForecastPoint[];
  mae: string;
  rmse: string;
  mape: string;
} {
  const versionBias =
    modelVersion === 'v2.4.1-prod' ? 1.0 : modelVersion === 'v2.5.0-rc1' ? 0.82 : 1.24;
  const horizonSpread = horizon === '1 Day' ? 1.0 : horizon === '7 Days' ? 1.35 : 1.75;
  const scale = energyType === 'All' ? 1 : energyType === 'Electricity' ? 0.65 : 0.32;

  const rawActual = [2.35, 2.28, 2.52, 2.89, 3.14, 3.46, 3.18, 3.09, 3.58, 3.22, 2.91, 2.68];
  const rawError = [-0.04, 0.03, -0.05, 0.07, 0.09, 0.28, -0.06, 0.05, -0.26, 0.06, -0.04, 0.03];
  const labels =
    horizon === '1 Day'
      ? ['02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00']
      : horizon === '7 Days'
        ? ['D+1 AM', 'D+1 PM', 'D+2 AM', 'D+2 PM', 'D+3 AM', 'D+3 PM', 'D+4 AM', 'D+4 PM', 'D+5 PM', 'D+6 PM', 'D+7 AM', 'D+7 PM']
        : ['D+2', 'D+5', 'D+8', 'D+10', 'D+13', 'D+15', 'D+18', 'D+20', 'D+23', 'D+25', 'D+28', 'D+30'];

  const notes = [
    'Nominal nighttime baseload tracking.',
    'Minor wind ramp variance.',
    'Morning industrial ramp start.',
    'Commercial HVAC load pickup.',
    'Solar feed cloud transient.',
    'Unscheduled 240 MW petrochemical furnace surge + cloud cover drop.',
    'Midday solar recovery stabilized.',
    'Afternoon dispatch tracking nominal.',
    'Evening peak ramp + delayed CCGT unit synchronization (-260 MW residual).',
    'Battery storage discharge smoothed ramp.',
    'Residential off-peak step-down.',
    'Overnight baseload equilibrium.',
  ];

  const points: ForecastPoint[] = rawActual.map((a, idx) => {
    const actual = Number((a * scale).toFixed(2));
    const err = Number((rawError[idx] * versionBias * horizonSpread * scale).toFixed(2));
    const forecast = Number((actual - err).toFixed(2));
    const residualPct = Number(((Math.abs(err) / Math.max(actual, 0.1)) * 100).toFixed(1));
    return {
      index: idx,
      label: labels[idx],
      actual,
      forecast,
      residual: err,
      residualPct,
      highError: residualPct >= 5.2,
      driverNote: notes[idx],
    };
  });

  const absErrors = points.map((p) => Math.abs(p.residual));
  const maeVal = absErrors.reduce((s, v) => s + v, 0) / points.length;
  const rmseVal = Math.sqrt(points.reduce((s, p) => s + p.residual * p.residual, 0) / points.length);
  const mapeVal = points.reduce((s, p) => s + p.residualPct, 0) / points.length;

  return {
    points,
    mae: `${maeVal.toFixed(3)} GW`,
    rmse: `${rmseVal.toFixed(3)} GW`,
    mape: `${mapeVal.toFixed(2)}%`,
  };
}

export const INITIAL_RISK_FACTORS: RiskFactor[] = [
  {
    id: 'RF-01',
    name: 'Heat Index Surge (+3.4°C above seasonal norm)',
    category: 'Weather & Cooling Demand',
    contribution: 19,
    currentValue: '38.6 °C HI',
    baselineValue: '35.2 °C HI',
    energyType: 'Electricity',
    region: 'Central Grid',
    explanation:
      'Sustained afternoon heat across Central Grid increases commercial & residential cooling load by ~310 MW during 13:30–16:30.',
  },
  {
    id: 'RF-02',
    name: 'Solar Irradiance Volatility (Cloud Front)',
    category: 'Renewable Intermittency',
    contribution: 14,
    currentValue: '38% variance',
    baselineValue: '12% variance',
    energyType: 'Renewables',
    region: 'Northeast',
    explanation:
      'Fast-moving convective cloud bands over Northeast PV farms widen the 1-hour GRU confidence interval by ±145 MW.',
  },
  {
    id: 'RF-03',
    name: 'Gas Pipeline Telemetry Delay (52 min)',
    category: 'Upstream Data Freshness',
    contribution: 11,
    currentValue: '52 min lag',
    baselineValue: '< 30 min SLA',
    energyType: 'Gas',
    region: 'East Industrial',
    explanation:
      'Delayed dispatch feed from CCGT replica forces GRU state imputation on recent 2 intervals.',
  },
  {
    id: 'RF-04',
    name: 'Spinning Hydro & BESS Reserve Headroom',
    category: 'Grid Stability Buffer',
    contribution: -12,
    currentValue: '18.4% margin',
    baselineValue: '15.0% target',
    energyType: 'Electricity',
    region: 'North',
    explanation:
      'Available pumped-hydro and battery storage headroom offsets short-horizon peak ramp exposure.',
  },
  {
    id: 'RF-05',
    name: 'Weekend Industrial Tariff Curtailment',
    category: 'Demand Response',
    contribution: -6,
    currentValue: '-185 MW scheduled',
    baselineValue: '0 MW',
    energyType: 'Electricity',
    region: 'East Industrial',
    explanation:
      'Pre-committed industrial load shifting reduces peak feeder saturation probability.',
  },
];

export const INITIAL_ANOMALIES: AnomalyRecord[] = [
  {
    id: 'ANM-409',
    timestamp: '2026-11-03 00:45',
    dataset: 'grid-load-hourly',
    energyType: 'Electricity',
    region: 'East Industrial',
    type: 'Spike',
    observed: '892 MW',
    expected: '648 MW',
    deviationPct: '+37.6%',
    severity: 'Critical',
    status: 'New',
    note: '',
  },
  {
    id: 'ANM-408',
    timestamp: '2026-11-02 22:15',
    dataset: 'gas-turbine-dispatch',
    energyType: 'Gas',
    region: 'Central Grid',
    type: 'Missing',
    observed: 'NULL (3 intervals)',
    expected: '412 MW',
    deviationPct: 'Gap 45m',
    severity: 'High',
    status: 'New',
    note: 'Replica sync lag under investigation.',
  },
  {
    id: 'ANM-407',
    timestamp: '2026-11-02 15:30',
    dataset: 'renewables-generation',
    energyType: 'Renewables',
    region: 'Northeast',
    type: 'Drop',
    observed: '184 MW',
    expected: '328 MW',
    deviationPct: '-43.9%',
    severity: 'Medium',
    status: 'Reviewed',
    note: 'Verified squall line passing Korat solar cluster.',
  },
  {
    id: 'ANM-406',
    timestamp: '2026-11-02 09:00',
    dataset: 'oil-thermal-ledger',
    energyType: 'Oil',
    region: 'South',
    type: 'Flatline',
    observed: '115.00 MW (12h)',
    expected: '98–132 MW',
    deviationPct: '0.0% var',
    severity: 'Low',
    status: 'False Positive',
    note: 'Unit locked on constant baseload test schedule.',
  },
];

export const INITIAL_QUALITY_ISSUES: QualityIssueRecord[] = [
  {
    id: 'DQ-101',
    dataset: 'gas-turbine-dispatch',
    issueType: 'Missing Values',
    column: 'net_output_mw',
    affectedRows: 18,
    timeWindow: '2026-11-02 21:30 – 23:00',
    severity: 'High',
    status: 'Open',
    recommendedFix: 'Impute Median / Forward Fill',
    sampleRows: [
      { rowNum: 964481, timestamp: '2026-11-02 21:45', rawValue: 'NULL', note: 'Telemetry packet timeout' },
      { rowNum: 964482, timestamp: '2026-11-02 22:00', rawValue: 'NULL', note: 'Telemetry packet timeout' },
    ],
  },
  {
    id: 'DQ-102',
    dataset: 'renewables-generation',
    issueType: 'Duplicate Rows',
    column: 'timestamp_utc, plant_id',
    affectedRows: 42,
    timeWindow: '2026-11-02 14:00 – 16:00',
    severity: 'Medium',
    status: 'Open',
    recommendedFix: 'Remove Duplicate Rows',
    sampleRows: [
      { rowNum: 1183910, timestamp: '2026-11-02 14:15', rawValue: 'NE-SOLAR-04 | 64.2 MW', note: 'Retry webhook duplicate' },
      { rowNum: 1183911, timestamp: '2026-11-02 14:15', rawValue: 'NE-SOLAR-04 | 64.2 MW', note: 'Exact duplicate key' },
    ],
  },
  {
    id: 'DQ-103',
    dataset: 'east-industrial-feeder',
    issueType: 'Out of Range',
    column: 'power_factor',
    affectedRows: 5,
    timeWindow: '2026-11-03 00:30 – 00:45',
    severity: 'High',
    status: 'Open',
    recommendedFix: 'Clamp & Normalize',
    sampleRows: [
      { rowNum: 1620388, timestamp: '2026-11-03 00:35', rawValue: '1.42 PF', note: 'Exceeds physical bound [0, 1.0]' },
    ],
  },
  {
    id: 'DQ-104',
    dataset: 'oil-thermal-ledger',
    issueType: 'Invalid Format',
    column: 'reading_date',
    affectedRows: 11,
    timeWindow: '2026-10-31 batch',
    severity: 'Low',
    status: 'Open',
    recommendedFix: 'Clamp & Normalize',
    sampleRows: [
      { rowNum: 342790, timestamp: '31/10/2569', rawValue: 'Buddhist Era string', note: 'Expected ISO-8601 UTC' },
    ],
  },
  {
    id: 'DQ-105',
    dataset: 'oil-thermal-ledger',
    issueType: 'Time Gap',
    column: 'timestamp_utc',
    affectedRows: 48,
    timeWindow: '2026-11-01 00:00 – 2026-11-02 23:00',
    severity: 'Critical',
    status: 'Open',
    recommendedFix: 'Backfill Window',
    sampleRows: [
      { rowNum: 342800, timestamp: '2026-11-01 00:00', rawValue: '48 hourly slots missing', note: 'Daily CSV upload stalled' },
    ],
  },
];

export const INITIAL_IMPORT_HISTORY: ImportHistoryRecord[] = [
  {
    id: 'IMP-892',
    timestamp: '2026-11-03 00:45',
    dataset: 'grid-load-hourly',
    operator: 'System Scheduler',
    method: 'API Sync',
    rowsSucceeded: 960,
    rowsFailed: 0,
    status: 'Succeeded',
    errorType: 'None',
    errorMessage: 'Completed cleanly in 3.8s.',
    duration: '3.8s',
  },
  {
    id: 'IMP-891',
    timestamp: '2026-11-02 23:30',
    dataset: 'renewables-generation',
    operator: 'Ananya S.',
    method: 'CSV Upload',
    rowsSucceeded: 14280,
    rowsFailed: 42,
    status: 'Partial',
    errorType: 'Duplicate Key',
    errorMessage: '42 duplicate plant_id + timestamp rows skipped per import policy.',
    duration: '12.4s',
  },
  {
    id: 'IMP-890',
    timestamp: '2026-11-02 21:15',
    dataset: 'oil-thermal-ledger',
    operator: 'Nattapong K.',
    method: 'Excel Upload',
    rowsSucceeded: 0,
    rowsFailed: 1440,
    status: 'Failed',
    errorType: 'Schema Mismatch',
    errorMessage: 'Column "net_heat_rate" missing in sheet "Oct_31_Ledger"; transaction rolled back.',
    duration: '2.1s',
  },
  {
    id: 'IMP-889',
    timestamp: '2026-11-02 18:00',
    dataset: 'east-industrial-feeder',
    operator: 'Thanawat P.',
    method: 'Reprocess',
    rowsSucceeded: 28800,
    rowsFailed: 0,
    status: 'Succeeded',
    errorType: 'None',
    errorMessage: 'Reprocessed 7-day rolling feature window for GRU v2.4.1.',
    duration: '29.6s',
  },
];

export const INITIAL_FORECAST_JOBS: ForecastJobRecord[] = [
  {
    id: 'JOB-7421',
    startTime: '01:00:02',
    endTime: 'Running',
    duration: '01m 14s',
    horizon: '7 Days',
    modelVersion: 'v2.4.1-prod',
    status: 'Running',
    triggerType: 'Scheduled',
    triggeredBy: 'Hourly Cron',
    logLines: [
      '[01:00:02] Loaded 168h rolling tensor from grid-load-hourly & renewables-generation',
      '[01:00:19] Feature normalization complete (24 covariates)',
      '[01:00:44] Executing GRU v2.4.1 inference across 5 regional nodes...',
    ],
  },
  {
    id: 'JOB-7420',
    startTime: '00:30:00',
    endTime: '00:31:48',
    duration: '01m 48s',
    horizon: '1 Day',
    modelVersion: 'v2.4.1-prod',
    status: 'Succeeded',
    triggerType: 'Scheduled',
    triggeredBy: 'Half-Hour Dispatch',
    logLines: [
      '[00:30:00] Starting 24h short-horizon GRU inference',
      '[00:31:42] MAPE validated at 2.41% against trailing holdout',
      '[00:31:48] Published forecast series to /v2/forecasts/latest',
    ],
  },
  {
    id: 'JOB-7419',
    startTime: '23:42:10',
    endTime: '23:43:02',
    duration: '00m 52s',
    horizon: '30 Days',
    modelVersion: 'v2.5.0-rc1',
    status: 'Failed',
    triggerType: 'Manual',
    triggeredBy: 'Ananya S.',
    logLines: [
      '[23:42:10] Manual 30D shadow run requested on v2.5.0-rc1',
      '[23:42:58] ERROR: Missing exogenous fuel-oil vector from oil-thermal-ledger (gap > 24h)',
      '[23:43:02] Job aborted safely; production v2.4.1 unaffected.',
    ],
  },
  {
    id: 'JOB-7422',
    startTime: 'Queued (01:15)',
    endTime: '—',
    duration: '—',
    horizon: '1 Day',
    modelVersion: 'v2.4.1-prod',
    status: 'Queued',
    triggerType: 'Manual',
    triggeredBy: 'Thanawat P.',
    logLines: ['[01:02:11] Queued behind active regional job JOB-7421.'],
  },
];

export const INITIAL_SYSTEM_LOGS: SystemLogRecord[] = [
  {
    id: 'LOG-9921',
    timestamp: '2026-11-03 00:58:14',
    level: 'Critical',
    component: 'Pipeline',
    message: 'Daily ingestion SLA breached for dataset oil-thermal-ledger (49h without update).',
    requestOrJobId: 'PIPE-309',
    status: 'New',
    stackOrDetail:
      'Source watcher /mnt/ingest/thermal_reserve_*.csv found 0 new files since 2026-10-31T23:59Z. Downstream 30D horizon jobs referencing oil covariates will fallback or abort.',
  },
  {
    id: 'LOG-9920',
    timestamp: '2026-11-03 00:46:02',
    level: 'Warning',
    component: 'API',
    message: 'Elevated P99 latency (312 ms) on /api/v2/forecasts/residuals during batch export.',
    requestOrJobId: 'REQ-8841a',
    status: 'New',
    endpoint: 'GET /api/v2/forecasts/residuals',
    stackOrDetail:
      'Query scanned 1.4M residual rows without partition pruning on custom 1Y window. Connection pool saturation peaked at 78%.',
  },
  {
    id: 'LOG-9919',
    timestamp: '2026-11-02 23:43:02',
    level: 'Error',
    component: 'GRU',
    message: 'Shadow inference v2.5.0-rc1 aborted due to incomplete exogenous tensor.',
    requestOrJobId: 'JOB-7419',
    status: 'Acknowledged',
    stackOrDetail:
      'TensorShapeError: Expected [1, 720, 24] non-null float32; received 48 NaN slices in channel 19 (oil_reserve_mw).',
  },
  {
    id: 'LOG-9918',
    timestamp: '2026-11-02 22:19:40',
    level: 'Warning',
    component: 'Auth',
    message: '5 consecutive failed sign-in attempts detected from IP 185.220.101.44.',
    requestOrJobId: 'AUTH-551c',
    status: 'New',
    stackOrDetail:
      'Target email: marcus@powercast.energy. Rate-limiter engaged temporary 15-minute IP cooldown.',
  },
  {
    id: 'LOG-9917',
    timestamp: '2026-11-02 21:00:11',
    level: 'Info',
    component: 'GRU',
    message: 'Production GRU v2.4.1 drift check passed (rolling 7D MAPE 2.48% vs 3.50% ceiling).',
    requestOrJobId: 'CHK-204',
    status: 'Resolved',
    stackOrDetail: 'Kolmogorov-Smirnov input feature drift score: 0.041 (healthy < 0.12).',
  },
];

export const INITIAL_USERS: ManagedUserRecord[] = [
  {
    id: 'USR-1001',
    name: 'Thanawat P.',
    email: 'thanawat@powercast.energy',
    role: 'Admin',
    department: 'Power Systems & Forecast Operations',
    status: 'Active',
    createdAt: '2025-02-14',
    lastLogin: '2026-11-03 01:02',
    mfaEnabled: true,
    editHistory: [
      { date: '2026-08-10', actor: 'System', change: 'Hardware passkey enrolled' },
      { date: '2025-02-14', actor: 'System', change: 'Provisioned as Workspace Admin' },
    ],
  },
  {
    id: 'USR-1002',
    name: 'Ananya Srisawat',
    email: 'ananya@powercast.energy',
    role: 'Analyst',
    department: 'Grid Data Science & GRU Modeling',
    status: 'Active',
    createdAt: '2025-05-19',
    lastLogin: '2026-11-02 23:40',
    mfaEnabled: true,
    editHistory: [
      { date: '2026-04-02', actor: 'Thanawat P.', change: 'Promoted role from Viewer to Analyst' },
    ],
  },
  {
    id: 'USR-1003',
    name: 'Nattapong K.',
    email: 'nattapong@powercast.energy',
    role: 'Analyst',
    department: 'Pipeline & Telemetry Engineering',
    status: 'Active',
    createdAt: '2025-07-08',
    lastLogin: '2026-11-02 21:18',
    mfaEnabled: true,
    editHistory: [
      { date: '2025-07-08', actor: 'Thanawat P.', change: 'Account created (Analyst)' },
    ],
  },
  {
    id: 'USR-1004',
    name: 'Marcus Lindqvist',
    email: 'marcus@powercast.energy',
    role: 'Viewer',
    department: 'Regional Dispatch Audit',
    status: 'Pending',
    createdAt: '2026-10-29',
    lastLogin: 'Never',
    mfaEnabled: false,
    editHistory: [
      { date: '2026-10-29', actor: 'Thanawat P.', change: 'Invitation sent (Viewer)' },
    ],
  },
  {
    id: 'USR-1005',
    name: 'Siriporn Wattana',
    email: 'siriporn@powercast.energy',
    role: 'Viewer',
    department: 'External Regulatory Compliance',
    status: 'Suspended',
    createdAt: '2025-03-22',
    lastLogin: '2026-09-14 16:05',
    mfaEnabled: true,
    suspensionReason: 'Audit rotation completed; temporary external access paused.',
    editHistory: [
      { date: '2026-09-30', actor: 'Thanawat P.', change: 'Suspended: Audit rotation completed' },
    ],
  },
  {
    id: 'USR-1006',
    name: 'Kittipong R.',
    email: 'kittipong@powercast.energy',
    role: 'Admin',
    department: 'Platform Infrastructure & SRE',
    status: 'Active',
    createdAt: '2025-04-01',
    lastLogin: '2026-11-02 19:52',
    mfaEnabled: true,
    editHistory: [
      { date: '2025-04-01', actor: 'Thanawat P.', change: 'Granted Admin role for SRE operations' },
    ],
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogRecord[] = [
  {
    id: 'ACT-501',
    timestamp: '2026-11-03 01:02',
    userId: 'USR-1001',
    userName: 'Thanawat P.',
    userEmail: 'thanawat@powercast.energy',
    activity: 'Login',
    ip: '10.42.18.104',
    device: 'Chrome 131 · Windows 11',
    result: 'Success',
    detail: 'Authenticated via SSO + MFA session.',
  },
  {
    id: 'ACT-502',
    timestamp: '2026-11-02 23:42',
    userId: 'USR-1002',
    userName: 'Ananya Srisawat',
    userEmail: 'ananya@powercast.energy',
    activity: 'Forecast Trigger',
    ip: '10.42.19.22',
    device: 'Safari 18 · iPhone (iOS 18)',
    result: 'Failed',
    detail: 'Triggered manual 30D shadow job JOB-7419 on GRU v2.5.0-rc1.',
  },
  {
    id: 'ACT-503',
    timestamp: '2026-11-02 23:30',
    userId: 'USR-1002',
    userName: 'Ananya Srisawat',
    userEmail: 'ananya@powercast.energy',
    activity: 'Data Import',
    ip: '10.42.19.22',
    device: 'MacBook Pro · macOS 15',
    result: 'Success',
    detail: 'Uploaded CSV batch to renewables-generation (14,280 rows).',
  },
  {
    id: 'ACT-504',
    timestamp: '2026-11-02 22:19',
    userId: 'USR-1004',
    userName: 'Marcus Lindqvist',
    userEmail: 'marcus@powercast.energy',
    activity: 'Failed Login',
    ip: '185.220.101.44',
    device: 'Headless Linux · Unknown Client',
    result: 'Failed',
    suspicious: true,
    detail: '5 repeated failed password attempts within 90 seconds; IP rate-limited.',
  },
  {
    id: 'ACT-505',
    timestamp: '2026-11-02 22:18',
    userId: 'USR-1004',
    userName: 'Marcus Lindqvist',
    userEmail: 'marcus@powercast.energy',
    activity: 'Failed Login',
    ip: '185.220.101.44',
    device: 'Headless Linux · Unknown Client',
    result: 'Failed',
    suspicious: true,
    detail: 'Invalid credentials prior to account invitation acceptance.',
  },
  {
    id: 'ACT-506',
    timestamp: '2026-11-02 18:05',
    userId: 'USR-1001',
    userName: 'Thanawat P.',
    userEmail: 'thanawat@powercast.energy',
    activity: 'Role Change',
    ip: '10.42.18.104',
    device: 'Chrome 131 · Windows 11',
    result: 'Success',
    detail: 'Verified Analyst pipeline execution scope for Nattapong K.',
  },
];

export const API_ENDPOINTS_HEALTH = [
  { endpoint: 'GET /api/v2/forecasts/latest', code: '200', avgMs: 34, p95Ms: 68, reqMin: 420, status: 'Operational' as const },
  { endpoint: 'POST /api/v2/gru/infer', code: '200', avgMs: 118, p95Ms: 210, reqMin: 38, status: 'Operational' as const },
  { endpoint: 'GET /api/v2/forecasts/residuals', code: '200 / 504', avgMs: 164, p95Ms: 312, reqMin: 95, status: 'Slow' as const },
  { endpoint: 'POST /api/v2/datasets/ingest', code: '202', avgMs: 82, p95Ms: 145, reqMin: 24, status: 'Operational' as const },
  { endpoint: 'GET /api/v2/auth/session', code: '200 / 429', avgMs: 19, p95Ms: 41, reqMin: 310, status: 'Operational' as const },
];

export const PIPELINE_STAGES = [
  {
    id: 'STG-1',
    stage: 'Extract & Stream Ingest',
    status: 'Operational' as const,
    lastRun: '01:00 (2m ago)',
    nextRun: '01:15 (in 13m)',
    duration: '4.2s',
    backlog: '0 batches',
    detail: 'SCADA & API webhooks streaming normally; 1 static file watcher (oil-thermal) awaiting upload.',
  },
  {
    id: 'STG-2',
    stage: 'Clean, Deduplicate & Validate',
    status: 'Slow' as const,
    lastRun: '01:00 (2m ago)',
    nextRun: '01:15 (in 13m)',
    duration: '18.7s',
    backlog: '2 batches queued',
    detail: 'Applying forward-fill imputation on 3 delayed CCGT intervals and deduplicating solar webhook retries.',
  },
  {
    id: 'STG-3',
    stage: 'Feature Tensor Store',
    status: 'Operational' as const,
    lastRun: '01:01 (1m ago)',
    nextRun: '01:16 (in 14m)',
    duration: '6.1s',
    backlog: '0 batches',
    detail: '24-channel rolling tensors synchronized to TimescaleDB & Redis inference cache.',
  },
];

export const GRU_MODELS = [
  {
    version: 'v2.4.1-prod',
    trainedAt: '2026-10-29 03:20',
    mae: '0.074 GW',
    rmse: '0.112 GW',
    mape: '2.48%',
    driftScore: '0.041 (Healthy)',
    driftTrend: [2.31, 2.35, 2.38, 2.42, 2.40, 2.45, 2.48],
    status: 'Ready' as const,
  },
  {
    version: 'v2.5.0-rc1',
    trainedAt: '2026-11-02 19:10',
    mae: '0.068 GW',
    rmse: '0.104 GW',
    mape: '2.21%',
    driftScore: '0.029 (Calibrating)',
    driftTrend: [2.44, 2.38, 2.31, 2.29, 2.25, 2.23, 2.21],
    status: 'Training' as const,
  },
  {
    version: 'v2.3.8-stable',
    trainedAt: '2026-09-15 02:00',
    mae: '0.096 GW',
    rmse: '0.149 GW',
    mape: '3.19%',
    driftScore: '0.118 (Near threshold)',
    driftTrend: [2.72, 2.81, 2.89, 2.95, 3.04, 3.12, 3.19],
    status: 'Degraded' as const,
  },
];

