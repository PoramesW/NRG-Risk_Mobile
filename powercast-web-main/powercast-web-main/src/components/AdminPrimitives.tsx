import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react-native';
import { colors, focusRing, fonts, radius, shadow, typography } from '@/utils/theme';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function toneFromStatus(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (
    s.includes('operational') ||
    s.includes('current') ||
    s.includes('active') ||
    s.includes('succeeded') ||
    s.includes('success') ||
    s.includes('ready') ||
    s.includes('resolved') ||
    s === 'low'
  ) {
    return 'success';
  }
  if (
    s.includes('slow') ||
    s.includes('delayed') ||
    s.includes('partial') ||
    s.includes('warning') ||
    s.includes('medium') ||
    s.includes('pending') ||
    s.includes('degraded') ||
    s.includes('review') ||
    s.includes('acknowledged')
  ) {
    return 'warning';
  }
  if (
    s.includes('critical') ||
    s.includes('high') ||
    s.includes('failed') ||
    s.includes('error') ||
    s.includes('stalled') ||
    s.includes('suspended') ||
    s.includes('outage') ||
    s.includes('open') ||
    s.includes('new')
  ) {
    return 'danger';
  }
  if (s.includes('running') || s.includes('training') || s.includes('queued') || s.includes('info')) {
    return 'info';
  }
  return 'neutral';
}

export function SurfaceCard({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle | (ViewStyle | false | null | undefined)[];
  padded?: boolean;
}) {
  return (
    <View style={[styles.surfaceCard, padded && styles.surfaceCardPadded, style as any]}>
      {children}
    </View>
  );
}

export function SectionTitleBlock({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.sectionHeaderRight}>{right}</View> : null}
    </View>
  );
}

