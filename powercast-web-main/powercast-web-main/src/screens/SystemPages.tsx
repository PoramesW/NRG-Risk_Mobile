import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  CheckCheck,
  Clock,
  Cpu,
  Download,
  FileTerminal,
  GitBranch,
  RotateCcw,
  Server,
  XCircle,
} from 'lucide-react-native';
import {
  ForecastJobRecord,
  LogAckStatus,
  LogLevel,
  SharedFiltersState,
  SitemapPageId,
  SystemComponentName,
  SystemLogRecord,
  UserRole,
} from '@/types';
import {
  API_ENDPOINTS_HEALTH,
  GRU_MODELS,
  PIPELINE_STAGES,
} from '@/services/adminMockData';
import {
  ConfirmActionModal,
  DetailDrawerSheet,
  KeyValueGrid,
  SectionTitleBlock,
  SelectPill,
  SoftButton,
  StatusPill,
  SurfaceCard,
  ToggleSwitch,
} from '@/components/AdminPrimitives';
import { SharedFilterBar } from '@/components/SharedFilterBar';
import { LatencyPercentileChart } from '@/components/EnergyCharts';
import { colors, fonts, typography } from '@/utils/theme';

interface SystemPagesProps {
  pageId: Extract<SitemapPageId, '3.1' | '3.2'>;
  filters: SharedFiltersState;
  onUpdateFilters: (patch: Partial<SharedFiltersState>) => void;
  onResetFilters: () => void;
  jobs: ForecastJobRecord[];
  onRerunJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  logs: SystemLogRecord[];
  onUpdateLogStatus: (logId: string, status: LogAckStatus) => void;
  onAcknowledgeAllNewLogs: () => void;
  activeRole: UserRole;
  onNotify: (msg: string) => void;
}

