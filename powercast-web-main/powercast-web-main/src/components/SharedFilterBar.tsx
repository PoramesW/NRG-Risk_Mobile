import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Calendar, RotateCcw, SlidersHorizontal } from 'lucide-react-native';
import {
  DateRangePreset,
  EnergyType,
  Granularity,
  RegionName,
  SharedFiltersState,
} from '@/types';
import { colors, fonts, radius, shadow, typography } from '@/utils/theme';
import {
  DetailDrawerSheet,
  SearchField,
  SelectPill,
  SoftButton,
} from './AdminPrimitives';

const DATE_PRESETS: readonly DateRangePreset[] = ['Today', '7D', '30D', '1Y', 'Custom'];
const GRANULARITIES: readonly Granularity[] = ['Hourly', 'Daily', 'Weekly', 'Monthly'];
const ENERGY_TYPES: readonly EnergyType[] = ['All', 'Electricity', 'Renewables', 'Gas', 'Oil'];
const REGIONS: readonly RegionName[] = [
  'All Regions',
  'Central Grid',
  'East Industrial',
  'Northeast',
  'North',
  'South',
];

export interface SharedFilterBarProps {
  filters: SharedFiltersState;
  onChange: (patch: Partial<SharedFiltersState>) => void;
  onReset?: () => void;
  showDateRange?: boolean;
  datePresets?: readonly string[];
  customDateValue?: string;
  onCustomPresetChange?: (val: string) => void;
  showGranularity?: boolean;
  showEnergyType?: boolean;
  showRegion?: boolean;
  datasetOptions?: readonly string[];
  statusOptions?: readonly string[];
  statusLabel?: string;
  operatorOptions?: readonly string[];
  searchPlaceholder?: string;
  extraInline?: React.ReactNode;
  extraSheetControls?: React.ReactNode;
}

