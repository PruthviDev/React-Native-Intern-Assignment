/**
 * Spacing, radius, and shadow tokens for consistent layout.
 */

import { Platform, ViewStyle } from 'react-native';
import { AppColors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
  /** Header bottom corners */
  header: 20,
} as const;

/** Cross-platform card shadow (prefer over elevation-only) */
export const cardShadow = (colors: AppColors, isDark: boolean): ViewStyle => ({
  ...Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.45 : 0.1,
      shadowRadius: 10,
    },
    android: {
      elevation: 3,
      shadowColor: colors.shadow,
    },
    default: {},
  }),
});

/** Softer shadow for floating controls (tab bar, popups) */
export const elevatedShadow = (
  colors: AppColors,
  isDark: boolean,
): ViewStyle => ({
  ...Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.5 : 0.14,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
      shadowColor: colors.shadow,
    },
    default: {},
  }),
});
