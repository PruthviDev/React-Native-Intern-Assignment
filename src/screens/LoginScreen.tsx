/**
 * Login Screen – validates credentials against AsyncStorage users
 * and restores session for persistence across restarts.
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { usePopup } from '../context/PopupContext';
import { Button, Header, Input } from '../components';
import { AuthStackParamList } from '../navigation/types';
import {
  hasErrors,
  LoginFormValues,
  validateLogin,
} from '../utils/validation';
import { FormErrors, LoginField } from '../types';
import { spacing, typography } from '../theme';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, login } = useApp();
  const { showPopup } = usePopup();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors<LoginField>>({});
  const [loading, setLoading] = useState(false);

  const update = (key: LoginField, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const onSubmit = async () => {
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }

    setLoading(true);
    const result = await login(values);
    setLoading(false);

    if (!result.ok) {
      showPopup({
        title: 'Login Failed',
        message: result.message ?? 'Invalid credentials',
      });
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Welcome Back" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.brand, { color: colors.primary }]}>
            Image Gallery
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in with your registered email and password.
          </Text>

          <Input
            label="Email *"
            value={values.email}
            onChangeText={t => update('email', t)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password *"
            value={values.password}
            onChangeText={t => update('password', t)}
            error={errors.password}
            secureTextEntry
          />

          <Button title="Login" onPress={onSubmit} loading={loading} />

          <TouchableOpacity
            onPress={() => navigation.navigate('Registration')}
            style={styles.linkWrap}>
            <Text style={{ color: colors.textSecondary }}>
              New here?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                Create an account
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
  },
  brand: {
    ...typography.h1,
    marginBottom: spacing.xs + 2,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xxl,
  },
  linkWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});

export default LoginScreen;
