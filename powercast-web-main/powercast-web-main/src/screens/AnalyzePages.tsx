import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Download,
  FileImage,
  MessageSquarePlus,
  TrendingDown,
  TrendingUp,
  ZoomIn,
} from 'lucide-react-native';
import {
  AnomalyRecord,
  AnomalyStatus,
  AnomalyType,
  RiskFactor,
  RiskTier,
  SharedFiltersState,
  SitemapPageId,
} from '@/types';
import {
  ForecastPoint,
  generateForecastComparison,
  generateTrendSeries,
  getEnergyMixData,
} from '@/services/adminMockData';
import {
  DetailDrawerSheet,
  KeyValueGrid,
  SectionTitleBlock,
  SegmentedTabs,
  SelectPill,
  SoftButton,
  StatusPill,
  SurfaceCard,
  ToggleSwitch,
} from '@/components/AdminPrimitives';
import { SharedFilterBar } from '@/components/SharedFilterBar';
import {
  EnergyMixVisual,
  ForecastComparisonChart,
  RiskScoreTimelineChart,
  TrendTimeSeriesChart,
} from '@/components/EnergyCharts';
import { colors, fonts, radius, shadow, typography } from '@/utils/theme';

interface AnalyzePagesProps {
  pageId: Extract<SitemapPageId, '1.1' | '1.2' | '1.3'>;
  filters: SharedFiltersState;
  onUpdateFilters: (patch: Partial<SharedFiltersState>) => void;
  onResetFilters: () => void;
  datasetNames: string[];
  riskFactors: RiskFactor[];
  anomalies: AnomalyRecord[];
  onUpdateAnomaly: (id: string, patch: Partial<AnomalyRecord>) => void;
  onNotify: (msg: string) => void;
}

