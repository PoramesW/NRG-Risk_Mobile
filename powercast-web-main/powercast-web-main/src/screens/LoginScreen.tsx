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
  Alert,
} from 'react-native';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

import { AuthInput } from '@/components/AuthInput';
import { AuthButton } from '@/components/AuthButton';
import {
  AuthBackground,
  AuthBrandHeader,
  AuthColumns,
  AuthDivider,
  AuthLink,
} from '@/components/AuthShared';
import { AuthDesign, validateEmail, validatePassword } from '@/utils/authDesign';
import { colors, fonts, shadow } from '@/utils/theme';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: (user: User) => void;
}

export function LoginScreen({
  onNavigateToRegister,
  onForgotPassword,
  onLoginSuccess,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const passwordRef = useRef<TextInput>(null);
  const { login } = useAuth();

  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const isFormValid = emailValidation.isValid && passwordValidation.isValid;

  const handleBlur = useCallback((field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setTouched({ email: true, password: true });
    setGeneralError('');

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      onLoginSuccess?.(loggedUser);
    } catch (error: any) {
      const message = error?.message || 'Something went wrong. Please try again.';
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, isFormValid, login, onLoginSuccess]);

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
            intro={<AuthBrandHeader tagline="Energy intelligence built for calm grid operations" />}
          >
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle} accessibilityRole="header">
                  Welcome back
                </Text>
                <Text style={styles.formSubtitle}>
                  Sign in to access forecasting analytics and system operations
                </Text>
              </View>

              {generalError !== '' && (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorBannerText}>{generalError}</Text>
                </View>
              )}

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
                accessibilityLabel="Email address"
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
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                textContentType="password"
                accessibilityLabel="Password"
                ref={passwordRef as any}
              />

              <AuthLink
                title="Forgot password?"
                onPress={
                  onForgotPassword ??
                  (() =>
                    Alert.alert(
                      'Password recovery',
                      'Contact a PowerCast Admin or check your organization email to reset your password.',
                    ))
                }
                style={styles.forgotLink}
                textStyle={styles.forgotLinkText}
                hitSlop={8}
                accessibilityLabel="Forgot password"
              />

              <AuthButton
                title="Sign In"
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

              <AuthButton
                title="Continue with Enterprise SSO"
                onPress={() => Alert.alert('SSO', 'Enterprise SSO integration placeholder')}
                variant="secondary"
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Need workspace credentials?</Text>
              <AuthLink
                title="Create account"
                onPress={onNavigateToRegister}
                hitSlop={8}
                accessibilityLabel="Create account"
              />
            </View>
          </AuthColumns>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
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
    height: Math.max(SCREEN_HEIGHT * 0.04, 24),
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
    marginBottom: 24,
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -2,
  },
  forgotLinkText: {
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    fontFamily: AuthDesign.fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: AuthDesign.colors.textSecondary,
  },
});
