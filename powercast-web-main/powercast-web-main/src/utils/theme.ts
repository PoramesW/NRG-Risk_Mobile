/**
 * Global theme for PowerCast — "Modern Soft Minimal — Rounded Enterprise UI".
 *
 * Daylight porcelain canvas (#F5F7FB), pure white generously rounded panels (#FFFFFF),
 * soft slate offset shadows, Manrope UI/display typography paired with JetBrains Mono
 * tabular telemetry, and accessible high-contrast semantic hues.
 */
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const tokens = {
  color: {
    canvas: '#F5F7FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF2F8',
    surfaceSubtle: '#F8FAFD',
    surfaceAccent: '#EFF6FF',
    border: '#E2E8F2',
    borderStrong: '#CBD5E4',
    ink: '#0F172A',
    inkSecondary: '#334155',
    inkMuted: '#526077',
    inkDisabled: '#64748B',

    accent: '#1D4ED8',
    accentBright: '#2563EB',
    accentHover: '#1E40AF',
    accentSoft: '#EFF6FF',
    accentBorder: '#BFDBFE',

    // Energy carrier series
    electricity: '#2563EB',
    electricitySoft: '#EFF6FF',
    renewables: '#0D9488',
    renewablesSoft: '#F0FDFA',
    gas: '#6D28D9',
    gasSoft: '#F5F3FF',
    oil: '#B45309',
    oilSoft: '#FFFBEB',

    // Semantic operational states (WCAG AA >= 4.5:1 verified)
    successInk: '#065F46',
    successDot: '#10B981',
    successBg: '#ECFDF5',
    successBorder: '#A7F3D0',

    warnInk: '#92400E',
    warnDot: '#F59E0B',
    warnBg: '#FFFBEB',
    warnBorder: '#FDE68A',

    dangerInk: '#9F1239',
    dangerDot: '#F43F5E',
    dangerBg: '#FFF1F2',
    dangerBorder: '#FECDD3',

    infoInk: '#1E40AF',
    infoDot: '#3B82F6',
    infoBg: '#EFF6FF',
    infoBorder: '#BFDBFE',

    neutralInk: '#334155',
    neutralBg: '#F1F5F9',
    neutralBorder: '#CBD5E1',
  },
  spacing: {
    gutter: 36,
    gutterMedium: 24,
    gutterNarrow: 16,
    gap: 20,
    max: 1440,
  },
  radius: {
    xs: 8,
    sm: 12,
    md: 14,
    lg: 18,
    card: 20,
    sheet: 26,
    pill: 999,
  },
  motion: {
    duration: 180,
    ease: [0.16, 1, 0.3, 1] as const,
  },
  breakpoint: {
    wide: 1180,
    desktop: 960,
    tablet: 768,
    narrow: 540,
  },
} as const;

const c = tokens.color;

export const colors = {
  backgroundDeep: c.canvas,
  background: c.canvas,
  card: c.surface,
  cardMuted: c.surfaceMuted,
  cardSubtle: c.surfaceSubtle,
  cardAccent: c.surfaceAccent,
  cardElevated: c.surface,

  foreground: c.ink,
  readForeground: c.inkSecondary,
  mutedForeground: c.inkMuted,
  dimForeground: c.inkDisabled,

  primary: c.accent,
  primaryBright: c.accentBright,
  primaryHover: c.accentHover,
  primaryForeground: '#FFFFFF',
  primarySoft: c.accentSoft,
  primaryBorder: c.accentBorder,
  primaryA08: 'rgba(29, 78, 216, 0.08)',
  primaryA12: 'rgba(29, 78, 216, 0.12)',
  primaryA20: 'rgba(29, 78, 216, 0.20)',

  border: c.border,
  borderStrong: c.borderStrong,

  live: c.accent,
  teal: c.renewables,
  violet: c.gas,
  amber: c.oil,

  success: c.successInk,
  successDot: c.successDot,
  successBg: c.successBg,
  successBorder: c.successBorder,

  warn: c.warnInk,
  warnDot: c.warnDot,
  warnBg: c.warnBg,
  warnBorder: c.warnBorder,

  danger: c.dangerInk,
  dangerDot: c.dangerDot,
  dangerBg: c.dangerBg,
  dangerBorder: c.dangerBorder,
  dangerA10: c.dangerBg,
  dangerA25: c.dangerBorder,

  info: c.infoInk,
  infoDot: c.infoDot,
  infoBg: c.infoBg,
  infoBorder: c.infoBorder,

  white: '#FFFFFF',
  inverseInk: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.42)',
} as const;

const withFallback = (family: string, fallback: string) =>
  Platform.OS === 'web' ? `${family}, ${fallback}` : family;

const SANS_FALLBACK = '"Helvetica Neue", Arial, sans-serif';
const MONO_FALLBACK = '"SFMono-Regular", Menlo, monospace';

export const fonts = {
  sans: withFallback('Manrope_400Regular', SANS_FALLBACK),
  sansMedium: withFallback('Manrope_500Medium', SANS_FALLBACK),
  sansSemiBold: withFallback('Manrope_600SemiBold', SANS_FALLBACK),
  sansBold: withFallback('Manrope_700Bold', SANS_FALLBACK),
  mono: withFallback('JetBrainsMono_400Regular', MONO_FALLBACK),
  monoMedium: withFallback('JetBrainsMono_500Medium', MONO_FALLBACK),
} as const;

export const radius = {
  xs: tokens.radius.xs,
  sm: tokens.radius.sm,
  md: tokens.radius.md,
  lg: tokens.radius.lg,
  xl: tokens.radius.card,
  panel: tokens.radius.card,
  sheet: tokens.radius.sheet,
  full: tokens.radius.pill,
} as const;

export const shadow: Record<'card' | 'floating' | 'subtle', ViewStyle> = {
  card: Platform.select({
    web: {
      boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
    } as unknown as ViewStyle,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 3,
    },
  })!,
  floating: Platform.select({
    web: {
      boxShadow: '0 20px 44px -10px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
    } as unknown as ViewStyle,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.14,
      shadowRadius: 28,
      elevation: 8,
    },
  })!,
  subtle: Platform.select({
    web: {
      boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
    } as unknown as ViewStyle,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
  })!,
};

export function displayType(containerWidth: number): TextStyle {
  const fontSize = Math.round(Math.min(52, Math.max(30, containerWidth * 0.042)));
  return {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize,
    lineHeight: Math.round(fontSize * 1.12),
    letterSpacing: -fontSize * 0.03,
  };
}

export const typography = {
  h1: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  h2: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  h3: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.sans,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 23,
  },
  bodySm: {
    fontFamily: fonts.sans,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
  },
  mono: {
    fontFamily: fonts.mono,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
    ...(Platform.OS === 'web' ? ({ fontVariantNumeric: 'tabular-nums' } as TextStyle) : {}),
  },
  monoStrong: {
    fontFamily: fonts.monoMedium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    ...(Platform.OS === 'web' ? ({ fontVariantNumeric: 'tabular-nums' } as TextStyle) : {}),
  },
} as const satisfies Record<string, TextStyle>;

export function focusRing(focused: boolean | undefined) {
  if (Platform.OS !== 'web' || !focused) return null;
  return {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: c.accent,
    outlineOffset: 2,
  } as unknown as Record<string, never>;
}
