/**
 * Author filter chips: All / A-M / N-Z.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { AuthorFilter } from '../types';
import { AUTHOR_FILTERS } from '../utils/constants';
import { radius, typography } from '../theme';

interface FilterBarProps {
  value: AuthorFilter;
  onChange: (filter: AuthorFilter) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ value, onChange }) => {
  const { colors } = useApp();

  return (
    <View style={styles.row}>
      {AUTHOR_FILTERS.map(filter => {
        const active = value === filter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onChange(filter)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}>
            <Text
              style={{
                ...typography.caption,
                fontWeight: '600',
                color: active ? colors.white : colors.text,
              }}>
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});

export default FilterBar;