export function AnalyzePages({
  pageId,
  filters,
  onUpdateFilters,
  onResetFilters,
  datasetNames,
  riskFactors,
  anomalies,
  onUpdateAnomaly,
  onNotify,
}: AnalyzePagesProps) {
  if (pageId === '1.1') {
    return (
      <OverviewTrendPage
        filters={filters}
        onUpdateFilters={onUpdateFilters}
        onResetFilters={onResetFilters}
        datasetNames={datasetNames}
        onNotify={onNotify}
      />
    );
  }
  if (pageId === '1.2') {
    return (
      <ForecastVsActualPage
        filters={filters}
        onUpdateFilters={onUpdateFilters}
        onResetFilters={onResetFilters}
        onNotify={onNotify}
      />
    );
  }
  return (
    <RiskAndAnomalyPage
      filters={filters}
      onUpdateFilters={onUpdateFilters}
      onResetFilters={onResetFilters}
      datasetNames={datasetNames}
      riskFactors={riskFactors}
      anomalies={anomalies}
      onUpdateAnomaly={onUpdateAnomaly}
      onNotify={onNotify}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Page 1.1: Overview / Trend                                                 */
/* -------------------------------------------------------------------------- */
function OverviewTrendPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  datasetNames,
  onNotify,
}: {
  filters: SharedFiltersState;
  onUpdateFilters: (patch: Partial<SharedFiltersState>) => void;
  onResetFilters: () => void;
  datasetNames: string[];
  onNotify: (msg: string) => void;
}) {
  const { width } = useWindowDimensions();
  const isStacked = width < 1020;

  const [showMovingAverage, setShowMovingAverage] = useState(true);
  const [zoomMode, setZoomMode] = useState<'Full' | 'Peak' | 'Recent'>('Full');
  const [mixViewBy, setMixViewBy] = useState<'type' | 'region'>('type');
  const [comparePrevPeriod, setComparePrevPeriod] = useState(true);

  const trend = useMemo(
    () =>
      generateTrendSeries(
        filters.dateRange,
        filters.energyType,
        filters.region,
        filters.granularity,
      ),
    [filters.dateRange, filters.energyType, filters.region, filters.granularity],
  );

  const mixItems = useMemo(
    () => getEnergyMixData(mixViewBy, filters.dateRange),
    [mixViewBy, filters.dateRange],
  );

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={onResetFilters}
        showDateRange
        showGranularity
        showEnergyType
        showRegion
        datasetOptions={['All Datasets', ...datasetNames]}
      />

      {/* Summary Telemetry Strip */}
      <SurfaceCard>
        <View style={styles.statStrip}>
          <StatItem label="Minimum Load" value={`${trend.minVal} GW`} meta={`Window: ${filters.dateRange}`} />
          <StatItem label="Peak Demand" value={`${trend.maxVal} GW`} meta={filters.region} />
          <StatItem label="Period Average" value={`${trend.avgVal} GW`} meta={filters.granularity} />
          <StatItem
            label="Change vs Prior Period"
            value={trend.deltaPct}
            meta="Metered comparison"
            accent
          />
        </View>
      </SurfaceCard>

      <View style={[styles.twoCol, isStacked && styles.twoColStacked]}>
        {/* 1.1 Historical Energy Trend */}
        <SurfaceCard style={{ flex: 1.55 }}>
          <SectionTitleBlock
            title="Historical Energy Demand"
            subtitle={`Time-series curve (${filters.energyType} · ${filters.granularity})`}
            right={
              <View style={styles.inlineControls}>
                <ToggleSwitch
                  label="Moving avg"
                  checked={showMovingAverage}
                  onChange={setShowMovingAverage}
                />
                <SelectPill
                  label="Zoom"
                  value={zoomMode}
                  options={['Full', 'Peak', 'Recent'] as const}
                  onChange={setZoomMode}
                />
              </View>
            }
          />

          <TrendTimeSeriesChart
            labels={trend.labels}
            values={trend.values}
            movingAvg={trend.movingAvg}
            showMovingAverage={showMovingAverage}
            zoomMode={zoomMode}
          />

          <View style={styles.cardActionFooter}>
            <View style={styles.zoomHint}>
              <ZoomIn size={14} color={colors.mutedForeground} />
              <Text style={styles.footerHintText}>Tap any time slot to inspect exact GW & MA</Text>
            </View>
            <View style={styles.inlineControls}>
              <SoftButton
                label="Export CSV"
                compact
                icon={<Download size={14} color={colors.foreground} />}
                onPress={() => onNotify(`Exported ${filters.dateRange} trend series as CSV.`)}
              />
              <SoftButton
                label="Save PNG"
                compact
                icon={<FileImage size={14} color={colors.foreground} />}
                onPress={() => onNotify('Saved high-resolution chart snapshot (PNG).')}
              />
            </View>
          </View>
        </SurfaceCard>

        {/* 1.3 Energy Mix */}
        <SurfaceCard style={{ flex: 1 }}>
          <SectionTitleBlock
            title="Energy Share Breakdown"
            subtitle="Proportional generation & consumption mix"
            right={
              <SegmentedTabs
                options={['By Type', 'By Region'] as const}
                value={mixViewBy === 'type' ? 'By Type' : 'By Region'}
                onChange={(val) => setMixViewBy(val === 'By Type' ? 'type' : 'region')}
              />
            }
          />

          <EnergyMixVisual items={mixItems} comparePrev={comparePrevPeriod} />

          <View style={styles.cardActionFooter}>
            <ToggleSwitch
              label="Compare previous period"
              checked={comparePrevPeriod}
              onChange={setComparePrevPeriod}
            />
          </View>
        </SurfaceCard>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Page 1.2: Forecast vs Actual                                               */
/* -------------------------------------------------------------------------- */
function ForecastVsActualPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  onNotify,
}: {
  filters: SharedFiltersState;
  onUpdateFilters: (patch: Partial<SharedFiltersState>) => void;
  onResetFilters: () => void;
  onNotify: (msg: string) => void;
}) {
  const [horizon, setHorizon] = useState<'1 Day' | '7 Days' | '30 Days'>('7 Days');
  const [modelVersion, setModelVersion] = useState('v2.4.1-prod');
  const [selectedPoint, setSelectedPoint] = useState<ForecastPoint | null>(null);

  const comparison = useMemo(
    () => generateForecastComparison(horizon, modelVersion, filters.energyType),
    [horizon, modelVersion, filters.energyType],
  );

  const highErrorPoints = comparison.points.filter((p) => p.highError);

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={onResetFilters}
        showDateRange
        showEnergyType
        showRegion
        extraInline={
          <View style={styles.inlineControls}>
            <SelectPill
              label="Horizon"
              value={horizon}
              options={['1 Day', '7 Days', '30 Days'] as const}
              onChange={setHorizon}
            />
            <SelectPill
              label="GRU Model"
              value={modelVersion}
              options={['v2.4.1-prod', 'v2.5.0-rc1', 'v2.3.8-stable'] as const}
              onChange={setModelVersion}
            />
          </View>
        }
      />

      {/* Accuracy KPI Strip */}
      <SurfaceCard>
        <View style={styles.statStrip}>
          <StatItem label="Mean Absolute Error (MAE)" value={comparison.mae} meta={modelVersion} />
          <StatItem label="Root Mean Sq Error (RMSE)" value={comparison.rmse} meta={`Horizon: ${horizon}`} />
          <StatItem label="MAPE" value={comparison.mape} meta="Target < 3.50%" accent />
          <StatItem
            label="High-Deviation Slots"
            value={`${highErrorPoints.length} intervals`}
            meta="> 5.2% error threshold"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitleBlock
          title="Actual vs GRU Forecast & Residuals"
          subtitle={`Model ${modelVersion} · ${horizon} horizon · ${filters.region}`}
          right={
            <SoftButton
              label="Export Comparison CSV"
              compact
              icon={<Download size={14} color={colors.foreground} />}
              onPress={() =>
                onNotify(`Exported Actual vs Forecast (${modelVersion}, ${horizon}) CSV.`)
              }
            />
          }
        />

        <ForecastComparisonChart
          points={comparison.points}
          selectedIndex={selectedPoint?.index ?? null}
          onSelectPoint={setSelectedPoint}
        />
      </SurfaceCard>

      {/* High Deviation Quick Triage List */}
      <SurfaceCard>
        <SectionTitleBlock
          title="Largest Forecast Deviations"
          subtitle="Tap any interval to inspect telemetry context and GRU residual breakdown"
        />
        <View style={styles.listStack}>
          {comparison.points
            .slice()
            .sort((a, b) => b.residualPct - a.residualPct)
            .slice(0, 4)
            .map((pt) => (
              <Pressable
                key={pt.index}
                onPress={() => setSelectedPoint(pt)}
                style={styles.deviationRow}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.inlineControls}>
                    <Text style={styles.rowTitle}>{pt.label}</Text>
                    <StatusPill
                      label={pt.highError ? `${pt.residualPct}% error` : `${pt.residualPct}% nominal`}
                      tone={pt.highError ? 'danger' : 'success'}
                    />
                  </View>
                  <Text style={styles.rowMeta} numberOfLines={2}>
                    {pt.driverNote}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.monoPrimary}>
                    {pt.residual > 0 ? `+${pt.residual}` : pt.residual} GW
                  </Text>
                  <Text style={styles.rowMeta}>
                    Act {pt.actual} vs Fcst {pt.forecast}
                  </Text>
                </View>
              </Pressable>
            ))}
        </View>
      </SurfaceCard>

      <DetailDrawerSheet
        visible={!!selectedPoint}
        title={selectedPoint ? `Interval Deviation · ${selectedPoint.label}` : ''}
        subtitle={`${modelVersion} · ${horizon} Horizon`}
        onClose={() => setSelectedPoint(null)}
        footer={
          <SoftButton
            label="Close"
            variant="primary"
            onPress={() => setSelectedPoint(null)}
          />
        }
      >
        {selectedPoint && (
          <>
            <StatusPill
              label={
                selectedPoint.highError
                  ? `High Deviation (${selectedPoint.residualPct}%)`
                  : `Within Nominal Band (${selectedPoint.residualPct}%)`
              }
              tone={selectedPoint.highError ? 'danger' : 'success'}
            />
            <KeyValueGrid
              items={[
                { label: 'Metered Actual', value: `${selectedPoint.actual} GW`, mono: true },
                { label: 'GRU Forecast', value: `${selectedPoint.forecast} GW`, mono: true },
                {
                  label: 'Residual (Act − Fcst)',
                  value: `${selectedPoint.residual > 0 ? '+' : ''}${selectedPoint.residual} GW`,
                  mono: true,
                },
                { label: 'Relative Error', value: `${selectedPoint.residualPct}%`, mono: true },
                { label: 'Energy Carrier', value: filters.energyType },
                { label: 'Grid Zone', value: filters.region },
              ]}
            />
            <View style={styles.detailNoteBox}>
              <Text style={styles.detailNoteHeading}>Operational Context</Text>
              <Text style={styles.detailNoteBody}>{selectedPoint.driverNote}</Text>
            </View>
          </>
        )}
      </DetailDrawerSheet>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Page 1.3: Risk & Anomaly (2 Tabs)                                          */
