/**
 * Form validation helpers for Registration, Login, and Edit Profile.
 * Returns field-level error maps; empty object means the form is valid.
 */

import { FormErrors, Gender, LoginField, RegistrationField } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

export interface RegistrationFormValues {
  fullName: string;
  email: string;
  gender: Gender | '';
  mobile: string;
  address: string;
  city: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface ProfileFormValues {
  fullName: string;
  email: string;
  gender: Gender | '';
  mobile: string;
  address: string;
  city: string;
  password?: string;
  confirmPassword?: string;
}

/** Validate registration form – all fields mandatory */
export const validateRegistration = (
  values: RegistrationFormValues,
): FormErrors<RegistrationField> => {
  const errors: FormErrors<RegistrationField> = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.gender) {
    errors.gender = 'Please select a gender';
  }

  if (!values.mobile.trim()) {
    errors.mobile = 'Mobile number is required';
  } else if (!MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Mobile must be exactly 10 digits';
  }

  if (!values.address.trim()) {
    errors.address = 'Address is required';
  } else if (values.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  }

  if (!values.city) {
    errors.city = 'Please select a city';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/** Validate login form */
export const validateLogin = (
  values: LoginFormValues,
): FormErrors<LoginField> => {
  const errors: FormErrors<LoginField> = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

/**
 * Validate profile edit form.
 * Password fields are optional – validated only when either is filled.
 */
export const validateProfile = (
  values: ProfileFormValues,
): FormErrors<RegistrationField> => {
  const errors: FormErrors<RegistrationField> = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.gender) {
    errors.gender = 'Please select a gender';
  }

  if (!values.mobile.trim()) {
    errors.mobile = 'Mobile number is required';
  } else if (!MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Mobile must be exactly 10 digits';
  }

  if (!values.address.trim()) {
    errors.address = 'Address is required';
  }

  if (!values.city) {
    errors.city = 'Please select a city';
  }

  const password = values.password ?? '';
  const confirmPassword = values.confirmPassword ?? '';

  if (password || confirmPassword) {
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors;
};

export const hasErrors = (errors: FormErrors): boolean =>
  Object.keys(errors).length > 0;
