/**
 * Full-screen / inline loading indicator.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { typography } from '../theme';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading…',
  fullScreen = true,
}) => {
  const { colors } = useApp();

  return (
    <View
      style={[
        styles.wrap,
        fullScreen && styles.full,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
      ]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  full: {
    flex: 1,
  },
  text: {
    ...typography.caption,
    marginTop: 10,
  },
});

export default Loading;
