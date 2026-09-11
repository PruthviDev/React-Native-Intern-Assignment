/**
 * Edit Profile Screen – update user details with the same validations
 * as registration (password optional).
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { usePopup } from '../context/PopupContext';
import {
  AvatarPicker,
  Button,
  Dropdown,
  Header,
  Input,
  RadioGroup,
} from '../components';
import { RootStackParamList } from '../navigation/types';
import { CITIES, GENDERS } from '../utils/constants';
import {
  hasErrors,
  ProfileFormValues,
  validateProfile,
} from '../utils/validation';
import { FormErrors, Gender, RegistrationField } from '../types';
import { spacing } from '../theme';

const EditProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, user, updateProfile } = useApp();
  const { showPopup } = usePopup();
  const insets = useSafeAreaInsets();

  const [values, setValues] = useState<ProfileFormValues>({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    gender: user?.gender ?? '',
    mobile: user?.mobile ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    password: '',
    confirmPassword: '',
  });
  const [avatar, setAvatarLocal] = useState(user?.avatar ?? '👤');
  const [errors, setErrors] = useState<FormErrors<RegistrationField>>({});
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const update = <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K],
  ) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key as RegistrationField]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const onSave = async () => {
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }

    setLoading(true);
    const result = await updateProfile({ ...values, avatar });
    setLoading(false);

    if (!result.ok) {
      showPopup({
        title: 'Update Failed',
        message: result.message ?? 'Please try again',
      });
      return;
    }

    showPopup({
      title: 'Success',
      message: 'Profile updated successfully',
      actions: [
        {
          label: 'OK',
          variant: 'primary',
          onPress: goBack,
        },
      ],
    });
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Edit Profile" onBack={goBack} />
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
          <AvatarPicker value={avatar} onChange={setAvatarLocal} />

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
          />
          <RadioGroup
            label="Gender *"
            options={GENDERS.map(g => ({ label: g, value: g }))}
            value={values.gender}
            onChange={v => update('gender', v as Gender)}
            error={errors.gender}
          />
          <Input
            label="Mobile *"
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
          />
          <Input
            label="New Password (optional)"
            value={values.password ?? ''}
            onChangeText={t => update('password', t)}
            error={errors.password}
            secureTextEntry
          />
          <Input
            label="Confirm New Password"
            value={values.confirmPassword ?? ''}
            onChangeText={t => update('confirmPassword', t)}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button title="Save Changes" onPress={onSave} loading={loading} />
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
});

export default EditProfileScreen;
