/**
 * Registration Screen – creates a new local user with full validation,
 * keyboard avoidance, and safe-area bottom spacing.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
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

type FieldKey =
  | 'fullName'
  | 'email'
  | 'mobile'
  | 'address'
  | 'password'
  | 'confirmPassword';

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

/** Keep focused field fully above the keyboard (not half-covered) */
const KEYBOARD_FIELD_GAP = 28;

const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, register } = useApp();
  const { showPopup } = usePopup();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const fieldRefs = useRef<Partial<Record<FieldKey, View | null>>>({});
  const focusedField = useRef<FieldKey | null>(null);
  const scrollY = useRef(0);
  const keyboardHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [values, setValues] = useState<RegistrationFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<RegistrationField>>({});
  const [loading, setLoading] = useState(false);

  const ensureFieldAboveKeyboard = useCallback((key: FieldKey) => {
    const node = fieldRefs.current[key];
    if (!node) {
      return;
    }

    node.measureInWindow((_x, y, _w, height) => {
      const windowHeight = Dimensions.get('window').height;
      const kb = keyboardHeightRef.current;
      // Visible bottom edge of the form (top of keyboard, or screen bottom)
      const visibleBottom =
        kb > 0 ? windowHeight - kb : windowHeight - insets.bottom;
      const fieldBottom = y + height;
      const overflow = fieldBottom - (visibleBottom - KEYBOARD_FIELD_GAP);

      if (overflow > 0) {
        scrollRef.current?.scrollTo({
          y: Math.max(0, scrollY.current + overflow),
          animated: true,
        });
      }
    });
  }, [insets.bottom]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, e => {
      const height = e.endCoordinates.height;
      keyboardHeightRef.current = height;
      setKeyboardHeight(height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
      focusedField.current = null;
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  // Re-measure after keyboard finishes opening / bottom padding grows
  useEffect(() => {
    if (keyboardHeight <= 0 || !focusedField.current) {
      return;
    }
    const key = focusedField.current;
    const t = setTimeout(() => ensureFieldAboveKeyboard(key), 80);
    return () => clearTimeout(t);
  }, [keyboardHeight, ensureFieldAboveKeyboard]);

  const scrollFieldIntoView = (key: FieldKey) => {
    focusedField.current = key;
    // First pass quickly, second pass after keyboard/layout settles
    setTimeout(() => ensureFieldAboveKeyboard(key), Platform.OS === 'ios' ? 50 : 100);
    setTimeout(() => ensureFieldAboveKeyboard(key), Platform.OS === 'ios' ? 280 : 350);
  };

  const setFieldRef = (key: FieldKey) => (ref: View | null) => {
    fieldRefs.current[key] = ref;
  };

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
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  // Enough scroll room so Confirm Password can move fully above the keyboard
  const bottomPad =
    Math.max(insets.bottom, spacing.lg) +
    spacing.xxl +
    (keyboardHeight > 0 ? keyboardHeight + 48 : 64);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Create Account" onBack={goToLogin} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          onScroll={e => {
            scrollY.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Fill in all fields to register for Img Gallery.
          </Text>

          <View ref={setFieldRef('fullName')}>
            <Input
              label="Full Name *"
              value={values.fullName}
              onChangeText={t => update('fullName', t)}
              error={errors.fullName}
              autoCapitalize="words"
              onFocus={() => scrollFieldIntoView('fullName')}
            />
          </View>
          <View ref={setFieldRef('email')}>
            <Input
              label="Email *"
              value={values.email}
              onChangeText={t => update('email', t)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => scrollFieldIntoView('email')}
            />
          </View>
          <RadioGroup
            label="Gender *"
            options={GENDERS.map(g => ({ label: g, value: g }))}
            value={values.gender}
            onChange={v => update('gender', v as Gender)}
            error={errors.gender}
          />
          <View ref={setFieldRef('mobile')}>
            <Input
              label="Mobile (10 digits) *"
              value={values.mobile}
              onChangeText={t =>
                update('mobile', t.replace(/[^0-9]/g, '').slice(0, 10))
              }
              error={errors.mobile}
              keyboardType="number-pad"
              maxLength={10}
              onFocus={() => scrollFieldIntoView('mobile')}
            />
          </View>
          <View ref={setFieldRef('address')}>
            <Input
              label="Address *"
              value={values.address}
              onChangeText={t => update('address', t)}
              error={errors.address}
              multiline
              onFocus={() => scrollFieldIntoView('address')}
            />
          </View>
          <Dropdown
            label="City *"
            options={CITIES}
            value={values.city}
            onChange={v => update('city', v)}
            error={errors.city}
            placeholder="Select city"
          />
          <View ref={setFieldRef('password')}>
            <Input
              label="Password *"
              value={values.password}
              onChangeText={t => update('password', t)}
              error={errors.password}
              secureTextEntry
              onFocus={() => scrollFieldIntoView('password')}
            />
          </View>
          <View ref={setFieldRef('confirmPassword')}>
            <Input
              label="Confirm Password *"
              value={values.confirmPassword}
              onChangeText={t => update('confirmPassword', t)}
              error={errors.confirmPassword}
              secureTextEntry
              onFocus={() => scrollFieldIntoView('confirmPassword')}
            />
          </View>

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