export function SystemPages(props: SystemPagesProps) {
  if (props.pageId === '3.1') return <HealthDashboardPage {...props} />;
  return <LogsAndErrorsPage {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Page 3.1: Health Dashboard                                                 */
/* -------------------------------------------------------------------------- */
function HealthDashboardPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  jobs,
  onRerunJob,
  onCancelJob,
  activeRole,
  onNotify,
}: SystemPagesProps) {
  const { width } = useWindowDimensions();
  const isStacked = width < 1000;

  const [sysWindow, setSysWindow] = useState<'1h' | '24h' | '7d' | 'Custom'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshFreq, setRefreshFreq] = useState<'15s' | '30s' | '60s'>('30s');
  const [secondsLeft, setSecondsLeft] = useState(30);

  // Component-specific filters
  const [apiEndpointFilter, setApiEndpointFilter] = useState('All Endpoints');
  const [apiCodeFilter, setApiCodeFilter] = useState<'All Codes' | '2xx' | '4xx/5xx'>('All Codes');
  const [pipelineStageFilter, setPipelineStageFilter] = useState('All Stages');
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState<'All' | 'Operational' | 'Slow'>(
    'All',
  );
  const [gruVersionFilter, setGruVersionFilter] = useState('v2.4.1-prod');
  const [latencyEndpoint, setLatencyEndpoint] = useState('All Endpoints');
  const [latencyResolution, setLatencyResolution] = useState<'1m' | '5m' | '1h'>('5m');
  const [jobStatusFilter, setJobStatusFilter] = useState<
    'All' | 'Queued' | 'Running' | 'Succeeded' | 'Failed'
  >('All');
  const [jobTriggerFilter, setJobTriggerFilter] = useState<'All' | 'Scheduled' | 'Manual'>('All');

  // Drawers & Modals
  const [inspectedCard, setInspectedCard] = useState<
    null | 'api' | 'pipeline' | 'gru' | 'latency'
  >(null);
  const [selectedJob, setSelectedJob] = useState<ForecastJobRecord | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ForecastJobRecord | null>(null);

  const canOperateJobs = activeRole !== 'Viewer';

  useEffect(() => {
    const total = refreshFreq === '15s' ? 15 : refreshFreq === '30s' ? 30 : 60;
    setSecondsLeft(total);
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? total : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshFreq]);

  const filteredEndpoints = useMemo(() => {
    return API_ENDPOINTS_HEALTH.filter((ep) => {
      if (apiEndpointFilter !== 'All Endpoints' && ep.endpoint !== apiEndpointFilter) return false;
      if (apiCodeFilter === '2xx' && ep.code.includes('504')) return false;
      if (apiCodeFilter === '4xx/5xx' && !ep.code.includes('504') && !ep.code.includes('429'))
        return false;
      return true;
    });
  }, [apiEndpointFilter, apiCodeFilter]);

  const filteredStages = useMemo(() => {
    return PIPELINE_STAGES.filter((st) => {
      if (pipelineStageFilter !== 'All Stages' && st.stage !== pipelineStageFilter) return false;
      if (pipelineStatusFilter !== 'All' && st.status !== pipelineStatusFilter) return false;
      return true;
    });
  }, [pipelineStageFilter, pipelineStatusFilter]);

  const selectedGru = useMemo(
    () => GRU_MODELS.find((m) => m.version === gruVersionFilter) ?? GRU_MODELS[0],
    [gruVersionFilter],
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (jobStatusFilter !== 'All' && j.status !== jobStatusFilter) return false;
      if (jobTriggerFilter !== 'All' && j.triggerType !== jobTriggerFilter) return false;
      return true;
    });
  }, [jobs, jobStatusFilter, jobTriggerFilter]);

  return (
    <View style={styles.pageStack}>
      {/* Global System Filter Bar */}
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={onResetFilters}
        showDateRange
        datePresets={['1h', '24h', '7d', 'Custom'] as const}
        customDateValue={sysWindow}
        onCustomPresetChange={(v) => setSysWindow(v as '1h' | '24h' | '7d' | 'Custom')}
        extraInline={
          <View style={styles.inlineControls}>
            <ToggleSwitch
              label={autoRefresh ? `Auto-refresh (${secondsLeft}s)` : 'Auto-refresh off'}
              checked={autoRefresh}
              onChange={setAutoRefresh}
            />
            {autoRefresh && (
              <SelectPill
                label="Every"
                value={refreshFreq}
                options={['15s', '30s', '60s'] as const}
                onChange={setRefreshFreq}
              />
            )}
          </View>
        }
      />

      {/* Interactive Component Status Cards */}
      <SurfaceCard>
        <SectionTitleBlock
          title="Core Component Status"
          subtitle="Tap any component tile to inspect diagnostic breakdown"
        />
        <View style={styles.componentGrid}>
          <Pressable
            onPress={() => setInspectedCard('api')}
            style={styles.componentTile}
          >
            <View style={styles.tileTop}>
              <Server size={18} color={colors.primary} />
              <StatusPill label="Operational" />
            </View>
            <Text style={styles.tileTitle}>Backend API</Text>
            <Text style={styles.tileMetric}>99.96% uptime</Text>
            <Text style={styles.rowMeta}>53.2K req · 0.18% 4xx/5xx</Text>
          </Pressable>

          <Pressable
            onPress={() => setInspectedCard('pipeline')}
            style={styles.componentTile}
          >
            <View style={styles.tileTop}>
              <GitBranch size={18} color={colors.amber} />
              <StatusPill label="Slow" />
            </View>
            <Text style={styles.tileTitle}>Data Pipeline</Text>
            <Text style={styles.tileMetric}>2 batches queued</Text>
            <Text style={styles.rowMeta}>Last 01:01 · Next 01:15</Text>
          </Pressable>

          <Pressable
            onPress={() => setInspectedCard('gru')}
            style={styles.componentTile}
          >
            <View style={styles.tileTop}>
              <Cpu size={18} color={colors.teal} />
              <StatusPill label={selectedGru.status} />
            </View>
            <Text style={styles.tileTitle}>GRU Model ({selectedGru.version})</Text>
            <Text style={styles.tileMetric}>{selectedGru.mape} MAPE</Text>
            <Text style={styles.rowMeta}>Drift {selectedGru.driftScore}</Text>
          </Pressable>

          <Pressable
            onPress={() => setInspectedCard('latency')}
            style={styles.componentTile}
          >
            <View style={styles.tileTop}>
              <Clock size={18} color={colors.violet} />
              <StatusPill label="P95 · 88 ms" tone="info" />
            </View>
            <Text style={styles.tileTitle}>Response Time</Text>
            <Text style={styles.tileMetric}>42 ms avg</Text>
            <Text style={styles.rowMeta}>P99 218 ms (warn 250 ms)</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <View style={[styles.twoCol, isStacked && styles.twoColStacked]}>
        {/* 3.1 Backend API + 3.2 Data Pipeline */}
        <SurfaceCard style={{ flex: 1.15 }}>
          <SectionTitleBlock
            title="Backend API Endpoints"
            subtitle="Per-route health, status codes, and latency"
            right={
              <View style={styles.inlineControls}>
                <SelectPill
                  label="Route"
                  value={apiEndpointFilter}
                  options={[
                    'All Endpoints',
                    ...API_ENDPOINTS_HEALTH.map((e) => e.endpoint),
                  ]}
                  onChange={setApiEndpointFilter}
                />
                <SelectPill
                  label="Code"
                  value={apiCodeFilter}
                  options={['All Codes', '2xx', '4xx/5xx'] as const}
                  onChange={setApiCodeFilter}
                />
              </View>
            }
          />
          <View style={styles.listStack}>
            {filteredEndpoints.map((ep) => (
              <View key={ep.endpoint} style={styles.endpointRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.monoStrongText}>{ep.endpoint}</Text>
                  <Text style={styles.rowMeta}>
                    HTTP {ep.code} · {ep.reqMin} req/min
                  </Text>
                </View>
                <View style={styles.inlineControls}>
                  <Text style={styles.monoSub}>
                    {ep.avgMs} ms / P95 {ep.p95Ms} ms
                  </Text>
                  <StatusPill label={ep.status} />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.innerSectionDivider}>
            <SectionTitleBlock
              title="Data Pipeline Stages"
              subtitle="Extract -> Clean -> Feature Store execution flow"
              right={
                <View style={styles.inlineControls}>
                  <SelectPill
                    label="Stage"
                    value={pipelineStageFilter}
                    options={['All Stages', ...PIPELINE_STAGES.map((s) => s.stage)]}
                    onChange={setPipelineStageFilter}
                  />
                  <SelectPill
                    label="State"
                    value={pipelineStatusFilter}
                    options={['All', 'Operational', 'Slow'] as const}
                    onChange={setPipelineStatusFilter}
                  />
                </View>
              }
            />
            {filteredStages.map((st, idx) => (
              <View key={st.id} style={styles.endpointRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.rowTitle}>
                    {idx + 1}. {st.stage}
                  </Text>
                  <Text style={styles.rowMeta}>
                    Last {st.lastRun} · Next {st.nextRun} · Duration {st.duration} · {st.backlog}
                  </Text>
                </View>
                <StatusPill label={st.status} />
              </View>
            ))}
          </View>
        </SurfaceCard>

        {/* 3.6 Response Time + 3.3 GRU Model Health */}
        <SurfaceCard style={{ flex: 1 }}>
          <SectionTitleBlock
            title="Response Time Percentiles"
            subtitle={`Avg 42 ms · P95 88 ms · P99 218 ms (${sysWindow})`}
            right={
              <View style={styles.inlineControls}>
                <SelectPill
                  label="Endpoint"
                  value={latencyEndpoint}
                  options={['All Endpoints', 'GET /forecasts/residuals', 'POST /gru/infer']}
                  onChange={setLatencyEndpoint}
                />
                <SelectPill
                  label="Step"
                  value={latencyResolution}
                  options={['1m', '5m', '1h'] as const}
                  onChange={setLatencyResolution}
                />
              </View>
            }
          />
          <LatencyPercentileChart
            avgSeries={
              latencyEndpoint === 'All Endpoints'
                ? [38, 41, 39, 44, 48, 43, 40, 42]
                : [110, 128, 145, 168, 174, 152, 148, 164]
            }
            p95Series={
              latencyEndpoint === 'All Endpoints'
                ? [78, 84, 82, 95, 108, 92, 86, 88]
                : [185, 204, 226, 260, 274, 240, 228, 242]
            }
            p99Series={
              latencyEndpoint === 'All Endpoints'
                ? [164, 178, 190, 244, 268, 225, 210, 218]
                : [240, 268, 290, 325, 342, 315, 298, 312]
            }
          />
          <Text style={[styles.rowMeta, { marginTop: 8 }]}>
            Slowest route: GET /api/v2/forecasts/residuals (P95 312 ms · Warning threshold 250 ms)
          </Text>

          <View style={styles.innerSectionDivider}>
            <SectionTitleBlock
              title="GRU Neural Model Telemetry"
              subtitle={`Trained ${selectedGru.trainedAt}`}
              right={
                <SelectPill
                  label="Version"
                  value={gruVersionFilter}
                  options={GRU_MODELS.map((m) => m.version)}
                  onChange={setGruVersionFilter}
                />
              }
            />
            <KeyValueGrid
              items={[
                { label: 'Model State', value: selectedGru.status },
                { label: 'Current MAE', value: selectedGru.mae, mono: true },
                { label: 'Current RMSE', value: selectedGru.rmse, mono: true },
                { label: 'Current MAPE', value: selectedGru.mape, mono: true },
              ]}
            />
            <Text style={[styles.rowMeta, { marginTop: 10 }]}>
              7-Interval Rolling MAPE Drift: {selectedGru.driftTrend.join('% -> ')}% ({selectedGru.driftScore})
            </Text>
          </View>
        </SurfaceCard>
      </View>

      {/* 3.4 Forecast Jobs Table */}
      <SurfaceCard>
        <SectionTitleBlock
          title="Forecast Execution Jobs"
          subtitle="Scheduled and operator-triggered GRU inference runs"
          right={
            <View style={styles.inlineControls}>
              <SelectPill
                label="Status"
                value={jobStatusFilter}
                options={['All', 'Queued', 'Running', 'Succeeded', 'Failed'] as const}
                onChange={setJobStatusFilter}
              />
              <SelectPill
                label="Trigger"
                value={jobTriggerFilter}
                options={['All', 'Scheduled', 'Manual'] as const}
                onChange={setJobTriggerFilter}
              />
            </View>
          }
        />

        <View style={styles.listStack}>
          {filteredJobs.map((job) => (
            <View key={job.id} style={styles.jobRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.inlineControls}>
                  <Text style={styles.monoStrongText}>{job.id}</Text>
                  <StatusPill label={job.status} />
                  <StatusPill label={job.horizon} tone="info" showDot={false} />
                  <Text style={styles.monoSub}>{job.modelVersion}</Text>
                </View>
                <Text style={styles.rowMeta}>
                  Start: {job.startTime} · End: {job.endTime} · Duration: {job.duration} ·{' '}
                  {job.triggerType} ({job.triggeredBy})
                </Text>
              </View>

              <View style={styles.inlineControls}>
                <SoftButton
                  label="View Log"
                  compact
                  variant="secondary"
                  icon={<FileTerminal size={13} color={colors.foreground} />}
                  onPress={() => setSelectedJob(job)}
                />
                {canOperateJobs && (
                  <SoftButton
                    label="Rerun"
                    compact
                    variant="secondary"
                    icon={<RotateCcw size={13} color={colors.primary} />}
                    onPress={() => {
                      onRerunJob(job.id);
                      onNotify(`Queued rerun for ${job.id} (${job.horizon}).`);
                    }}
                  />
                )}
                {canOperateJobs && (job.status === 'Running' || job.status === 'Queued') && (
                  <SoftButton
                    label="Cancel"
                    compact
                    variant="danger"
                    icon={<XCircle size={13} color={colors.danger} />}
                    onPress={() => setCancelTarget(job)}
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      </SurfaceCard>

      {/* Component Detail Drawer */}
      <DetailDrawerSheet
        visible={!!inspectedCard}
        title={
          inspectedCard === 'api'
            ? 'Backend API Diagnostics'
            : inspectedCard === 'pipeline'
              ? 'Data Pipeline Stage Health'
              : inspectedCard === 'gru'
                ? `GRU Model · ${selectedGru.version}`
                : 'Response Time Breakdown'
        }
        subtitle={`Window: ${sysWindow}`}
        onClose={() => setInspectedCard(null)}
        footer={
          <SoftButton label="Close" variant="primary" onPress={() => setInspectedCard(null)} />
        }
      >
        {inspectedCard === 'api' && (
          <KeyValueGrid
            items={[
              { label: 'Availability', value: '99.96%', mono: true },
              { label: 'Total Requests', value: '53,240', mono: true },
              { label: '4xx Rate', value: '0.14%', mono: true },
              { label: '5xx Rate', value: '0.04%', mono: true },
            ]}
          />
        )}
        {inspectedCard === 'pipeline' &&
          PIPELINE_STAGES.map((s) => (
            <View key={s.id} style={styles.codeWell}>
              <Text style={styles.rowTitle}>
                {s.stage} ({s.status})
              </Text>
              <Text style={styles.rowMeta}>{s.detail}</Text>
            </View>
          ))}
        {inspectedCard === 'gru' && (
          <KeyValueGrid
            items={[
              { label: 'Model Version', value: selectedGru.version, mono: true },
              { label: 'Last Trained', value: selectedGru.trainedAt, mono: true },
              { label: 'MAE / RMSE', value: `${selectedGru.mae} / ${selectedGru.rmse}`, mono: true },
              { label: 'Drift Score', value: selectedGru.driftScore },
            ]}
          />
        )}
        {inspectedCard === 'latency' && (
          <KeyValueGrid
            items={[
              { label: 'Average Latency', value: '42 ms', mono: true },
              { label: 'P95 Latency', value: '88 ms', mono: true },
              { label: 'P99 Latency', value: '218 ms', mono: true },
              { label: 'Warning SLA', value: '250 ms', mono: true },
            ]}
          />
        )}
      </DetailDrawerSheet>

      {/* Job Log Drawer */}
      <DetailDrawerSheet
        visible={!!selectedJob}
        title={selectedJob ? `Forecast Job ${selectedJob.id}` : ''}
        subtitle={selectedJob ? `${selectedJob.horizon} · ${selectedJob.modelVersion}` : ''}
        onClose={() => setSelectedJob(null)}
        footer={
          <SoftButton label="Close" variant="primary" onPress={() => setSelectedJob(null)} />
        }
      >
        {selectedJob && (
          <>
            <StatusPill label={selectedJob.status} />
            <View style={styles.codeWell}>
              {selectedJob.logLines.map((line, i) => (
                <Text key={i} style={styles.codeMono}>
                  {line}
                </Text>
              ))}
            </View>
          </>
        )}
      </DetailDrawerSheet>

      {/* Cancel Job Confirmation (isolated destructive action) */}
      <ConfirmActionModal
        visible={!!cancelTarget}
        title={cancelTarget ? `Cancel ${cancelTarget.id}?` : ''}
        description="Stopping an active or queued GRU forecast job leaves the prior published forecast active."
        confirmLabel="Cancel Forecast Job"
        danger
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) {
            onCancelJob(cancelTarget.id);
            onNotify(`Cancelled forecast job ${cancelTarget.id}.`);
          }
          setCancelTarget(null);
        }}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Page 3.2: Logs & Errors                                                    */
/* -------------------------------------------------------------------------- */
function LogsAndErrorsPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  logs,
  onUpdateLogStatus,
  onAcknowledgeAllNewLogs,
  activeRole,
  onNotify,
}: SystemPagesProps) {
  const [levelFilter, setLevelFilter] = useState<'All' | LogLevel>('All');
  const [compFilter, setCompFilter] = useState<'All' | SystemComponentName>('All');
  const [ackFilter, setAckFilter] = useState<'All' | LogAckStatus>('All');
  const [logWindow, setLogWindow] = useState<'1h' | '24h' | '7d' | 'Custom'>('24h');
  const [selectedLog, setSelectedLog] = useState<SystemLogRecord | null>(null);

  const canAck = activeRole !== 'Viewer';

  const filteredLogs = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return logs.filter((l) => {
      if (levelFilter !== 'All' && l.level !== levelFilter) return false;
      if (compFilter !== 'All' && l.component !== compFilter) return false;
      if (ackFilter !== 'All' && l.status !== ackFilter) return false;
      if (
        q &&
        !l.message.toLowerCase().includes(q) &&
        !l.requestOrJobId.toLowerCase().includes(q) &&
        !l.component.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [logs, levelFilter, compFilter, ackFilter, filters.search]);

  const unackedCount = logs.filter((l) => l.status === 'New').length;

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={() => {
          onResetFilters();
          setLevelFilter('All');
          setCompFilter('All');
          setAckFilter('All');
        }}
        searchPlaceholder="Search log message or Request/Job ID..."
        showDateRange
        datePresets={['1h', '24h', '7d', 'Custom'] as const}
        customDateValue={logWindow}
        onCustomPresetChange={(v) => setLogWindow(v as '1h' | '24h' | '7d' | 'Custom')}
        extraInline={
          <View style={styles.inlineControls}>
            <SelectPill
              label="Level"
              value={levelFilter}
              options={['All', 'Info', 'Warning', 'Error', 'Critical'] as const}
              onChange={setLevelFilter}
            />
            <SelectPill
              label="Component"
              value={compFilter}
              options={['All', 'API', 'Pipeline', 'GRU', 'Auth'] as const}
              onChange={setCompFilter}
            />
            <SelectPill
              label="State"
              value={ackFilter}
              options={['All', 'New', 'Acknowledged', 'Resolved'] as const}
              onChange={setAckFilter}
            />
          </View>
        }
      />

      <SurfaceCard>
        <SectionTitleBlock
          title="System Event & Error Stream"
          subtitle={`${filteredLogs.length} events (${unackedCount} unacknowledged)`}
          right={
            <View style={styles.inlineControls}>
              {canAck && unackedCount > 0 && (
                <SoftButton
                  label={`Acknowledge All (${unackedCount})`}
                  compact
                  variant="secondary"
                  icon={<CheckCheck size={14} color={colors.primary} />}
                  onPress={() => {
                    onAcknowledgeAllNewLogs();
                    onNotify('All new log alerts marked Acknowledged.');
                  }}
                />
              )}
              <SoftButton
                label="Export Logs"
                compact
                variant="secondary"
                icon={<Download size={14} color={colors.foreground} />}
                onPress={() => onNotify(`Exported ${filteredLogs.length} log entries (JSONL).`)}
              />
            </View>
          }
        />

        <View style={styles.listStack}>
          {filteredLogs.map((log) => (
            <Pressable
              key={log.id}
              onPress={() => setSelectedLog(log)}
              style={styles.jobRow}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.inlineControls}>
                  <StatusPill label={log.level} />
                  <StatusPill label={log.component} tone="info" showDot={false} />
                  <Text style={styles.monoSub}>{log.requestOrJobId}</Text>
                  <StatusPill label={log.status} />
                </View>
                <Text style={styles.rowTitle}>{log.message}</Text>
                <Text style={styles.rowMeta}>{log.timestamp}</Text>
              </View>

              {canAck && log.status === 'New' && (
                <SoftButton
                  label="Acknowledge"
                  compact
                  variant="secondary"
                  onPress={() => {
                    onUpdateLogStatus(log.id, 'Acknowledged');
                    onNotify(`Acknowledged ${log.id}.`);
                  }}
                />
              )}
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      <DetailDrawerSheet
        visible={!!selectedLog}
        title={selectedLog ? `${selectedLog.level} · ${selectedLog.component}` : ''}
        subtitle={selectedLog ? `${selectedLog.timestamp} · ${selectedLog.requestOrJobId}` : ''}
        onClose={() => setSelectedLog(null)}
        footer={
          selectedLog && canAck ? (
            <View style={styles.inlineControls}>
              <SoftButton
                label="Mark Acknowledged"
                variant="secondary"
                onPress={() => {
                  onUpdateLogStatus(selectedLog.id, 'Acknowledged');
                  setSelectedLog(null);
                  onNotify(`${selectedLog.id} marked Acknowledged.`);
                }}
              />
              <SoftButton
                label="Mark Resolved"
                variant="primary"
                onPress={() => {
                  onUpdateLogStatus(selectedLog.id, 'Resolved');
                  setSelectedLog(null);
                  onNotify(`${selectedLog.id} marked Resolved.`);
                }}
              />
            </View>
          ) : (
            <SoftButton label="Close" variant="primary" onPress={() => setSelectedLog(null)} />
          )
        }
      >
        {selectedLog && (
          <>
            <View style={styles.inlineControls}>
              <StatusPill label={selectedLog.level} />
              <StatusPill label={selectedLog.status} />
            </View>
            <Text style={styles.rowTitle}>{selectedLog.message}</Text>
            <KeyValueGrid
              items={[
                { label: 'Event ID', value: selectedLog.id, mono: true },
                { label: 'Correlation ID', value: selectedLog.requestOrJobId, mono: true },
                { label: 'Component', value: selectedLog.component },
                { label: 'Endpoint', value: selectedLog.endpoint ?? 'Internal Worker', mono: true },
              ]}
            />
            <View style={styles.codeWell}>
              <Text style={styles.rowTitle}>Diagnostic Trace</Text>
              <Text style={styles.codeMono}>{selectedLog.stackOrDetail}</Text>
            </View>
          </>
        )}
      </DetailDrawerSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  pageStack: {
    gap: 16,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  twoColStacked: {
    flexDirection: 'column',
  },
  inlineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  componentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  componentTile: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colors.cardSubtle,
    borderRadius: 16,
    padding: 16,
    gap: 5,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tileTitle: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.foreground,
  },
  tileMetric: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
    fontSize: 20,
    color: colors.foreground,
  },
  listStack: {
    gap: 2,
  },
  endpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  innerSectionDivider: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.foreground,
  },
  rowMeta: {
    ...typography.caption,
    color: colors.readForeground,
  },
  monoStrongText: {
    ...typography.monoStrong,
    color: colors.foreground,
  },
  monoSub: {
    ...typography.mono,
    color: colors.mutedForeground,
  },
  codeWell: {
    backgroundColor: colors.cardSubtle,
    borderRadius: 14,
    padding: 13,
    gap: 5,
  },
  codeMono: {
    ...typography.mono,
    color: colors.readForeground,
  },
});
