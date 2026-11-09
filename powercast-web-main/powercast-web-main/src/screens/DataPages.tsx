import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Check,
  Download,
  FileSpreadsheet,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  UploadCloud,
  Wrench,
} from 'lucide-react-native';
import {
  DatasetRecord,
  DatasetSource,
  FreshnessStatus,
  ImportHistoryRecord,
  QualityIssueRecord,
  QualityIssueType,
  SharedFiltersState,
  SitemapPageId,
  UserRole,
} from '@/types';
import {
  ConfirmActionModal,
  DetailDrawerSheet,
  KeyValueGrid,
  SectionTitleBlock,
  SegmentedTabs,
  SelectPill,
  SoftButton,
  SortHeaderButton,
  StatusPill,
  SurfaceCard,
} from '@/components/AdminPrimitives';
import { SharedFilterBar } from '@/components/SharedFilterBar';
import { colors, fonts, radius, typography } from '@/utils/theme';

interface DataPagesProps {
  pageId: Extract<SitemapPageId, '2.1' | '2.2' | '2.3'>;
  filters: SharedFiltersState;
  onUpdateFilters: (patch: Partial<SharedFiltersState>) => void;
  onResetFilters: () => void;
  datasets: DatasetRecord[];
  onToggleDatasetStatus: (id: string) => void;
  qualityIssues: QualityIssueRecord[];
  onResolveQualityIssue: (id: string) => void;
  importHistory: ImportHistoryRecord[];
  onRecordImportOrJob: (entry: ImportHistoryRecord, actionLabel: string) => void;
  onNavigatePage: (page: SitemapPageId) => void;
  currentOperatorName: string;
  activeRole: UserRole;
  onNotify: (msg: string) => void;
}

