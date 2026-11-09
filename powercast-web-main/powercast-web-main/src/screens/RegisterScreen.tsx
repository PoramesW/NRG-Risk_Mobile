import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react-native';

import { AuthInput } from '@/components/AuthInput';
import { AuthButton } from '@/components/AuthButton';
import {
  AuthBackground,
  AuthBrandHeader,
  AuthColumns,
  AuthDivider,
  AuthLink,
} from '@/components/AuthShared';
import {
  AuthDesign,
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  PASSWORD_MIN_LENGTH,
} from '@/utils/authDesign';
import { colors, fonts, shadow } from '@/utils/theme';
import { registerUser } from '@/services/auth';
import type { User as UserProfile } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: (user: UserProfile) => void;
}

export function RegisterScreen({ onNavigateToLogin, onRegisterSuccess }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const nameValidation = validateName(name);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

  const isFormValid =
    nameValidation.isValid &&
    emailValidation.isValid &&
    passwordValidation.isValid &&
    confirmPasswordValidation.isValid;

  const handleBlur = useCallback((field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = useCallback(async () => {
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setGeneralError('');

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const registeredUser = await registerUser(name.trim(), email.trim(), password);
      onRegisterSuccess?.(registeredUser);
    } catch (error: any) {
      const message = error?.message || 'Registration failed. Please try again.';
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, password, isFormValid, onRegisterSuccess]);

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.topSpacer} />

          <AuthColumns
            intro={<AuthBrandHeader tagline="Provision your grid forecasting workspace" />}
          >
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle} accessibilityRole="header">
                  Create account
                </Text>
                <Text style={styles.formSubtitle}>
                  Set up operator access for PowerCast analytics
                </Text>
              </View>

              {generalError !== '' && (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorBannerText}>{generalError}</Text>
                </View>
              )}

              <AuthInput
                label="Full name"
                icon={<User size={18} color={AuthDesign.colors.textMuted} strokeWidth={1.8} />}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setGeneralError('');
                }}
                onBlur={() => handleBlur('name')}
                touched={touched.name}
                validation={nameValidation}
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                textContentType="name"
                autoCapitalize="words"
                accessibilityLabel="Full name"
              />

              <AuthInput
                label="Email address"
                icon={<Mail size={18} color={AuthDesign.colors.textMuted} strokeWidth={1.8} />}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setGeneralError('');
                }}
                onBlur={() => handleBlur('email')}
                touched={touched.email}
                validation={emailValidation}
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                textContentType="emailAddress"
                autoCapitalize="none"
                accessibilityLabel="Email address"
                ref={emailRef as any}
              />

              <AuthInput
                label="Password"
                icon={<Lock size={18} color={AuthDesign.colors.textMuted} strokeWidth={1.8} />}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setGeneralError('');
                }}
                onBlur={() => handleBlur('password')}
                touched={touched.password}
                validation={passwordValidation}
                isPassword
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                textContentType="newPassword"
                accessibilityLabel="Password"
                ref={passwordRef as any}
              />

              {password.length > 0 && (
                <View
                  style={styles.strengthContainer}
                  accessible
                  accessibilityLabel={`Password strength: ${passwordStrength.label}`}
                >
                  <View style={styles.strengthBars}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              i < passwordStrength.level
                                ? passwordStrength.color
                                : AuthDesign.colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.strengthLabel}>{passwordStrength.label}</Text>
                </View>
              )}

              <AuthInput
                label="Confirm password"
                icon={
                  <ShieldCheck size={18} color={AuthDesign.colors.textMuted} strokeWidth={1.8} />
                }
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setGeneralError('');
                }}
                onBlur={() => handleBlur('confirmPassword')}
                touched={touched.confirmPassword}
                validation={confirmPasswordValidation}
                isPassword
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                textContentType="newPassword"
                accessibilityLabel="Confirm password"
                ref={confirmPasswordRef as any}
              />

              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>

              <AuthButton
                title="Create Account"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                disabled={!isFormValid}
                icon={
                  !isSubmitting ? (
                    <ArrowRight
                      size={16}
                      color={
                        isFormValid ? AuthDesign.colors.accentForeground : colors.mutedForeground
                      }
                      strokeWidth={2}
                    />
                  ) : undefined
                }
                style={styles.submitButton}
              />

              <AuthDivider text="or" />

              <View style={styles.inlineFooter}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <AuthLink
                  title="Sign in"
                  onPress={onNavigateToLogin}
                  hitSlop={8}
                  accessibilityLabel="Sign in instead"
                />
              </View>
            </View>
          </AuthColumns>

          <View style={{ height: 36 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

function getPasswordStrength(password: string): {
  level: number;
  label: string;
  color: string;
} {
  if (!password) return { level: 0, label: '', color: 'transparent' };

  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: { label: string; color: string }[] = [
    { label: 'Too weak', color: colors.dangerDot },
    { label: 'Weak', color: colors.warnDot },
    { label: 'Fair', color: colors.warnDot },
    { label: 'Good', color: colors.primaryBright },
    { label: 'Strong', color: colors.successDot },
  ];

  const entry = levels[Math.min(score, levels.length - 1)];
  return { level: score, ...entry };
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topSpacer: {
    height: Math.max(SCREEN_HEIGHT * 0.03, 20),
  },
  formCard: {
    backgroundColor: AuthDesign.colors.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AuthDesign.colors.border,
    padding: 28,
    ...shadow.card,
  },
  formHeader: {
    marginBottom: 22,
  },
  formTitle: {
    ...AuthDesign.typography.title,
    color: AuthDesign.colors.textPrimary,
    marginBottom: 6,
  },
  formSubtitle: {
    ...AuthDesign.typography.subtitle,
    color: AuthDesign.colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: AuthDesign.colors.errorGlow,
    borderWidth: 1,
    borderColor: AuthDesign.colors.errorBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: AuthDesign.colors.error,
    fontWeight: '500',
    lineHeight: 18,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 14,
    paddingHorizontal: 2,
    gap: 12,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  strengthLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: AuthDesign.colors.textSecondary,
    minWidth: 64,
    textAlign: 'right',
  },
  termsText: {
    fontFamily: AuthDesign.fonts.sans,
    fontSize: 12.5,
    color: AuthDesign.colors.textMuted,
    lineHeight: 18,
    marginBottom: 18,
  },
  termsLink: {
    fontFamily: fonts.sansMedium,
    color: colors.primary,
  },
  submitButton: {
    marginTop: 2,
  },
  inlineFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: AuthDesign.fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: AuthDesign.colors.textSecondary,
  },
});
