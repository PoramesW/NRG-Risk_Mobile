export type UserRole = 'Admin' | 'Analyst' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  department: string;
}

export type MenuId = 'analyze' | 'data' | 'system' | 'users';

export type SitemapPageId =
  | '1.1' // Overview / Trend
  | '1.2' // Forecast vs Actual
  | '1.3' // Risk & Anomaly
  | '2.1' // Datasets
  | '2.2' // Import
  | '2.3' // Data Quality & History
  | '3.1' // Health Dashboard
  | '3.2' // Logs & Errors
  | '4.1' // Users
  | '4.2'; // Activity Log

export type DateRangePreset = 'Today' | '7D' | '30D' | '1Y' | 'Custom';
export type Granularity = 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
export type EnergyType = 'All' | 'Electricity' | 'Oil' | 'Gas' | 'Renewables';
export type RegionName =
  | 'All Regions'
  | 'Central Grid'
  | 'North'
  | 'Northeast'
  | 'East Industrial'
  | 'South';

export interface SharedFiltersState {
  dateRange: DateRangePreset;
  customStart: string;
  customEnd: string;
  granularity: Granularity;
  energyType: EnergyType;
  region: RegionName;
  dataset: string;
  status: string;
  search: string;
  operator: string;
}

export type RiskTier = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskFactor {
  id: string;
  name: string;
  category: string;
  contribution: number; // positive increases risk, negative reduces risk
  currentValue: string;
  baselineValue: string;
  energyType: EnergyType;
  region: RegionName;
  explanation: string;
}

export type AnomalyType = 'Spike' | 'Drop' | 'Flatline' | 'Missing';
export type AnomalyStatus = 'New' | 'Reviewed' | 'False Positive';

export interface AnomalyRecord {
  id: string;
  timestamp: string;
  dataset: string;
  energyType: Exclude<EnergyType, 'All'>;
  region: Exclude<RegionName, 'All Regions'>;
  type: AnomalyType;
  observed: string;
  expected: string;
  deviationPct: string;
  severity: RiskTier;
  status: AnomalyStatus;
  note: string;
}

export type DatasetSource = 'API' | 'File' | 'Database';
export type FreshnessStatus = 'Current' | 'Delayed' | 'Stalled';

export interface DatasetRecord {
  id: string;
  name: string;
  slug: string;
  source: DatasetSource;
  energyType: Exclude<EnergyType, 'All'>;
  rows: number;
  rowsFormatted: string;
  coverage: string;
  sizeMb: number;
  sizeFormatted: string;
  status: 'Active' | 'Inactive';
  importedBy: string;
  importedDate: string;
  lastUpdated: string;
  freshness: FreshnessStatus;
  expectedFreq: string;
  actualFreq: string;
  completenessPct: number;
  endpointOrFile: string;
}

export type QualityIssueType =
  | 'Missing Values'
  | 'Duplicate Rows'
  | 'Out of Range'
  | 'Invalid Format'
  | 'Time Gap';

export interface QualityIssueRecord {
  id: string;
  dataset: string;
  issueType: QualityIssueType;
  column: string;
  affectedRows: number;
  timeWindow: string;
  severity: RiskTier;
  status: 'Open' | 'Resolved';
  recommendedFix: 'Impute Median / Forward Fill' | 'Remove Duplicate Rows' | 'Clamp & Normalize' | 'Backfill Window';
  sampleRows: { rowNum: number; timestamp: string; rawValue: string; note: string }[];
}

export interface ImportHistoryRecord {
  id: string;
  timestamp: string;
  dataset: string;
  operator: string;
  method: 'CSV Upload' | 'Excel Upload' | 'JSON Upload' | 'API Sync' | 'Reprocess';
  rowsSucceeded: number;
  rowsFailed: number;
  status: 'Succeeded' | 'Partial' | 'Failed';
  errorType: 'None' | 'Schema Mismatch' | 'Timeout' | 'Duplicate Key' | 'Parse Error';
  errorMessage: string;
  duration: string;
}

export interface ForecastJobRecord {
  id: string;
  startTime: string;
  endTime: string;
  duration: string;
  horizon: '1 Day' | '7 Days' | '30 Days';
  modelVersion: string;
  status: 'Queued' | 'Running' | 'Succeeded' | 'Failed';
  triggerType: 'Scheduled' | 'Manual';
  triggeredBy: string;
  logLines: string[];
}

export type LogLevel = 'Info' | 'Warning' | 'Error' | 'Critical';
export type SystemComponentName = 'API' | 'Pipeline' | 'GRU' | 'Auth';
export type LogAckStatus = 'New' | 'Acknowledged' | 'Resolved';

export interface SystemLogRecord {
  id: string;
  timestamp: string;
  level: LogLevel;
  component: SystemComponentName;
  message: string;
  requestOrJobId: string;
  status: LogAckStatus;
  endpoint?: string;
  stackOrDetail: string;
}

export type AccountStatus = 'Active' | 'Suspended' | 'Pending';

export interface ManagedUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: AccountStatus;
  createdAt: string;
  lastLogin: string;
  mfaEnabled: boolean;
  suspensionReason?: string;
  editHistory: { date: string; actor: string; change: string }[];
}

export type ActivityType =
  | 'Login'
  | 'Logout'
  | 'Failed Login'
  | 'Role Change'
  | 'Data Import'
  | 'Forecast Trigger'
  | 'Account Action';

export interface ActivityLogRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  activity: ActivityType;
  ip: string;
  device: string;
  result: 'Success' | 'Failed';
  suspicious?: boolean;
  detail: string;
}