export function DataPages(props: DataPagesProps) {
  if (props.pageId === '2.1') return <DatasetsCatalogPage {...props} />;
  if (props.pageId === '2.2') return <ImportAndTriggerPage {...props} />;
  return <QualityAndHistoryPage {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Page 2.1: Datasets & Freshness                                             */
/* -------------------------------------------------------------------------- */
function DatasetsCatalogPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  datasets,
  onToggleDatasetStatus,
  onNavigatePage,
  activeRole,
  onNotify,
}: DataPagesProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 880;

  const [sourceFilter, setSourceFilter] = useState<'All' | DatasetSource>('All');
  const [freshnessFilter, setFreshnessFilter] = useState<'All' | FreshnessStatus>('All');
  const [importWindowFilter, setImportWindowFilter] = useState<'All Dates' | 'Last 7D' | 'Oct 2026'>(
    'All Dates',
  );
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'size'>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedDataset, setSelectedDataset] = useState<DatasetRecord | null>(null);

  const canMutate = activeRole !== 'Viewer';

  const handleSort = (col: 'name' | 'updated' | 'size') => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const list = datasets.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.slug.toLowerCase().includes(q)) return false;
      if (sourceFilter !== 'All' && d.source !== sourceFilter) return false;
      if (freshnessFilter !== 'All' && d.freshness !== freshnessFilter) return false;
      if (filters.status !== 'All Status' && d.status !== filters.status) return false;
      if (filters.energyType !== 'All' && d.energyType !== filters.energyType) return false;
      if (importWindowFilter === 'Last 7D' && d.importedDate < '2026-10-27') return false;
      if (importWindowFilter === 'Oct 2026' && !d.importedDate.startsWith('2026-10')) return false;
      return true;
    });

    list.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * mul;
      if (sortBy === 'size') return (a.sizeMb - b.sizeMb) * mul;
      return a.importedDate.localeCompare(b.importedDate) * mul;
    });

    return list;
  }, [
    datasets,
    filters.search,
    filters.status,
    filters.energyType,
    sourceFilter,
    freshnessFilter,
    importWindowFilter,
    sortBy,
    sortDir,
  ]);

  const currentCount = datasets.filter((d) => d.freshness === 'Current').length;
  const delayedCount = datasets.filter((d) => d.freshness === 'Delayed').length;
  const stalledCount = datasets.filter((d) => d.freshness === 'Stalled').length;

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={() => {
          onResetFilters();
          setSourceFilter('All');
          setFreshnessFilter('All');
          setImportWindowFilter('All Dates');
        }}
        searchPlaceholder="Search dataset name or slug..."
        showEnergyType
        statusOptions={['All Status', 'Active', 'Inactive']}
        extraInline={
          <View style={styles.inlineControls}>
            <SelectPill
              label="Source"
              value={sourceFilter}
              options={['All', 'API', 'File', 'Database'] as const}
              onChange={setSourceFilter}
            />
            <SelectPill
              label="Freshness"
              value={freshnessFilter}
              options={['All', 'Current', 'Delayed', 'Stalled'] as const}
              onChange={setFreshnessFilter}
            />
            <SelectPill
              label="Imported"
              value={importWindowFilter}
              options={['All Dates', 'Last 7D', 'Oct 2026'] as const}
              onChange={setImportWindowFilter}
            />
          </View>
        }
      />

      {/* Freshness Overview Strip (Feature 2.4) */}
      <SurfaceCard>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Connected Datasets</Text>
            <Text style={styles.summaryValue}>{datasets.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Fresh / On-SLA</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{currentCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Delayed Cadence</Text>
            <Text style={[styles.summaryValue, { color: colors.warn }]}>{delayedCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Stalled Feeds</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>{stalledCount}</Text>
          </View>
          {canMutate && (
            <SoftButton
              label="Import Data"
              variant="primary"
              icon={<Plus size={15} color={colors.primaryForeground} />}
              onPress={() => onNavigatePage('2.2')}
            />
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitleBlock
          title="Dataset Registry & Update Cadence"
          subtitle="Tap any dataset to open schema, source endpoint, and SLA details"
          right={
            isMobile ? (
              <SelectPill
                label="Sort"
                value={sortBy === 'name' ? 'Name' : sortBy === 'size' ? 'Size' : 'Last Updated'}
                options={['Last Updated', 'Name', 'Size'] as const}
                onChange={(val) =>
                  handleSort(val === 'Name' ? 'name' : val === 'Size' ? 'size' : 'updated')
                }
              />
            ) : undefined
          }
        />

        {!isMobile && (
          <View style={styles.tableHeaderBar}>
            <SortHeaderButton
              label="Dataset"
              active={sortBy === 'name'}
              direction={sortDir}
              onPress={() => handleSort('name')}
              flex={2.1}
            />
            <Text style={[styles.thStatic, { flex: 0.9 }]}>Source</Text>
            <Text style={[styles.thStatic, { flex: 0.9 }]}>Rows</Text>
            <SortHeaderButton
              label="Size"
              active={sortBy === 'size'}
              direction={sortDir}
              onPress={() => handleSort('size')}
              flex={0.8}
            />
            <SortHeaderButton
              label="Last Updated"
              active={sortBy === 'updated'}
              direction={sortDir}
              onPress={() => handleSort('updated')}
              flex={1.4}
            />
            <Text style={[styles.thStatic, { flex: 1.1 }]}>Freshness</Text>
            <Text style={[styles.thStatic, { flex: 0.9 }]}>Status</Text>
          </View>
        )}

        <View style={styles.listStack}>
          {filtered.map((ds) =>
            isMobile ? (
              <Pressable
                key={ds.id}
                onPress={() => setSelectedDataset(ds)}
                style={styles.mobileRecordCard}
              >
                <View style={styles.mobileCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{ds.name}</Text>
                    <Text style={styles.monoSub}>{ds.slug}</Text>
                  </View>
                  <StatusPill label={ds.freshness} />
                </View>
                <View style={styles.mobileMetaGrid}>
                  <Text style={styles.rowMeta}>Source: {ds.source} ({ds.energyType})</Text>
                  <Text style={styles.rowMeta}>Rows: {ds.rowsFormatted} · {ds.sizeFormatted}</Text>
                  <Text style={styles.rowMeta}>Updated: {ds.lastUpdated}</Text>
                  <Text style={styles.rowMeta}>SLA: {ds.actualFreq} (exp {ds.expectedFreq})</Text>
                </View>
                <View style={styles.inlineControls}>
                  <StatusPill label={ds.status} />
                  <Text style={styles.rowMeta}>Owner: {ds.importedBy}</Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                key={ds.id}
                onPress={() => setSelectedDataset(ds)}
                style={styles.desktopTableRow}
              >
                <View style={{ flex: 2.1 }}>
                  <Text style={styles.rowTitle}>{ds.name}</Text>
                  <Text style={styles.rowMeta}>
                    {ds.coverage} · by {ds.importedBy}
                  </Text>
                </View>
                <Text style={[styles.cellText, { flex: 0.9 }]}>{ds.source}</Text>
                <Text style={[styles.cellMono, { flex: 0.9 }]}>{ds.rowsFormatted}</Text>
                <Text style={[styles.cellMono, { flex: 0.8 }]}>{ds.sizeFormatted}</Text>
                <View style={{ flex: 1.4 }}>
                  <Text style={styles.cellText}>{ds.lastUpdated}</Text>
                  <Text style={styles.rowMeta}>Exp: {ds.expectedFreq}</Text>
                </View>
                <View style={{ flex: 1.1 }}>
                  <StatusPill label={ds.freshness} />
                </View>
                <View style={{ flex: 0.9 }}>
                  <StatusPill label={ds.status} />
                </View>
              </Pressable>
            ),
          )}
        </View>
      </SurfaceCard>

      <DetailDrawerSheet
        visible={!!selectedDataset}
        title={selectedDataset?.name ?? ''}
        subtitle={selectedDataset ? `${selectedDataset.slug} · ${selectedDataset.source}` : ''}
        onClose={() => setSelectedDataset(null)}
        footer={
          selectedDataset ? (
            <View style={styles.inlineControls}>
              {canMutate && (
                <SoftButton
                  label={selectedDataset.status === 'Active' ? 'Disable Dataset' : 'Enable Dataset'}
                  variant="secondary"
                  onPress={() => {
                    onToggleDatasetStatus(selectedDataset.id);
                    setSelectedDataset((prev) =>
                      prev
                        ? { ...prev, status: prev.status === 'Active' ? 'Inactive' : 'Active' }
                        : null,
                    );
                    onNotify(`Updated status for ${selectedDataset.name}.`);
                  }}
                />
              )}
              <SoftButton
                label="Import / Update"
                variant="primary"
                onPress={() => {
                  setSelectedDataset(null);
                  onNavigatePage('2.2');
                }}
              />
            </View>
          ) : null
        }
      >
        {selectedDataset && (
          <>
            <View style={styles.inlineControls}>
              <StatusPill label={selectedDataset.status} />
              <StatusPill label={`Freshness: ${selectedDataset.freshness}`} />
              <StatusPill label={selectedDataset.energyType} tone="info" showDot={false} />
            </View>
            <KeyValueGrid
              items={[
                { label: 'Row Count', value: selectedDataset.rowsFormatted, mono: true },
                { label: 'Storage Size', value: selectedDataset.sizeFormatted, mono: true },
                { label: 'Coverage Window', value: selectedDataset.coverage, mono: true },
                { label: 'Completeness', value: `${selectedDataset.completenessPct}%`, mono: true },
                { label: 'Expected Cadence', value: selectedDataset.expectedFreq },
                { label: 'Observed Cadence', value: selectedDataset.actualFreq },
                { label: 'Last Updated', value: selectedDataset.lastUpdated },
                { label: 'Imported By', value: selectedDataset.importedBy },
              ]}
            />
            <View style={styles.codeWell}>
              <Text style={styles.codeLabel}>Source URI / File</Text>
              <Text style={styles.codeMono}>{selectedDataset.endpointOrFile}</Text>
            </View>
          </>
        )}
      </DetailDrawerSheet>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Page 2.2: Import Wizard + Reprocess / Retrain Trigger                      */
/* -------------------------------------------------------------------------- */
function ImportAndTriggerPage({
  datasets,
  onRecordImportOrJob,
  currentOperatorName,
  activeRole,
  onNotify,
}: DataPagesProps) {
  const { width } = useWindowDimensions();
  const isStacked = width < 980;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [sourceKind, setSourceKind] = useState<'CSV Upload' | 'Excel Upload' | 'JSON Upload' | 'API Sync'>(
    'CSV Upload',
  );
  const [targetDataset, setTargetDataset] = useState(datasets[0]?.slug ?? 'grid-load-hourly');
  const [importMode, setImportMode] = useState<'Append' | 'Replace' | 'Merge'>('Append');
  const [dupPolicy, setDupPolicy] = useState<'Skip' | 'Overwrite'>('Skip');
  const [apiEndpoint, setApiEndpoint] = useState('https://telemetry.egat-grid.internal/v2/load/batch');

  // Job execution state (prevents duplicate clicks while running!)
  const [jobState, setJobState] = useState<{
    status: 'Idle' | 'Running' | 'Succeeded' | 'Failed';
    label: string;
    operator: string;
    timestamp: string;
  }>({
    status: 'Idle',
    label: 'Ready for ingestion or reprocessing',
    operator: currentOperatorName,
    timestamp: '—',
  });

  // Reprocess / Retrain controls (2.6)
  const [reprocessDataset, setReprocessDataset] = useState('grid-load-hourly');
  const [reprocessStart, setReprocessStart] = useState('2026-10-27');
  const [reprocessEnd, setReprocessEnd] = useState('2026-11-03');
  const [confirmAction, setConfirmAction] = useState<
    null | 'import' | 'reprocess' | 'retrain'
  >(null);

  const isRunning = jobState.status === 'Running';
  const canExecute = activeRole !== 'Viewer';

  const triggerProtectedJob = (kind: 'import' | 'reprocess' | 'retrain') => {
    if (isRunning) return;
    setConfirmAction(null);
    const nowLabel = '2026-11-03 01:08';
    const jobDesc =
      kind === 'import'
        ? `${sourceKind} (${importMode}, dup: ${dupPolicy}) -> ${targetDataset}`
        : kind === 'reprocess'
          ? `Reprocess ${reprocessDataset} (${reprocessStart} to ${reprocessEnd})`
          : `Retrain GRU v2.5.1 candidate on ${reprocessDataset}`;

    setJobState({
      status: 'Running',
      label: jobDesc,
      operator: currentOperatorName,
      timestamp: nowLabel,
    });

    setTimeout(() => {
      setJobState({
        status: 'Succeeded',
        label: jobDesc,
        operator: currentOperatorName,
        timestamp: nowLabel,
      });

      const newHistory: ImportHistoryRecord = {
        id: `IMP-${Math.floor(900 + Math.random() * 90)}`,
        timestamp: nowLabel,
        dataset: kind === 'import' ? targetDataset : reprocessDataset,
        operator: currentOperatorName,
        method: kind === 'import' ? sourceKind : 'Reprocess',
        rowsSucceeded: kind === 'import' ? 4320 : 16800,
        rowsFailed: 0,
        status: 'Succeeded',
        errorType: 'None',
        errorMessage: `${jobDesc} completed cleanly.`,
        duration: '2.4s',
      };
      onRecordImportOrJob(newHistory, jobDesc);
      onNotify(`Completed: ${jobDesc}`);
    }, 1400);
  };

  return (
    <View style={styles.pageStack}>
      {/* Live Job Execution Status Banner (Feature 2.6) */}
      <SurfaceCard>
        <View style={styles.jobStatusBanner}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.inlineControls}>
              <StatusPill
                label={jobState.status === 'Idle' ? 'Idle · Ready' : jobState.status}
                tone={
                  jobState.status === 'Running'
                    ? 'info'
                    : jobState.status === 'Succeeded'
                      ? 'success'
                      : jobState.status === 'Failed'
                        ? 'danger'
                        : 'neutral'
                }
              />
              <Text style={styles.rowTitle}>{jobState.label}</Text>
            </View>
            <Text style={styles.rowMeta}>
              Operator attribution: {jobState.operator} · Last trigger: {jobState.timestamp}
              {isRunning ? ' · Controls locked to prevent duplicate submission' : ''}
            </Text>
          </View>
          {!canExecute && <StatusPill label="Viewer (Read-only)" tone="warning" />}
        </View>
      </SurfaceCard>

      <View style={[styles.twoCol, isStacked && styles.twoColStacked]}>
        {/* 4-Step Import Wizard (Feature 2.2) */}
        <SurfaceCard style={{ flex: 1.4 }}>
          <SectionTitleBlock
            title="Guided Data Import Wizard"
            subtitle="Choose CSV / Excel / JSON or API stream, map schema, preview rows, and execute"
          />

          {/* Stepper */}
          <View style={styles.stepperBar}>
            {[
              { n: 1 as const, label: '1. Source' },
              { n: 2 as const, label: '2. Map Columns' },
              { n: 3 as const, label: '3. Preview' },
              { n: 4 as const, label: '4. Confirm & Run' },
            ].map((s) => {
              const active = step === s.n;
              const done = step > s.n;
              return (
                <Pressable
                  key={s.n}
                  onPress={() => setStep(s.n)}
                  style={[styles.stepPill, active && styles.stepPillActive, done && styles.stepPillDone]}
                >
                  {done && <Check size={13} color={colors.success} strokeWidth={2.4} />}
                  <Text
                    style={[
                      styles.stepPillText,
                      active && styles.stepPillTextActive,
                      done && { color: colors.success },
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {step === 1 && (
            <View style={{ gap: 14 }}>
              <View style={styles.inlineControls}>
                {(['CSV Upload', 'Excel Upload', 'JSON Upload', 'API Sync'] as const).map((kind) => (
                  <SoftButton
                    key={kind}
                    label={kind}
                    compact
                    variant={sourceKind === kind ? 'primary' : 'secondary'}
                    onPress={() => setSourceKind(kind)}
                  />
                ))}
              </View>

              {sourceKind === 'API Sync' ? (
                <View style={{ gap: 6 }}>
                  <Text style={styles.fieldLabel}>Source REST / Stream Endpoint</Text>
                  <TextInput
                    value={apiEndpoint}
                    onChangeText={setApiEndpoint}
                    style={styles.textField}
                  />
                </View>
              ) : (
                <Pressable
                  onPress={() =>
                    onNotify(`Selected sample ${sourceKind.split(' ')[0]} batch (4,320 rows).`)
                  }
                  style={styles.dropZone}
                >
                  <UploadCloud size={26} color={colors.primary} />
                  <Text style={styles.rowTitle}>
                    Tap to select {sourceKind.replace(' Upload', '')} file (sample_nov2026_batch)
                  </Text>
                  <Text style={styles.rowMeta}>
                    Supports UTF-8 CSV, XLSX workbooks, and newline-delimited JSON up to 250 MB
                  </Text>
                </Pressable>
              )}

              <View style={styles.inlineControls}>
                <SelectPill
                  label="Target Dataset"
                  value={targetDataset}
                  options={datasets.map((d) => d.slug)}
                  onChange={setTargetDataset}
                />
                <SelectPill
                  label="Import Mode"
                  value={importMode}
                  options={['Append', 'Replace', 'Merge'] as const}
                  onChange={setImportMode}
                />
                <SelectPill
                  label="Duplicates"
                  value={dupPolicy}
                  options={['Skip', 'Overwrite'] as const}
                  onChange={setDupPolicy}
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.listStack}>
              {[
                { src: 'ts_utc', dest: 'timestamp_utc (ISO-8601)', type: 'TIMESTAMP' },
                { src: 'load_mw', dest: 'metered_load_mw', type: 'FLOAT64' },
                { src: 'temp_c', dest: 'ambient_temp_c', type: 'FLOAT64' },
                { src: 'zone_code', dest: 'grid_region', type: 'ENUM' },
              ].map((m) => (
                <View key={m.src} style={styles.mappingRow}>
                  <Text style={styles.cellMono}>{m.src}</Text>
                  <Text style={styles.rowMeta}>maps to</Text>
                  <Text style={styles.rowTitle}>{m.dest}</Text>
                  <StatusPill label={m.type} tone="info" showDot={false} />
                </View>
              ))}
            </View>
          )}

          {step === 3 && (
            <View style={styles.listStack}>
              <Text style={styles.rowMeta}>
                Sample preview (first 3 of 4,320 parsed records · 0 schema errors):
              </Text>
              {[
                ['2026-11-03T00:15:00Z', '2,842.4 MW', '29.4 °C', 'Central Grid'],
                ['2026-11-03T00:30:00Z', '2,819.1 MW', '29.1 °C', 'Central Grid'],
                ['2026-11-03T00:45:00Z', '2,796.8 MW', '28.9 °C', 'Central Grid'],
              ].map((r, i) => (
                <View key={i} style={styles.mappingRow}>
                  <Text style={styles.cellMono}>{r[0]}</Text>
                  <Text style={styles.cellMono}>{r[1]}</Text>
                  <Text style={styles.cellText}>{r[2]}</Text>
                  <Text style={styles.cellText}>{r[3]}</Text>
                </View>
              ))}
            </View>
          )}

          {step === 4 && (
            <KeyValueGrid
              items={[
                { label: 'Source Method', value: sourceKind },
                { label: 'Target Dataset', value: targetDataset, mono: true },
                { label: 'Import Mode', value: importMode },
                { label: 'Duplicate Policy', value: dupPolicy },
                { label: 'Estimated Rows', value: '4,320 rows', mono: true },
                { label: 'Operator', value: currentOperatorName },
              ]}
            />
          )}

          <View style={styles.wizardFooter}>
            <SoftButton
              label="Previous"
              variant="secondary"
              disabled={step === 1}
              onPress={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
            />
            {step < 4 ? (
              <SoftButton
                label="Next Step"
                variant="primary"
                onPress={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
              />
            ) : (
              <SoftButton
                label={isRunning ? 'Job Running...' : 'Confirm & Run Import'}
                variant="primary"
                disabled={isRunning || !canExecute}
                icon={<Play size={14} color={colors.primaryForeground} />}
                onPress={() => setConfirmAction('import')}
              />
            )}
          </View>
        </SurfaceCard>

        {/* Reprocess & Model Retrain Panel (Feature 2.6) */}
        <SurfaceCard style={{ flex: 1 }}>
          <SectionTitleBlock
            title="Reprocess & Retrain Trigger"
            subtitle="Re-run feature normalization or trigger GRU retraining over a selected window"
          />

          <View style={{ gap: 12 }}>
            <SelectPill
              label="Dataset"
              value={reprocessDataset}
              options={datasets.map((d) => d.slug)}
              onChange={setReprocessDataset}
            />

            <View style={{ gap: 6 }}>
              <Text style={styles.fieldLabel}>Window Start (YYYY-MM-DD)</Text>
              <TextInput
                value={reprocessStart}
                onChangeText={setReprocessStart}
                style={styles.textField}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.fieldLabel}>Window End (YYYY-MM-DD)</Text>
              <TextInput
                value={reprocessEnd}
                onChangeText={setReprocessEnd}
                style={styles.textField}
              />
            </View>

            <View style={styles.triggerBtnStack}>
              <SoftButton
                label={isRunning ? 'Pipeline Locked (Running)' : 'Reprocess Selected Window'}
                variant="secondary"
                fullWidth
                disabled={isRunning || !canExecute}
                icon={<RefreshCw size={15} color={colors.foreground} />}
                onPress={() => setConfirmAction('reprocess')}
              />
              <SoftButton
                label={isRunning ? 'Training Locked (Running)' : 'Trigger GRU Candidate Retrain'}
                variant="primary"
                fullWidth
                disabled={isRunning || activeRole !== 'Admin'}
                icon={<Sparkles size={15} color={colors.primaryForeground} />}
                onPress={() => setConfirmAction('retrain')}
              />
              {activeRole !== 'Admin' && (
                <Text style={styles.rowMeta}>
                  Note: GRU model retraining is restricted to Admin accounts.
                </Text>
              )}
            </View>
          </View>
        </SurfaceCard>
      </View>

      <ConfirmActionModal
        visible={!!confirmAction}
        title={
          confirmAction === 'import'
            ? 'Confirm Data Import Execution'
            : confirmAction === 'reprocess'
              ? 'Confirm Pipeline Reprocessing'
              : 'Confirm GRU Model Retraining'
        }
        description={
          confirmAction === 'import'
            ? `Run ${sourceKind} into "${targetDataset}" using ${importMode} mode (${dupPolicy} duplicates)?`
            : confirmAction === 'reprocess'
              ? `Recompute cleaned tensors for "${reprocessDataset}" from ${reprocessStart} to ${reprocessEnd}?`
              : `Launch candidate GRU retraining using "${reprocessDataset}" (${reprocessStart} to ${reprocessEnd})? Action will be logged under ${currentOperatorName}.`
        }
        confirmLabel="Confirm & Start"
        danger={importMode === 'Replace' && confirmAction === 'import'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && triggerProtectedJob(confirmAction)}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Page 2.3: Data Quality & Import History (2 Tabs)                           */
/* -------------------------------------------------------------------------- */
function QualityAndHistoryPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  datasets,
  qualityIssues,
  onResolveQualityIssue,
  importHistory,
  onRecordImportOrJob,
  currentOperatorName,
  activeRole,
  onNotify,
}: DataPagesProps) {
  const [activeTab, setActiveTab] = useState<'Data Quality' | 'Import History'>('Data Quality');

  // Tab 1 filters
  const [issueTypeFilter, setIssueTypeFilter] = useState<'All' | QualityIssueType>('All');
  const [columnFilter, setColumnFilter] = useState('All Columns');
  const [selectedIssue, setSelectedIssue] = useState<QualityIssueRecord | null>(null);

  // Tab 2 filters
  const [historyStatus, setHistoryStatus] = useState<'All' | 'Succeeded' | 'Partial' | 'Failed'>('All');
  const [errorTypeFilter, setErrorTypeFilter] = useState('All Errors');
  const [selectedImport, setSelectedImport] = useState<ImportHistoryRecord | null>(null);

  const canMutate = activeRole !== 'Viewer';

  const filteredIssues = useMemo(() => {
    return qualityIssues.filter((q) => {
      if (filters.dataset !== 'All Datasets' && q.dataset !== filters.dataset) return false;
      if (issueTypeFilter !== 'All' && q.issueType !== issueTypeFilter) return false;
      if (columnFilter !== 'All Columns' && !q.column.includes(columnFilter)) return false;
      return true;
    });
  }, [qualityIssues, filters.dataset, issueTypeFilter, columnFilter]);

  const filteredHistory = useMemo(() => {
    return importHistory.filter((h) => {
      if (filters.dataset !== 'All Datasets' && h.dataset !== filters.dataset) return false;
      if (filters.operator !== 'All Operators' && h.operator !== filters.operator) return false;
      if (historyStatus !== 'All' && h.status !== historyStatus) return false;
      if (errorTypeFilter !== 'All Errors' && h.errorType !== errorTypeFilter) return false;
      return true;
    });
  }, [importHistory, filters.dataset, filters.operator, historyStatus, errorTypeFilter]);

  const openIssueCount = qualityIssues.filter((i) => i.status === 'Open').length;

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={onResetFilters}
        showDateRange
        datasetOptions={['All Datasets', ...datasets.map((d) => d.slug)]}
        operatorOptions={
          activeTab === 'Import History'
            ? ['All Operators', 'Thanawat P.', 'Ananya S.', 'Nattapong K.', 'System Scheduler']
            : undefined
        }
      />

      <View style={styles.tabHeaderBar}>
        <SegmentedTabs
          options={['Data Quality', 'Import History'] as const}
          value={activeTab}
          onChange={setActiveTab}
          counts={{
            'Data Quality': openIssueCount,
            'Import History': filteredHistory.length,
          }}
        />

        {activeTab === 'Data Quality' ? (
          <View style={styles.inlineControls}>
            <SelectPill
              label="Problem"
              value={issueTypeFilter}
              options={[
                'All',
                'Missing Values',
                'Duplicate Rows',
                'Out of Range',
                'Invalid Format',
                'Time Gap',
              ] as const}
              onChange={setIssueTypeFilter}
            />
            <SelectPill
              label="Column"
              value={columnFilter}
              options={[
                'All Columns',
                'net_output_mw',
                'timestamp_utc',
                'power_factor',
                'reading_date',
              ] as const}
              onChange={setColumnFilter}
            />
            <SoftButton
              label="Quality Report"
              compact
              icon={<Download size={14} color={colors.foreground} />}
              onPress={() => onNotify('Downloaded Data Quality Audit Report (PDF/CSV).')}
            />
          </View>
        ) : (
          <View style={styles.inlineControls}>
            <SelectPill
              label="Status"
              value={historyStatus}
              options={['All', 'Succeeded', 'Partial', 'Failed'] as const}
              onChange={setHistoryStatus}
            />
            <SelectPill
              label="Error Type"
              value={errorTypeFilter}
              options={['All Errors', 'None', 'Schema Mismatch', 'Duplicate Key', 'Timeout'] as const}
              onChange={setErrorTypeFilter}
            />
          </View>
        )}
      </View>

      {activeTab === 'Data Quality' ? (
        <>
          <SurfaceCard>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Overall Completeness</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>98.7%</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Missing Values</Text>
                <Text style={styles.summaryValue}>18</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Duplicate Rows</Text>
                <Text style={styles.summaryValue}>42</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Out-of-Range / Format</Text>
                <Text style={styles.summaryValue}>16</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Missing Time Slots</Text>
                <Text style={[styles.summaryValue, { color: colors.danger }]}>48h</Text>
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionTitleBlock
              title="Validation Findings & Guided Remediation"
              subtitle="Inspect affected rows or apply recommended automated cleanup"
            />
            <View style={styles.listStack}>
              {filteredIssues.map((q) => (
                <Pressable
                  key={q.id}
                  onPress={() => setSelectedIssue(q)}
                  style={styles.qualityRow}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.inlineControls}>
                      <Text style={styles.rowTitle}>
                        {q.issueType} · <Text style={styles.monoSub}>{q.column}</Text>
                      </Text>
                      <StatusPill label={q.severity} />
                      <StatusPill label={q.status} />
                    </View>
                    <Text style={styles.rowMeta}>
                      Dataset: {q.dataset} · {q.affectedRows} affected rows · Window: {q.timeWindow}
                    </Text>
                    <Text style={styles.fixSuggestion}>Recommended: {q.recommendedFix}</Text>
                  </View>

                  <View style={styles.inlineControls}>
                    <SoftButton
                      label="Inspect Rows"
                      compact
                      variant="secondary"
                      onPress={() => setSelectedIssue(q)}
                    />
                    {q.status === 'Open' && canMutate && (
                      <SoftButton
                        label="Apply Fix"
                        compact
                        variant="primary"
                        icon={<Wrench size={13} color={colors.primaryForeground} />}
                        onPress={() => {
                          onResolveQualityIssue(q.id);
                          onNotify(`Applied "${q.recommendedFix}" on ${q.dataset}.`);
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </SurfaceCard>
        </>
      ) : (
        <SurfaceCard>
          <SectionTitleBlock
            title="Ingestion Execution Log"
            subtitle="Tap any run to view detailed error messages, download logs, or retry failed imports"
          />
          <View style={styles.listStack}>
            {filteredHistory.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setSelectedImport(item)}
                style={styles.qualityRow}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.inlineControls}>
                    <FileSpreadsheet size={15} color={colors.primary} />
                    <Text style={styles.rowTitle}>
                      {item.dataset} · {item.method}
                    </Text>
                    <StatusPill label={item.status} />
                    {item.errorType !== 'None' && (
                      <StatusPill label={item.errorType} tone="warning" showDot={false} />
                    )}
                  </View>
                  <Text style={styles.rowMeta}>
                    {item.timestamp} · Operator: {item.operator} · Succeeded:{' '}
                    {item.rowsSucceeded.toLocaleString()} / Failed: {item.rowsFailed.toLocaleString()}{' '}
                    ({item.duration})
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {item.errorMessage}
                  </Text>
                </View>

                <View style={styles.inlineControls}>
                  <SoftButton
                    label="Log"
                    compact
                    variant="secondary"
                    icon={<Download size={13} color={colors.foreground} />}
                    onPress={() => onNotify(`Downloaded execution log for ${item.id}.`)}
                  />
                  {item.status !== 'Succeeded' && canMutate && (
                    <SoftButton
                      label="Retry"
                      compact
                      variant="primary"
                      icon={<RotateCcw size={13} color={colors.primaryForeground} />}
                      onPress={() => {
                        const retried: ImportHistoryRecord = {
                          ...item,
                          id: `IMP-${Math.floor(900 + Math.random() * 99)}`,
                          timestamp: '2026-11-03 01:09',
                          operator: currentOperatorName,
                          rowsSucceeded: item.rowsSucceeded + item.rowsFailed,
                          rowsFailed: 0,
                          status: 'Succeeded',
                          errorType: 'None',
                          errorMessage: `Retried ${item.id} cleanly after schema normalization.`,
                        };
                        onRecordImportOrJob(retried, `Retried import ${item.id}`);
                        onNotify(`Retry succeeded for ${item.dataset}.`);
                      }}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </SurfaceCard>
      )}

      {/* Problematic Rows Drawer */}
      <DetailDrawerSheet
        visible={!!selectedIssue}
        title={selectedIssue ? `${selectedIssue.issueType} (${selectedIssue.dataset})` : ''}
        subtitle={selectedIssue ? `Column: ${selectedIssue.column} · ${selectedIssue.timeWindow}` : ''}
        onClose={() => setSelectedIssue(null)}
        footer={
          selectedIssue && selectedIssue.status === 'Open' && canMutate ? (
            <SoftButton
              label={`Apply ${selectedIssue.recommendedFix}`}
              variant="primary"
              onPress={() => {
                onResolveQualityIssue(selectedIssue.id);
                setSelectedIssue(null);
                onNotify(`Resolved ${selectedIssue.id} via ${selectedIssue.recommendedFix}.`);
              }}
            />
          ) : (
            <SoftButton label="Close" variant="secondary" onPress={() => setSelectedIssue(null)} />
          )
        }
      >
        {selectedIssue && (
          <>
            <View style={styles.inlineControls}>
              <StatusPill label={selectedIssue.severity} />
              <StatusPill label={selectedIssue.status} />
            </View>
            <Text style={styles.fieldLabel}>Flagged Sample Records</Text>
            {selectedIssue.sampleRows.map((r) => (
              <View key={r.rowNum} style={styles.codeWell}>
                <Text style={styles.codeMono}>
                  Row #{r.rowNum} · {r.timestamp}
                </Text>
                <Text style={styles.rowTitle}>Value: {r.rawValue}</Text>
                <Text style={styles.rowMeta}>{r.note}</Text>
              </View>
            ))}
          </>
        )}
      </DetailDrawerSheet>

      {/* Import Error Detail Drawer */}
      <DetailDrawerSheet
        visible={!!selectedImport}
        title={selectedImport ? `Import Run ${selectedImport.id}` : ''}
        subtitle={selectedImport ? `${selectedImport.dataset} · ${selectedImport.timestamp}` : ''}
        onClose={() => setSelectedImport(null)}
        footer={
          <SoftButton
            label="Download Full Log"
            variant="secondary"
            icon={<Download size={14} color={colors.foreground} />}
            onPress={() => {
              if (selectedImport) onNotify(`Downloaded ${selectedImport.id}.log`);
              setSelectedImport(null);
            }}
          />
        }
      >
        {selectedImport && (
          <>
            <StatusPill label={selectedImport.status} />
            <KeyValueGrid
              items={[
                { label: 'Method', value: selectedImport.method },
                { label: 'Operator', value: selectedImport.operator },
                {
                  label: 'Rows Succeeded',
                  value: selectedImport.rowsSucceeded.toLocaleString(),
                  mono: true,
                },
                {
                  label: 'Rows Failed',
                  value: selectedImport.rowsFailed.toLocaleString(),
                  mono: true,
                },
                { label: 'Error Class', value: selectedImport.errorType },
                { label: 'Duration', value: selectedImport.duration, mono: true },
              ]}
            />
            <View style={styles.codeWell}>
              <Text style={styles.codeLabel}>Diagnostic Output</Text>
              <Text style={styles.codeMono}>{selectedImport.errorMessage}</Text>
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    minWidth: 120,
    gap: 2,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  summaryValue: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    color: colors.foreground,
  },
  tableHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  thStatic: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 12.5,
    color: colors.mutedForeground,
    paddingVertical: 10,
  },
  desktopTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  mobileRecordCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  mobileCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  mobileMetaGrid: {
    gap: 3,
  },
  listStack: {
    gap: 2,
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
  monoSub: {
    ...typography.mono,
    color: colors.mutedForeground,
  },
  cellText: {
    ...typography.bodySm,
    color: colors.readForeground,
  },
  cellMono: {
    ...typography.monoStrong,
    color: colors.foreground,
  },
  codeWell: {
    backgroundColor: colors.cardSubtle,
    borderRadius: 14,
    padding: 13,
    gap: 4,
  },
  codeLabel: {
    ...typography.label,
    color: colors.foreground,
  },
  codeMono: {
    ...typography.mono,
    color: colors.readForeground,
  },
  jobStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  stepperBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  stepPill: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: radius.full,
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepPillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  stepPillDone: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  stepPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.readForeground,
  },
  stepPillTextActive: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.primary,
  },
  dropZone: {
    minHeight: 132,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 6,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.foreground,
  },
  textField: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSubtle,
    paddingHorizontal: 14,
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.foreground,
  },
  mappingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  wizardFooter: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  triggerBtnStack: {
    marginTop: 6,
    gap: 10,
  },
  tabHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fixSuggestion: {
    ...typography.caption,
    fontFamily: fonts.sansMedium,
    color: colors.primary,
  },
});
