/**
 * Debounced-ready search bar for Home and Favorites screens.
 */

import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { radius, typography } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search by author or ID…',
}) => {
  const { colors } = useApp();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
        },
      ]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        style={[styles.input, { color: colors.text }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 10,
  },
  input: {
    ...typography.body,
    padding: 0,
  },
});

export default SearchBar;
