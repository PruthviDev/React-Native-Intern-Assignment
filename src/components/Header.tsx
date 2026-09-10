/**
 * Screen header with optional back icon, title, right slot, and expandable search.
 * Bottom corners use a consistent design-system radius.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { radius, spacing, typography } from '../theme';
import Icon from './Icon';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Enables search icon → expandable input in the header */
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  onSearchOpenChange?: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  right,
  searchable = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search by author or ID…',
  onSearchOpenChange,
}) => {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const expand = useSharedValue(0);

  useEffect(() => {
    expand.value = withTiming(searchOpen ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    onSearchOpenChange?.(searchOpen);
    if (searchOpen) {
      // Focus after layout so the keyboard opens reliably
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(t);
    }
    Keyboard.dismiss();
  }, [searchOpen, expand, onSearchOpenChange]);

  const openSearch = () => setSearchOpen(true);

  const closeSearch = () => {
    setSearchOpen(false);
    onSearchChange?.('');
  };

  const searchRowStyle = useAnimatedStyle(() => ({
    opacity: expand.value,
    maxHeight: expand.value * 52,
    marginTop: expand.value * spacing.sm,
    transform: [{ translateY: (1 - expand.value) * -6 }],
  }));

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top, 8),
          backgroundColor: colors.headerBg,
          borderBottomColor: colors.border,
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.iconBtn}>
              <Icon name="chevron-back" size={26} color={colors.text} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {searchOpen && searchable ? 'Search' : title}
        </Text>

        <View style={[styles.side, styles.right]}>
          {searchable ? (
            <TouchableOpacity
              onPress={searchOpen ? closeSearch : openSearch}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={searchOpen ? 'Close search' : 'Open search'}
              style={styles.iconBtn}>
              <Icon
                name={searchOpen ? 'close' : 'search'}
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          ) : (
            right
          )}
        </View>
      </View>

      {searchable ? (
        <Animated.View style={[styles.searchRow, searchRowStyle]}>
          <View
            style={[
              styles.searchField,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}>
            <Icon name="search" size={18} color={colors.textSecondary} />
            <TextInput
              ref={inputRef}
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: {
    width: 44,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    overflow: 'hidden',
  },
  searchField: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
});

export default Header;