/* -------------------------------------------------------------------------- */
function RiskAndAnomalyPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  datasetNames,
  riskFactors,
  anomalies,
  onUpdateAnomaly,
  onNotify,
}: {
  filters: SharedFiltersState;
  onUpdateFilters: (patch: Partial<SharedFiltersState>) => void;
  onResetFilters: () => void;
  datasetNames: string[];
  riskFactors: RiskFactor[];
  anomalies: AnomalyRecord[];
  onUpdateAnomaly: (id: string, patch: Partial<AnomalyRecord>) => void;
  onNotify: (msg: string) => void;
}) {
  const { width } = useWindowDimensions();
  const isStacked = width < 960;

  const [activeTab, setActiveTab] = useState<'Risk Score' | 'Anomaly'>('Risk Score');
  const [riskFilterTier, setRiskFilterTier] = useState<'All' | RiskTier>('All');
  const [alertThreshold, setAlertThreshold] = useState(65);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState('65');
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);

  // Anomaly tab filters
  const [anomalyType, setAnomalyType] = useState<'All' | AnomalyType>('All');
  const [anomalySeverity, setAnomalySeverity] = useState<'All' | RiskTier>('All');
  const [anomalyStatus, setAnomalyStatus] = useState<'All' | AnomalyStatus>('All');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const compositeScore = 44; // Medium tier (25-54)
  const compositeTier: RiskTier =
    compositeScore >= 80
      ? 'Critical'
      : compositeScore >= 55
        ? 'High'
        : compositeScore >= 25
          ? 'Medium'
          : 'Low';

  const filteredFactors = useMemo(() => {
    return riskFactors.filter((f) => {
      if (filters.energyType !== 'All' && f.energyType !== filters.energyType) return false;
      if (filters.region !== 'All Regions' && f.region !== filters.region) return false;
      if (riskFilterTier !== 'All') {
        const mag = Math.abs(f.contribution);
        const factorTier: RiskTier =
          mag >= 18 ? 'Critical' : mag >= 13 ? 'High' : mag >= 9 ? 'Medium' : 'Low';
        if (factorTier !== riskFilterTier) return false;
      }
      return true;
    });
  }, [riskFactors, filters.energyType, filters.region, riskFilterTier]);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((a) => {
      if (filters.energyType !== 'All' && a.energyType !== filters.energyType) return false;
      if (filters.region !== 'All Regions' && a.region !== filters.region) return false;
      if (filters.dataset !== 'All Datasets' && a.dataset !== filters.dataset) return false;
      if (anomalyType !== 'All' && a.type !== anomalyType) return false;
      if (anomalySeverity !== 'All' && a.severity !== anomalySeverity) return false;
      if (anomalyStatus !== 'All' && a.status !== anomalyStatus) return false;
      return true;
    });
  }, [
    anomalies,
    filters.energyType,
    filters.region,
    filters.dataset,
    anomalyType,
    anomalySeverity,
    anomalyStatus,
  ]);

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={onResetFilters}
        showDateRange
        showEnergyType
        showRegion
        datasetOptions={activeTab === 'Anomaly' ? ['All Datasets', ...datasetNames] : undefined}
      />

      <View style={styles.tabHeaderRow}>
        <SegmentedTabs
          options={['Risk Score', 'Anomaly'] as const}
          value={activeTab}
          onChange={setActiveTab}
          counts={{
            'Risk Score': filteredFactors.length,
            Anomaly: filteredAnomalies.filter((a) => a.status === 'New').length,
          }}
        />

        {activeTab === 'Risk Score' ? (
          <View style={styles.inlineControls}>
            <SelectPill
              label="Risk Tier"
              value={riskFilterTier}
              options={['All', 'Low', 'Medium', 'High', 'Critical'] as const}
              onChange={setRiskFilterTier}
            />
            <SoftButton
              label={`Alert > ${alertThreshold}`}
              compact
              variant="secondary"
              icon={<Bell size={14} color={colors.primary} />}
              onPress={() => {
                setThresholdDraft(String(alertThreshold));
                setAlertModalOpen(true);
              }}
            />
          </View>
        ) : (
          <View style={styles.inlineControls}>
            <SelectPill
              label="Type"
              value={anomalyType}
              options={['All', 'Spike', 'Drop', 'Flatline', 'Missing'] as const}
              onChange={setAnomalyType}
            />
            <SelectPill
              label="Severity"
              value={anomalySeverity}
              options={['All', 'Low', 'Medium', 'High', 'Critical'] as const}
              onChange={setAnomalySeverity}
            />
            <SelectPill
              label="Status"
              value={anomalyStatus}
              options={['All', 'New', 'Reviewed', 'False Positive'] as const}
              onChange={setAnomalyStatus}
            />
          </View>
        )}
      </View>

      {activeTab === 'Risk Score' ? (
        <>
          <View style={[styles.twoCol, isStacked && styles.twoColStacked]}>
            <SurfaceCard style={{ flex: 1 }}>
              <SectionTitleBlock
                title="Composite Operational Risk"
                subtitle="Weighted GRU uncertainty + weather & telemetry freshness index"
                right={<StatusPill label={`${compositeTier} Risk`} />}
              />
              <View style={styles.scoreHeroRow}>
                <Text style={styles.bigScore}>{compositeScore}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scoreOutOf}>out of 100 · Alert set at {alertThreshold}</Text>
                  <Text style={styles.rowMeta}>
                    Thresholds: Low 0–24 · Medium 25–54 · High 55–79 · Critical 80–100
                  </Text>
                </View>
              </View>
              <RiskScoreTimelineChart
                scores={[28, 31, 35, 34, 42, 49, 53, 47, 44]}
                alertThreshold={alertThreshold}
              />
            </SurfaceCard>

            <SurfaceCard style={{ flex: 1.25 }}>
              <SectionTitleBlock
                title="Feature Attribution & Risk Drivers"
                subtitle="Tap any factor to inspect impact direction and underlying readings"
              />
              <View style={styles.listStack}>
                {filteredFactors.map((factor) => {
                  const inc = factor.contribution > 0;
                  const barPct = Math.min(100, Math.abs(factor.contribution) * 4.5);
                  return (
                    <Pressable
                      key={factor.id}
                      onPress={() => setSelectedFactor(factor)}
                      style={styles.factorRow}
                    >
                      <View style={styles.factorTop}>
                        <View style={styles.inlineControls}>
                          {inc ? (
                            <TrendingUp size={15} color={colors.danger} />
                          ) : (
                            <TrendingDown size={15} color={colors.success} />
                          )}
                          <Text style={styles.rowTitle}>{factor.name}</Text>
                        </View>
                        <Text
                          style={[
                            styles.monoPrimary,
                            { color: inc ? colors.danger : colors.success },
                          ]}
                        >
                          {inc ? `+${factor.contribution}` : factor.contribution} pts
                        </Text>
                      </View>
                      <View style={styles.factorBarTrack}>
                        <View
                          style={{
                            width: `${barPct}%`,
                            height: '100%',
                            borderRadius: radius.full,
                            backgroundColor: inc ? colors.dangerDot : colors.successDot,
                          }}
                        />
                      </View>
                      <Text style={styles.rowMeta}>
                        {inc ? 'Increases risk' : 'Mitigates risk'} · Current {factor.currentValue}{' '}
                        (Baseline {factor.baselineValue})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </SurfaceCard>
          </View>
        </>
      ) : (
        <SurfaceCard>
          <SectionTitleBlock
            title="Detected Data & Forecast Anomalies"
            subtitle={`${filteredAnomalies.length} outliers matching active filters`}
          />
          <View style={styles.listStack}>
            {filteredAnomalies.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  setSelectedAnomaly(item);
                  setNoteDraft(item.note);
                }}
                style={styles.anomalyCardRow}
              >
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={styles.inlineControls}>
                    <AlertTriangle
                      size={15}
                      color={item.severity === 'Critical' || item.severity === 'High' ? colors.danger : colors.warn}
                    />
                    <Text style={styles.rowTitle}>
                      {item.type} · {item.dataset}
                    </Text>
                    <StatusPill label={item.severity} />
                    <StatusPill
                      label={item.status}
                      tone={
                        item.status === 'New'
                          ? 'danger'
                          : item.status === 'Reviewed'
                            ? 'success'
                            : 'neutral'
                      }
                    />
                  </View>
                  <Text style={styles.rowMeta}>
                    {item.timestamp} · {item.region} ({item.energyType}) · Observed{' '}
                    <Text style={styles.monoInline}>{item.observed}</Text> vs Expected{' '}
                    <Text style={styles.monoInline}>{item.expected}</Text> ({item.deviationPct})
                  </Text>
                  {item.note ? (
                    <Text style={styles.notePreview}>Note: {item.note}</Text>
                  ) : null}
                </View>

                <View style={styles.inlineControls}>
                  {item.status === 'New' && (
                    <SoftButton
                      label="Mark Reviewed"
                      compact
                      variant="secondary"
                      icon={<CheckCircle2 size={14} color={colors.success} />}
                      onPress={() => {
                        onUpdateAnomaly(item.id, { status: 'Reviewed' });
                        onNotify(`Anomaly ${item.id} marked as Reviewed.`);
                      }}
                    />
                  )}
                  <SoftButton
                    label="Note"
                    compact
                    variant="subtle"
                    icon={<MessageSquarePlus size={14} color={colors.primary} />}
                    onPress={() => {
                      setSelectedAnomaly(item);
                      setNoteDraft(item.note);
                    }}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </SurfaceCard>
      )}

      {/* Factor Detail Drawer */}
      <DetailDrawerSheet
        visible={!!selectedFactor}
        title={selectedFactor?.name ?? ''}
        subtitle={selectedFactor?.category}
        onClose={() => setSelectedFactor(null)}
        footer={
          <SoftButton label="Done" variant="primary" onPress={() => setSelectedFactor(null)} />
        }
      >
        {selectedFactor && (
          <>
            <StatusPill
              label={
                selectedFactor.contribution > 0
                  ? `Increases Risk (+${selectedFactor.contribution} pts)`
                  : `Reduces Risk (${selectedFactor.contribution} pts)`
              }
              tone={selectedFactor.contribution > 0 ? 'danger' : 'success'}
            />
            <KeyValueGrid
              items={[
                { label: 'Current Reading', value: selectedFactor.currentValue, mono: true },
                { label: 'Normal Baseline', value: selectedFactor.baselineValue, mono: true },
                { label: 'Carrier Scope', value: selectedFactor.energyType },
                { label: 'Grid Zone', value: selectedFactor.region },
              ]}
            />
            <View style={styles.detailNoteBox}>
              <Text style={styles.detailNoteHeading}>GRU Attribution Detail</Text>
              <Text style={styles.detailNoteBody}>{selectedFactor.explanation}</Text>
            </View>
          </>
        )}
      </DetailDrawerSheet>

      {/* Anomaly Detail & Note Drawer */}
      <DetailDrawerSheet
        visible={!!selectedAnomaly}
        title={selectedAnomaly ? `Anomaly ${selectedAnomaly.id} · ${selectedAnomaly.type}` : ''}
        subtitle={selectedAnomaly ? `${selectedAnomaly.dataset} · ${selectedAnomaly.timestamp}` : ''}
        onClose={() => setSelectedAnomaly(null)}
        footer={
          selectedAnomaly ? (
            <View style={styles.inlineControls}>
              <SoftButton
                label="False Positive"
                variant="secondary"
                onPress={() => {
                  onUpdateAnomaly(selectedAnomaly.id, {
                    status: 'False Positive',
                    note: noteDraft.trim(),
                  });
                  setSelectedAnomaly(null);
                  onNotify(`${selectedAnomaly.id} marked False Positive.`);
                }}
              />
              <SoftButton
                label="Save & Mark Reviewed"
                variant="primary"
                onPress={() => {
                  onUpdateAnomaly(selectedAnomaly.id, {
                    status: 'Reviewed',
                    note: noteDraft.trim(),
                  });
                  setSelectedAnomaly(null);
                  onNotify(`Saved operator note on ${selectedAnomaly.id}.`);
                }}
              />
            </View>
          ) : null
        }
      >
        {selectedAnomaly && (
          <>
            <View style={styles.inlineControls}>
              <StatusPill label={`Severity: ${selectedAnomaly.severity}`} />
              <StatusPill
                label={selectedAnomaly.status}
                tone={selectedAnomaly.status === 'New' ? 'danger' : 'success'}
              />
            </View>
            <KeyValueGrid
              items={[
                { label: 'Observed Value', value: selectedAnomaly.observed, mono: true },
                { label: 'Expected Value', value: selectedAnomaly.expected, mono: true },
                { label: 'Deviation', value: selectedAnomaly.deviationPct, mono: true },
                { label: 'Region', value: selectedAnomaly.region },
              ]}
            />
            <View style={{ gap: 6 }}>
              <Text style={styles.detailNoteHeading}>Operator Triage Note</Text>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Document root cause, sensor status, or dispatch confirmation..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={styles.noteInput}
              />
            </View>
          </>
        )}
      </DetailDrawerSheet>

      {/* Alert Threshold Modal */}
      <Modal
        visible={alertModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAlertModalOpen(false)}>
          <Pressable style={styles.alertModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Configure Risk Score Alert</Text>
            <Text style={styles.rowMeta}>
              Notify shift operators and dispatch Slack/Webhook when the composite score crosses this
              threshold (1–100).
            </Text>
            <TextInput
              value={thresholdDraft}
              onChangeText={setThresholdDraft}
              keyboardType="numeric"
              style={styles.thresholdInput}
            />
            <View style={styles.modalActions}>
              <SoftButton
                label="Cancel"
                variant="secondary"
                onPress={() => setAlertModalOpen(false)}
              />
              <SoftButton
                label="Save Alert Rule"
                variant="primary"
                onPress={() => {
                  const parsed = Math.min(99, Math.max(10, Number(thresholdDraft) || 65));
                  setAlertThreshold(parsed);
                  setAlertModalOpen(false);
                  onNotify(`Risk alert threshold updated to ${parsed} / 100.`);
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function StatItem({
  label,
  value,
  meta,
  accent,
}: {
  label: string;
  value: string;
  meta: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
      <Text style={styles.statMeta}>{meta}</Text>
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
  statStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCell: {
    flex: 1,
    minWidth: 145,
    gap: 3,
  },
  statLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  statValue: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    color: colors.foreground,
  },
  statMeta: {
    ...typography.caption,
    color: colors.readForeground,
  },
  inlineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardActionFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  zoomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerHintText: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  listStack: {
    gap: 2,
  },
  deviationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
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
  monoPrimary: {
    ...typography.monoStrong,
    color: colors.foreground,
  },
  monoInline: {
    ...typography.mono,
    color: colors.foreground,
  },
  detailNoteBox: {
    backgroundColor: colors.cardSubtle,
    borderRadius: 14,
    padding: 14,
    gap: 5,
  },
  detailNoteHeading: {
    ...typography.label,
    color: colors.foreground,
  },
  detailNoteBody: {
    ...typography.bodySm,
    color: colors.readForeground,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  scoreHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  bigScore: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
    fontSize: 44,
    lineHeight: 48,
    color: colors.warn,
  },
  scoreOutOf: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 2,
  },
  factorRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  factorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  factorBarTrack: {
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.cardMuted,
    overflow: 'hidden',
  },
  anomalyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notePreview: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fonts.sansMedium,
  },
  noteInput: {
    minHeight: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSubtle,
    padding: 12,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.foreground,
    textAlignVertical: 'top',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  alertModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    gap: 12,
    ...shadow.floating,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.foreground,
  },
  thresholdInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSubtle,
    paddingHorizontal: 14,
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: colors.foreground,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
});