export function StatusPill({
  label,
  tone,
  showDot = true,
}: {
  label: string;
  tone?: BadgeTone;
  showDot?: boolean;
}) {
  const resolved = tone ?? toneFromStatus(label);
  const palette = {
    success: { bg: colors.successBg, border: colors.successBorder, text: colors.success, dot: colors.successDot },
    warning: { bg: colors.warnBg, border: colors.warnBorder, text: colors.warn, dot: colors.warnDot },
    danger: { bg: colors.dangerBg, border: colors.dangerBorder, text: colors.danger, dot: colors.dangerDot },
    info: { bg: colors.infoBg, border: colors.infoBorder, text: colors.info, dot: colors.infoDot },
    neutral: { bg: colors.cardMuted, border: colors.border, text: colors.readForeground, dot: colors.mutedForeground },
  }[resolved];

  return (
    <View style={[styles.pillBadge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      {showDot && <View style={[styles.pillDot, { backgroundColor: palette.dot }]} />}
      <Text style={[styles.pillText, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function SoftButton({
  label,
  onPress,
  variant = 'secondary',
  icon,
  disabled = false,
  compact = false,
  fullWidth = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'subtle' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={(state) => {
        const { hovered, pressed, focused } = state as {
          hovered?: boolean;
          pressed: boolean;
          focused?: boolean;
        };
        const active = !disabled && (hovered || pressed);
        const variantStyle =
          variant === 'primary'
            ? {
                backgroundColor: disabled
                  ? colors.cardMuted
                  : active
                    ? colors.primaryHover
                    : colors.primary,
                borderColor: disabled ? colors.border : colors.primary,
              }
            : variant === 'danger'
              ? {
                  backgroundColor: disabled
                    ? colors.cardMuted
                    : active
                      ? '#FFE4E6'
                      : colors.dangerBg,
                  borderColor: disabled ? colors.border : colors.dangerBorder,
                }
              : variant === 'subtle'
                ? {
                    backgroundColor: active ? colors.cardMuted : 'transparent',
                    borderColor: 'transparent',
                  }
                : {
                    backgroundColor: active ? colors.cardMuted : colors.card,
                    borderColor: active ? colors.borderStrong : colors.border,
                  };

        return [
          styles.softButton,
          compact && styles.softButtonCompact,
          fullWidth && { width: '100%' },
          variantStyle,
          focusRing(focused),
        ];
      }}
    >
      {icon}
      <Text
        style={[
          styles.softButtonText,
          compact && styles.softButtonTextCompact,
          variant === 'primary' && !disabled && { color: colors.primaryForeground },
          variant === 'danger' && !disabled && { color: colors.danger },
          disabled && { color: colors.mutedForeground },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.segmentedTrack}
    >
      {options.map((opt) => {
        const active = opt === value;
        const count = counts?.[opt];
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={(state) => [
              styles.segmentedItem,
              active && styles.segmentedItemActive,
              focusRing((state as { focused?: boolean }).focused),
            ]}
          >
            <Text style={[styles.segmentedText, active && styles.segmentedTextActive]}>{opt}</Text>
            {typeof count === 'number' && (
              <View style={[styles.countChip, active && styles.countChipActive]}>
                <Text style={[styles.countChipText, active && styles.countChipTextActive]}>
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      style={(state) => [
        styles.toggleButton,
        focusRing((state as { focused?: boolean }).focused),
      ]}
    >
      <View style={[styles.toggleTrack, checked && styles.toggleTrackOn]}>
        <View style={[styles.toggleThumb, checked && styles.toggleThumbOn]} />
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

export function SelectPill<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (next: T) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        style={(state) => [
          styles.selectTrigger,
          focusRing((state as { focused?: boolean }).focused),
        ]}
      >
        <Text style={styles.selectPrefix}>{label}:</Text>
        <Text style={styles.selectValue} numberOfLines={1}>
          {value}
        </Text>
        <ChevronDown size={14} color={colors.mutedForeground} strokeWidth={2} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.pickerCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select {label}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                style={styles.closeIconBtn}
                accessibilityLabel="Close selector"
              >
                <X size={18} color={colors.readForeground} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 340 }}>
              {options.map((opt) => {
                const selected = opt === value;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    style={[styles.pickerOption, selected && styles.pickerOptionSelected]}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        selected && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                    {selected && <Check size={16} color={colors.primary} strokeWidth={2.2} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.searchBox}>
      <Search size={16} color={colors.mutedForeground} strokeWidth={1.9} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={styles.searchInput}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          style={styles.clearSearchBtn}
          accessibilityLabel="Clear search"
        >
          <X size={14} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

export function SortHeaderButton({
  label,
  active,
  direction,
  onPress,
  flex = 1,
}: {
  label: string;
  active: boolean;
  direction: 'asc' | 'desc';
  onPress: () => void;
  flex?: number;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tableHeaderCell, { flex }]}>
      <Text style={[styles.tableHeaderText, active && { color: colors.foreground }]}>{label}</Text>
      {active ? (
        direction === 'asc' ? (
          <ArrowUp size={13} color={colors.primary} strokeWidth={2} />
        ) : (
          <ArrowDown size={13} color={colors.primary} strokeWidth={2} />
        )
      ) : null}
    </Pressable>
  );
}

export function PaginationFooter({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (next: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  return (
    <View style={styles.paginationBar}>
      <Text style={styles.paginationMeta}>
        Showing {start}–{end} of {totalItems}
      </Text>
      <View style={styles.paginationControls}>
        <Pressable
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
          style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
          accessibilityLabel="Previous page"
        >
          <ChevronLeft size={16} color={page <= 1 ? colors.mutedForeground : colors.foreground} />
        </Pressable>
        <Text style={styles.pageIndicator}>
          Page {page} / {Math.max(1, totalPages)}
        </Text>
        <Pressable
          disabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
          style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
          accessibilityLabel="Next page"
        >
          <ChevronRight
            size={16}
            color={page >= totalPages ? colors.mutedForeground : colors.foreground}
          />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Contextual Detail Drawer (Right-side sheet on Desktop >= 768px, Bottom Sheet on Mobile < 768px).
 */
export function DetailDrawerSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.drawerBackdrop, isMobile ? styles.drawerBackdropMobile : styles.drawerBackdropDesktop]}
        onPress={onClose}
      >
        <Pressable
          style={[styles.drawerPanel, isMobile ? styles.drawerPanelMobile : styles.drawerPanelDesktop]}
          onPress={(e) => e.stopPropagation()}
        >
          {isMobile && <View style={styles.sheetHandle} />}
          <View style={styles.drawerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.drawerTitle}>{title}</Text>
              {subtitle ? <Text style={styles.drawerSubtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeIconBtn}
              accessibilityLabel="Close details"
            >
              <X size={20} color={colors.readForeground} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.drawerBody}
            contentContainerStyle={{ paddingBottom: 20, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? <View style={styles.drawerFooter}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Confirmation Modal with optional mandatory reason input (for Suspend / Delete / Reprocess).
 */
export function ConfirmActionModal({
  visible,
  title,
  description,
  confirmLabel,
  danger = false,
  requireReason = false,
  reasonPlaceholder = 'Provide an operational or audit reason...',
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const canSubmit = !requireReason || reason.trim().length >= 4;

  const handleConfirm = () => {
    if (!canSubmit) return;
    const captured = reason.trim();
    setReason('');
    onConfirm(captured);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable style={styles.confirmCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmDesc}>{description}</Text>

          {requireReason && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.reasonLabel}>Audit reason (required)</Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder={reasonPlaceholder}
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={styles.reasonInput}
              />
            </View>
          )}

          <View style={styles.confirmActions}>
            <SoftButton label="Cancel" onPress={onCancel} variant="secondary" />
            <SoftButton
              label={confirmLabel}
              onPress={handleConfirm}
              variant={danger ? 'danger' : 'primary'}
              disabled={!canSubmit}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function KeyValueGrid({
  items,
}: {
  items: { label: string; value: string; mono?: boolean }[];
}) {
  return (
    <View style={styles.kvGrid}>
      {items.map((item) => (
        <View key={item.label} style={styles.kvCell}>
          <Text style={styles.kvLabel}>{item.label}</Text>
          <Text style={[styles.kvValue, item.mono && styles.kvValueMono]} numberOfLines={2}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  surfaceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  surfaceCardPadded: {
    padding: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  sectionHeaderText: {
    flex: 1,
    minWidth: 200,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.foreground,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: 3,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  pillText: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  softButton: {
    minHeight: 42,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  softButtonCompact: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  softButtonText: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.foreground,
  },
  softButtonTextCompact: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  segmentedTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  segmentedItem: {
    minHeight: 38,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  segmentedItemActive: {
    backgroundColor: colors.card,
    ...shadow.subtle,
  },
  segmentedText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.readForeground,
  },
  segmentedTextActive: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.foreground,
  },
  countChip: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  countChipActive: {
    backgroundColor: colors.primarySoft,
  },
  countChipText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.readForeground,
  },
  countChipTextActive: {
    color: colors.primary,
  },
  toggleButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  toggleTrack: {
    width: 38,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.card,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.readForeground,
  },
  selectTrigger: {
    minHeight: 40,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectPrefix: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.mutedForeground,
  },
  selectValue: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 17,
    color: colors.foreground,
    maxWidth: 150,
  },
  searchBox: {
    minHeight: 42,
    minWidth: 210,
    flex: 1,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.foreground,
    paddingVertical: 8,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  clearSearchBtn: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  tableHeaderText: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 12.5,
    color: colors.mutedForeground,
  },
  paginationBar: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  paginationMeta: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.45,
  },
  pageIndicator: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.foreground,
    paddingHorizontal: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadow.floating,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pickerTitle: {
    ...typography.h3,
    color: colors.foreground,
  },
  closeIconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.cardSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOption: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerOptionSelected: {
    backgroundColor: colors.primarySoft,
  },
  pickerOptionText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14.5,
    color: colors.foreground,
  },
  pickerOptionTextSelected: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.primary,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  drawerBackdropDesktop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  drawerBackdropMobile: {
    justifyContent: 'flex-end',
  },
  drawerPanel: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    ...shadow.floating,
  },
  drawerPanelDesktop: {
    width: 480,
    maxWidth: '92%',
    flex: 1,
    borderLeftWidth: 1,
    padding: 24,
  },
  drawerPanelMobile: {
    width: '100%',
    maxHeight: '88%',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerTitle: {
    ...typography.h2,
    color: colors.foreground,
  },
  drawerSubtitle: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  drawerBody: {
    marginTop: 16,
  },
  drawerFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    ...shadow.floating,
  },
  confirmTitle: {
    ...typography.h2,
    color: colors.foreground,
  },
  confirmDesc: {
    ...typography.bodySm,
    color: colors.readForeground,
    marginTop: 8,
  },
  reasonLabel: {
    ...typography.label,
    color: colors.foreground,
    marginBottom: 6,
  },
  reasonInput: {
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSubtle,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.foreground,
    textAlignVertical: 'top',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  kvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kvCell: {
    minWidth: '46%',
    flex: 1,
    backgroundColor: colors.cardSubtle,
    borderRadius: 14,
    padding: 12,
  },
  kvLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 3,
  },
  kvValue: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 13.5,
    color: colors.foreground,
  },
  kvValueMono: {
    ...typography.monoStrong,
    color: colors.foreground,
  },
});
