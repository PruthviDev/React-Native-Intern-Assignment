/**
 * Reusable text input with label, thin error border, and inline validation text.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { radius, spacing, typography } from '../theme';
import Icon from './Icon';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: object;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  secureTextEntry,
  containerStyle,
  ...rest
}) => {
  const { colors } = useApp();
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.inputBackground,
            borderColor: hasError ? colors.error : colors.border,
            borderWidth: hasError ? 1.5 : 1,
          },
        ]}>
        <TextInput
          {...rest}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry ? hidden : false}
          style={[styles.input, { color: colors.text }]}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setHidden(h => !h)}
            hitSlop={8}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Icon
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {hasError ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs + 2,
  },
  inputWrap: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: 10,
  },
  error: {
    ...typography.small,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});

export default Input;
