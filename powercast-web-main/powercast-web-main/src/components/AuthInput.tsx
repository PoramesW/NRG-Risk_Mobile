import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react-native';
import { AuthDesign, type ValidationResult } from '@/utils/authDesign';
import { colors, focusRing } from '@/utils/theme';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

const [e1, e2, e3, e4] = AuthDesign.motion.ease;
const EASE_OUT = Easing.bezier(e1, e2, e3, e4);

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  validation?: ValidationResult;
  touched?: boolean;
  containerStyle?: ViewStyle;
}

export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInputInner(
  {
    label,
    icon,
    isPassword = false,
    validation,
    touched = false,
    containerStyle,
    value,
    onFocus,
    onBlur,
    ...textInputProps
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const reduceMotion = useReducedMotion();

  useImperativeHandle(ref, () => inputRef.current as TextInput);

  const focusProgress = useSharedValue(0);
  const labelPosition = useSharedValue(value ? 1 : 0);

  const hasValue = !!value && value.length > 0;
  const showError = touched && validation && !validation.isValid && validation.message;
  const showSuccess = touched && validation?.isValid && hasValue;

  const timing = { duration: reduceMotion ? 0 : AuthDesign.motion.duration, easing: EASE_OUT };

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, timing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, focusProgress, reduceMotion]);

  useEffect(() => {
    labelPosition.value = withTiming(isFocused || hasValue ? 1 : 0, timing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, hasValue, labelPosition, reduceMotion]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = showError
      ? AuthDesign.colors.error
      : interpolateColor(
          focusProgress.value,
          [0, 1],
          [AuthDesign.colors.border, AuthDesign.colors.borderFocus],
        );
    const backgroundColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [AuthDesign.colors.bgInput, AuthDesign.colors.bgInputFocus],
    );

    return { borderColor, backgroundColor };
  });

  const floatingLabelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(labelPosition.value, [0, 1], [0, -10]) },
        { scale: interpolate(labelPosition.value, [0, 1], [1, 0.82]) },
      ],
    };
  });

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
        <AnimatedView style={[styles.container, containerAnimatedStyle]}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          <View style={styles.inputArea}>
            <AnimatedText
              style={[
                styles.floatingLabel,
                (isFocused || hasValue) && styles.floatingLabelActive,
                floatingLabelStyle,
                showError && styles.errorLabel,
              ]}
              numberOfLines={1}
            >
              {label}
            </AnimatedText>

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                (isFocused || hasValue) && styles.inputActive,
                icon ? { paddingLeft: 0 } : undefined,
              ]}
              value={value}
              secureTextEntry={isPassword && !showPassword}
              placeholderTextColor="transparent"
              onFocus={handleFocus}
              onBlur={handleBlur}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              autoCapitalize="none"
              {...textInputProps}
            />
          </View>

          <View style={styles.trailingContainer}>
            {showSuccess && (
              <View style={styles.successIcon} accessible accessibilityLabel={`${label} is valid`}>
                <Check size={16} color={colors.successDot} strokeWidth={2.3} />
              </View>
            )}

            {isPassword && (
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={(state) => [
                  styles.eyeButton,
                  focusRing((state as { focused?: boolean }).focused),
                ]}
                hitSlop={12}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
              >
                {showPassword ? (
                  <EyeOff size={18} color={AuthDesign.colors.textSecondary} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} color={AuthDesign.colors.textSecondary} strokeWidth={1.8} />
                )}
              </Pressable>
            )}
          </View>
        </AnimatedView>
      </Pressable>

      {showError && (
        <View style={styles.errorRow}>
          <AlertCircle size={13} color={AuthDesign.colors.error} strokeWidth={2} />
          <Text style={styles.errorText}>{validation.message}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: AuthDesign.radius.input,
    backgroundColor: AuthDesign.colors.bgInput,
    minHeight: 56,
    paddingHorizontal: 16,
    position: 'relative',
  },
  iconContainer: {
    marginRight: 12,
  },
  inputArea: {
    flex: 1,
    justifyContent: 'center',
    height: 56,
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 18 : 17,
    fontFamily: AuthDesign.fonts.sans,
    fontSize: 15,
    color: AuthDesign.colors.textMuted,
    fontWeight: '400',
    transformOrigin: 'left center',
  },
  floatingLabelActive: {
    color: AuthDesign.colors.textSecondary,
    fontFamily: AuthDesign.fonts.sansMedium,
  },
  errorLabel: {
    color: AuthDesign.colors.error,
  },
  input: {
    flex: 1,
    fontFamily: AuthDesign.fonts.sansMedium,
    fontSize: 15,
    fontWeight: '500',
    color: AuthDesign.colors.textPrimary,
    paddingTop: 14,
    paddingBottom: 4,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  inputActive: {
    paddingTop: 20,
    paddingBottom: 2,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 4,
    gap: 6,
  },
  errorText: {
    fontFamily: AuthDesign.fonts.sansMedium,
    fontSize: 12.5,
    lineHeight: 17,
    color: AuthDesign.colors.error,
    fontWeight: '500',
  },
});
