/**
 * Design tokens and validation utilities for PowerCast Auth screens.
 * Aligned with the global "Modern Soft Minimal — Rounded Enterprise UI" theme.
 */
import { colors, fonts, radius, shadow, tokens, typography } from './theme';

export const AuthDesign = {
  colors: {
    bgDeep: colors.backgroundDeep,
    bgBase: colors.background,
    bgElevated: colors.cardElevated,
    bgCard: colors.card,
    bgInput: colors.cardSubtle,
    bgInputFocus: colors.card,

    textPrimary: colors.foreground,
    textSecondary: colors.readForeground,
    textMuted: colors.mutedForeground,
    textHint: colors.mutedForeground,
    textDisabled: colors.dimForeground,

    accent: colors.primary,
    accentLight: colors.primaryBright,
    accentHover: colors.primaryHover,
    accentForeground: colors.primaryForeground,
    accentGlow: colors.primarySoft,
    accentGlowStrong: colors.primaryBorder,
    accentDisabled: colors.cardMuted,

    border: colors.border,
    borderStrong: colors.borderStrong,
    borderFocus: colors.primary,
    borderHover: colors.borderStrong,

    error: colors.danger,
    errorGlow: colors.dangerBg,
    errorBorder: colors.dangerBorder,
    success: colors.success,
    successGlow: colors.successBg,
    live: colors.primary,
    warn: colors.warn,

    white: colors.white,
    overlay: colors.overlay,
  },

  fonts,
  motion: tokens.motion,

  layout: {
    ...tokens.spacing,
    breakpoint: {
      wide: tokens.breakpoint.wide,
      medium: tokens.breakpoint.desktop,
      narrow: tokens.breakpoint.narrow,
    },
  },

  radius: {
    sm: radius.sm,
    md: radius.md,
    lg: radius.lg,
    xl: radius.xl,
    panel: radius.panel,
    input: radius.md,
    full: radius.full,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },

  typography: {
    hero: typography.h1,
    title: { ...typography.h1, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
    subtitle: { ...typography.body, fontSize: 15, lineHeight: 22 },
    body: { ...typography.body, fontSize: 15, lineHeight: 22 },
    label: typography.label,
    caption: typography.caption,
  },

  shadow: {
    card: shadow.card,
    button: shadow.subtle,
    subtle: shadow.subtle,
  },
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export type ValidationResult = {
  isValid: boolean;
  message: string;
};

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) return { isValid: false, message: '' };
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: 'Enter a valid email address' };
  }
  return { isValid: true, message: '' };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { isValid: false, message: '' };
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `At least ${PASSWORD_MIN_LENGTH} characters required`,
    };
  }
  return { isValid: true, message: '' };
}

export function validateName(name: string): ValidationResult {
  if (!name.trim()) return { isValid: false, message: '' };
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }
  return { isValid: true, message: '' };
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) return { isValid: false, message: '' };
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  return { isValid: true, message: '' };
}