export function SharedFilterBar({
  filters,
  onChange,
  onReset,
  showDateRange = false,
  datePresets,
  customDateValue,
  onCustomPresetChange,
  showGranularity = false,
  showEnergyType = false,
  showRegion = false,
  datasetOptions,
  statusOptions,
  statusLabel = 'Status',
  operatorOptions,
  searchPlaceholder,
  extraInline,
  extraSheetControls,
}: SharedFilterBarProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 820;
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (showEnergyType && filters.energyType !== 'All') count++;
    if (showRegion && filters.region !== 'All Regions') count++;
    if (showGranularity && filters.granularity !== 'Hourly') count++;
    if (datasetOptions && filters.dataset !== 'All Datasets') count++;
    if (statusOptions && !filters.status.startsWith('All')) count++;
    if (operatorOptions && filters.operator !== 'All Operators') count++;
    if (searchPlaceholder && filters.search.trim().length > 0) count++;
    return count;
  }, [
    showEnergyType,
    filters.energyType,
    showRegion,
    filters.region,
    showGranularity,
    filters.granularity,
    datasetOptions,
    filters.dataset,
    statusOptions,
    filters.status,
    operatorOptions,
    filters.operator,
    searchPlaceholder,
    filters.search,
  ]);

  const effectivePresets = datePresets ?? DATE_PRESETS;
  const currentPreset = customDateValue ?? filters.dateRange;

  if (isMobile) {
    return (
      <View style={styles.mobileWrapper}>
        {searchPlaceholder && (
          <SearchField
            value={filters.search}
            onChange={(search) => onChange({ search })}
            placeholder={searchPlaceholder}
          />
        )}

        <View style={styles.mobileRow}>
          {showDateRange && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mobilePresetScroll}
              style={{ flex: 1 }}
            >
              {effectivePresets.map((preset) => {
                const active = preset === currentPreset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() =>
                      onCustomPresetChange
                        ? onCustomPresetChange(preset)
                        : onChange({ dateRange: preset as DateRangePreset })
                    }
                    style={[styles.presetPill, active && styles.presetPillActive]}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>
                      {preset}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Pressable
            onPress={() => setSheetOpen(true)}
            style={styles.mobileFilterBtn}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <SlidersHorizontal size={16} color={colors.foreground} strokeWidth={2} />
            <Text style={styles.mobileFilterBtnText}>Filters</Text>
            {activeFilterCount > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {showDateRange && currentPreset === 'Custom' && (
          <View style={styles.customRangeBox}>
            <Calendar size={15} color={colors.primary} />
            <TextInput
              value={filters.customStart}
              onChangeText={(customStart) => onChange({ customStart })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              style={styles.dateInput}
            />
            <Text style={styles.toLabel}>to</Text>
            <TextInput
              value={filters.customEnd}
              onChangeText={(customEnd) => onChange({ customEnd })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              style={styles.dateInput}
            />
          </View>
        )}

        {extraInline ? <View style={styles.mobileExtraRow}>{extraInline}</View> : null}

        <DetailDrawerSheet
          visible={sheetOpen}
          title="Filter View"
          subtitle="Scope telemetry, datasets, and operational records"
          onClose={() => setSheetOpen(false)}
          footer={
            <View style={styles.sheetFooterRow}>
              {onReset && (
                <SoftButton
                  label="Reset all"
                  variant="secondary"
                  icon={<RotateCcw size={14} color={colors.foreground} />}
                  onPress={onReset}
                />
              )}
              <SoftButton
                label="Apply filters"
                variant="primary"
                onPress={() => setSheetOpen(false)}
              />
            </View>
          }
        >
          {showGranularity && (
            <FilterChipGroup
              title="Granularity"
              options={GRANULARITIES}
              value={filters.granularity}
              onSelect={(granularity) => onChange({ granularity })}
            />
          )}
          {showEnergyType && (
            <FilterChipGroup
              title="Energy Carrier"
              options={ENERGY_TYPES}
              value={filters.energyType}
              onSelect={(energyType) => onChange({ energyType })}
            />
          )}
          {showRegion && (
            <FilterChipGroup
              title="Region / Grid Zone"
              options={REGIONS}
              value={filters.region}
              onSelect={(region) => onChange({ region })}
            />
          )}
          {datasetOptions && (
            <FilterChipGroup
              title="Dataset"
              options={datasetOptions}
              value={filters.dataset}
              onSelect={(dataset) => onChange({ dataset })}
            />
          )}
          {statusOptions && (
            <FilterChipGroup
              title={statusLabel}
              options={statusOptions}
              value={filters.status}
              onSelect={(status) => onChange({ status })}
            />
          )}
          {operatorOptions && (
            <FilterChipGroup
              title="Operator / User"
              options={operatorOptions}
              value={filters.operator}
              onSelect={(operator) => onChange({ operator })}
            />
          )}
          {extraSheetControls}
        </DetailDrawerSheet>
      </View>
    );
  }

  return (
    <View style={styles.desktopBar}>
      {searchPlaceholder && (
        <View style={{ minWidth: 240, maxWidth: 320, flex: 1 }}>
          <SearchField
            value={filters.search}
            onChange={(search) => onChange({ search })}
            placeholder={searchPlaceholder}
          />
        </View>
      )}

      {showDateRange && (
        <View style={styles.presetGroup}>
          {effectivePresets.map((preset) => {
            const active = preset === currentPreset;
            return (
              <Pressable
                key={preset}
                onPress={() =>
                  onCustomPresetChange
                    ? onCustomPresetChange(preset)
                    : onChange({ dateRange: preset as DateRangePreset })
                }
                style={[styles.presetPill, active && styles.presetPillActive]}
              >
                <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {showDateRange && currentPreset === 'Custom' && (
        <View style={styles.customRangeBox}>
          <Calendar size={14} color={colors.primary} />
          <TextInput
            value={filters.customStart}
            onChangeText={(customStart) => onChange({ customStart })}
            style={styles.dateInput}
            accessibilityLabel="Start date"
          />
          <Text style={styles.toLabel}>to</Text>
          <TextInput
            value={filters.customEnd}
            onChangeText={(customEnd) => onChange({ customEnd })}
            style={styles.dateInput}
            accessibilityLabel="End date"
          />
        </View>
      )}

      {showGranularity && (
        <SelectPill
          label="Resolution"
          value={filters.granularity}
          options={GRANULARITIES}
          onChange={(granularity) => onChange({ granularity })}
        />
      )}

      {showEnergyType && (
        <SelectPill
          label="Energy"
          value={filters.energyType}
          options={ENERGY_TYPES}
          onChange={(energyType) => onChange({ energyType })}
        />
      )}

      {showRegion && (
        <SelectPill
          label="Region"
          value={filters.region}
          options={REGIONS}
          onChange={(region) => onChange({ region })}
        />
      )}

      {datasetOptions && (
        <SelectPill
          label="Dataset"
          value={filters.dataset}
          options={datasetOptions}
          onChange={(dataset) => onChange({ dataset })}
        />
      )}

      {statusOptions && (
        <SelectPill
          label={statusLabel}
          value={filters.status}
          options={statusOptions}
          onChange={(status) => onChange({ status })}
        />
      )}

      {operatorOptions && (
        <SelectPill
          label="User"
          value={filters.operator}
          options={operatorOptions}
          onChange={(operator) => onChange({ operator })}
        />
      )}

      {extraInline}
      {extraSheetControls}

      {onReset && activeFilterCount > 0 && (
        <SoftButton
          label="Reset"
          compact
          variant="subtle"
          icon={<RotateCcw size={13} color={colors.readForeground} />}
          onPress={onReset}
        />
      )}
    </View>
  );
}

function FilterChipGroup<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: readonly T[];
  value: T;
  onSelect: (val: T) => void;
}) {
  return (
    <View style={styles.chipSection}>
      <Text style={styles.chipSectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onSelect(opt)}
              style={[styles.sheetChip, active && styles.sheetChipActive]}
            >
              <Text style={[styles.sheetChipText, active && styles.sheetChipTextActive]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopBar: {
    backgroundColor: colors.card,
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    ...shadow.subtle,
  },
  presetGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.full,
    padding: 3,
    gap: 2,
  },
  presetPill: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetPillActive: {
    backgroundColor: colors.card,
    ...shadow.subtle,
  },
  presetText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.readForeground,
  },
  presetTextActive: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.primary,
  },
  customRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  dateInput: {
    fontFamily: fonts.mono,
    fontSize: 12.5,
    color: colors.foreground,
    minWidth: 88,
    paddingVertical: 4,
  },
  toLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  mobileWrapper: {
    gap: 10,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobilePresetScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 3,
  },
  mobileFilterBtn: {
    minHeight: 44,
    paddingHorizontal: 15,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    ...shadow.subtle,
  },
  mobileFilterBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 13.5,
    color: colors.foreground,
  },
  activeBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  activeBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.primaryForeground,
  },
  mobileExtraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  chipSection: {
    gap: 8,
  },
  chipSectionTitle: {
    ...typography.label,
    color: colors.foreground,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetChip: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  sheetChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  sheetChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    color: colors.readForeground,
  },
  sheetChipTextActive: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.primary,
  },
});

