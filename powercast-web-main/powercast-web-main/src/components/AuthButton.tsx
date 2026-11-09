import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { AuthDesign } from '@/utils/authDesign';
import { colors, focusRing, shadow } from '@/utils/theme';
import { useControlTransition } from './AuthShared';

type InteractionState = { pressed: boolean; hovered?: boolean; focused?: boolean };

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function AuthButton({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  textStyle,
}: AuthButtonProps) {
  const isDisabled = disabled || isLoading;
  const transition = useControlTransition();

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={(state) => {
        const { hovered, focused, pressed } = state as InteractionState;
        const active = !isDisabled && (hovered || pressed);
        return [
          styles.base,
          variant === 'primary' && !isDisabled ? shadow.subtle : null,
          transition,
          getVariantStyles(variant, isDisabled, !!active).container,
          focusRing(focused),
          style,
        ];
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      accessibilityLabel={isLoading ? `${title}, loading` : title}
    >
      {(state) => {
        const { hovered, pressed } = state as InteractionState;
        const active = !isDisabled && (hovered || pressed);
        const variantStyles = getVariantStyles(variant, isDisabled, !!active);

        return isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.primary : colors.foreground}
          />
        ) : (
          <>
            <Text style={[styles.text, transition, variantStyles.text, textStyle]}>{title}</Text>
            {icon}
          </>
        );
      }}
    </Pressable>
  );
}

function getVariantStyles(variant: string, disabled: boolean, active: boolean) {
  const base = {
    container: {} as ViewStyle,
    text: {} as TextStyle,
  };

  switch (variant) {
    case 'primary':
      base.container = {
        backgroundColor: disabled
          ? colors.cardMuted
          : active
            ? AuthDesign.colors.accentHover
            : AuthDesign.colors.accent,
        borderColor: disabled ? colors.border : 'transparent',
      };
      base.text = {
        color: disabled ? colors.mutedForeground : AuthDesign.colors.accentForeground,
      };
      break;

    case 'secondary':
      base.container = {
        backgroundColor: active ? colors.cardMuted : colors.cardSubtle,
        borderColor: active ? colors.borderStrong : colors.border,
      };
      base.text = {
        color: disabled ? colors.mutedForeground : colors.foreground,
      };
      break;

    case 'ghost':
      base.container = {
        backgroundColor: active ? colors.cardMuted : 'transparent',
        borderColor: 'transparent',
      };
      base.text = {
        color: colors.foreground,
      };
      break;
  }

  return base;
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: AuthDesign.radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  text: {
    fontFamily: AuthDesign.fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});
