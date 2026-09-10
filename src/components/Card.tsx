/**
 * Surface card with cross-platform shadow for list items and profile sections.
 */

import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useApp } from '../context/AppContext';
import { cardShadow, radius, spacing } from '../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Disable drop shadow when nested / flat */
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = true,
  ...rest
}) => {
  const { colors, isDark } = useApp();

  return (
    <View
      {...rest}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        elevated ? cardShadow(colors, isDark) : null,
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});

export default Card;
