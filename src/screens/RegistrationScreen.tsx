/**
 * Registration Screen – creates a new local user with full validation,
 * keyboard avoidance, and safe-area bottom spacing.
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
import { Button, Dropdown, Header, Input, RadioGroup } from '../components';
import { AuthStackParamList } from '../navigation/types';
import { CITIES, GENDERS } from '../utils/constants';
import {
  hasErrors,
  RegistrationFormValues,
  validateRegistration,
} from '../utils/validation';
import { FormErrors, Gender, RegistrationField } from '../types';
import { spacing, typography } from '../theme';

type Props = StackScreenProps<AuthStackParamList, 'Registration'>;

const initialValues: RegistrationFormValues = {
  fullName: '',
  email: '',
  gender: '',
  mobile: '',
  address: '',
  city: '',
  password: '',
  confirmPassword: '',
};

const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, register } = useApp();
  const { showPopup } = usePopup();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<RegistrationFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<RegistrationField>>({});
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof RegistrationFormValues>(
    key: K,
    value: RegistrationFormValues[K],
  ) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key as RegistrationField]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const onSubmit = async () => {
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }

    setLoading(true);
    const result = await register(values);
    setLoading(false);

    if (!result.ok) {
      showPopup({
        title: 'Registration Failed',
        message: result.message ?? 'Please try again',
      });
    }
  };

  const goToLogin = () => {
    // Prefer popping back to existing Login rather than stacking another copy
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Create Account" onBack={goToLogin} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            // Keep "Already have an account?" above Android nav / home indicator
            { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Fill in all fields to register for Image Gallery.
          </Text>

          <Input
            label="Full Name *"
            value={values.fullName}
            onChangeText={t => update('fullName', t)}
            error={errors.fullName}
            autoCapitalize="words"
          />
          <Input
            label="Email *"
            value={values.email}
            onChangeText={t => update('email', t)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <RadioGroup
            label="Gender *"
            options={GENDERS.map(g => ({ label: g, value: g }))}
            value={values.gender}
            onChange={v => update('gender', v as Gender)}
            error={errors.gender}
          />
          <Input
            label="Mobile (10 digits) *"
            value={values.mobile}
            onChangeText={t =>
              update('mobile', t.replace(/[^0-9]/g, '').slice(0, 10))
            }
            error={errors.mobile}
            keyboardType="number-pad"
            maxLength={10}
          />
          <Input
            label="Address *"
            value={values.address}
            onChangeText={t => update('address', t)}
            error={errors.address}
            multiline
          />
          <Dropdown
            label="City *"
            options={CITIES}
            value={values.city}
            onChange={v => update('city', v)}
            error={errors.city}
            placeholder="Select city"
          />
          <Input
            label="Password *"
            value={values.password}
            onChangeText={t => update('password', t)}
            error={errors.password}
            secureTextEntry
          />
          <Input
            label="Confirm Password *"
            value={values.confirmPassword}
            onChangeText={t => update('confirmPassword', t)}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button title="Register" onPress={onSubmit} loading={loading} />

          <TouchableOpacity onPress={goToLogin} style={styles.linkWrap}>
            <Text style={{ color: colors.textSecondary }}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                Log in
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
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  linkWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});

export default RegistrationScreen;
