import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
  type PressableProps,
  type TextStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Zap, Activity, ShieldCheck, Cpu } from 'lucide-react-native';
import { AuthDesign } from '@/utils/authDesign';
import { colors, displayType, focusRing, fonts, radius, shadow } from '@/utils/theme';

const { breakpoint } = AuthDesign.layout;

type InteractionState = { pressed: boolean; hovered?: boolean; focused?: boolean };

export function getGutter(width: number) {
  if (width < breakpoint.narrow) return AuthDesign.layout.gutterNarrow;
  if (width < breakpoint.wide) return AuthDesign.layout.gutterMedium;
  return AuthDesign.layout.gutter;
}

export function useControlTransition() {
  const reduceMotion = useReducedMotion();
  if (Platform.OS !== 'web' || reduceMotion) return null;
  return {
    transitionProperty: 'background-color, border-color, color, box-shadow, transform',
    transitionDuration: `${AuthDesign.motion.duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  } as unknown as Record<string, never>;
}

/**
 * Daylight porcelain canvas with soft ambient cobalt & teal light pools.
 */
export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="softCobalt" cx="82%" cy="16%" rx="52%" ry="48%">
              <Stop offset="0" stopColor="#2563EB" stopOpacity="0.09" />
              <Stop offset="0.55" stopColor="#2563EB" stopOpacity="0.03" />
              <Stop offset="1" stopColor="#2563EB" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="softTeal" cx="14%" cy="88%" rx="46%" ry="42%">
              <Stop offset="0" stopColor="#0D9488" stopOpacity="0.07" />
              <Stop offset="1" stopColor="#0D9488" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#softCobalt)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#softTeal)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

export function AuthColumns({
  intro,
  children,
}: {
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.wide;
  const isNarrow = width < breakpoint.narrow;

  return (
    <View
      style={[
        styles.columns,
        { paddingHorizontal: getGutter(width) },
        isWide ? styles.columnsWide : styles.columnsStacked,
      ]}
    >
      <View style={isWide ? styles.introWide : styles.introStacked}>{intro}</View>
      <View
        style={[
          styles.formColumn,
          isWide && styles.formColumnWide,
          isNarrow && styles.formColumnNarrow,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function AuthBrandHeader({ tagline }: { tagline?: string }) {
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.wide;

  return (
    <View style={[styles.brandContainer, isWide && styles.brandContainerWide]}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Zap size={16} color={colors.primaryForeground} strokeWidth={2.1} />
        </View>
        <View>
          <Text style={styles.brandName}>PowerCast</Text>
          <Text style={styles.brandSub}>GRU Energy Forecasting Console</Text>
        </View>
      </View>

      {tagline && (
        <Text style={[styles.brandTagline, displayType(width)]} accessibilityRole="header">
          {tagline}
        </Text>
      )}

      <Text style={styles.brandDescription}>
        Unified demand telemetry, neural forecast evaluation, dataset quality governance, and live
        grid health across desktop and mobile operations.
      </Text>

      <View style={styles.capabilityRow}>
        <View style={styles.capabilityPill}>
          <Cpu size={14} color={colors.primary} strokeWidth={1.9} />
          <Text style={styles.capabilityText}>GRU v2.4.1 Live</Text>
        </View>
        <View style={styles.capabilityPill}>
          <Activity size={14} color={colors.teal} strokeWidth={1.9} />
          <Text style={styles.capabilityText}>Multi-Carrier Telemetry</Text>
        </View>
        <View style={styles.capabilityPill}>
          <ShieldCheck size={14} color={colors.violet} strokeWidth={1.9} />
          <Text style={styles.capabilityText}>Role-Gated Audit</Text>
        </View>
      </View>
    </View>
  );
}

export function AuthDivider({ text }: { text: string }) {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function AuthLink({
  title,
  textStyle,
  style,
  ...pressableProps
}: Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  textStyle?: TextStyle;
  style?: PressableProps['style'];
}) {
  const transition = useControlTransition();

  return (
    <Pressable
      accessibilityRole="link"
      {...pressableProps}
      style={(state) => [
        styles.link,
        focusRing((state as InteractionState).focused),
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {(state) => {
        const { hovered, focused, pressed } = state as InteractionState;
        const active = hovered || focused || pressed;
        return (
          <Text
            style={[
              styles.linkText,
              transition,
              {
                color: active ? colors.primaryHover : colors.primary,
                textDecorationColor: active ? colors.primaryHover : colors.primaryBorder,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthDesign.colors.bgDeep,
  },
  columns: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    flexGrow: 1,
  },
  columnsWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 56,
    paddingVertical: 48,
  },
  columnsStacked: {
    flexDirection: 'column',
  },
  introWide: {
    flex: 6,
  },
  introStacked: {
    width: '100%',
  },
  formColumn: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  formColumnWide: {
    flex: 5,
    maxWidth: 460,
  },
  formColumnNarrow: {
    maxWidth: undefined,
  },
  brandContainer: {
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  brandContainerWide: {
    marginBottom: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.subtle,
  },
  brandName: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.mutedForeground,
  },
  brandTagline: {
    color: colors.foreground,
    marginTop: 28,
  },
  brandDescription: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    color: colors.readForeground,
    marginTop: 14,
    maxWidth: 500,
  },
  capabilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 22,
  },
  capabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  capabilityText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.readForeground,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AuthDesign.colors.border,
  },
  dividerText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthDesign.colors.textMuted,
  },
  link: {
    borderRadius: 6,
    paddingVertical: 2,
  },
  linkText: {
    fontFamily: AuthDesign.fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
