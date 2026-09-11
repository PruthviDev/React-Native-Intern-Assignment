/**
 * Radio group for Gender selection (and similar single-choice fields).
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { typography } from '../theme';

interface Option {
  label: string;
  value: string;
}

interface RadioGroupProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  error,
}) => {
  const { colors } = useApp();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.row}>
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(opt.value)}
              style={styles.option}>
              <View
                style={[
                  styles.outer,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}>
                {selected ? (
                  <View
                    style={[styles.inner, { backgroundColor: colors.primary }]}
                  />
                ) : null}
              </View>
              <Text style={{ color: colors.text }}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  error: {
    ...typography.small,
    marginTop: 4,
  },
});

export default RadioGroup;
