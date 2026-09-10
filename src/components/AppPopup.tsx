/**
 * Reusable animated modal popup with primary / secondary / destructive actions.
 * Prefer showPopup() from PopupContext rather than rendering this directly.
 */

import React, { useEffect } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { radius, spacing, typography } from '../theme';
import Button from './Button';

export interface PopupAction {
  label: string;
  onPress?: () => void;
  /** primary | secondary | destructive */
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface AppPopupProps {
  visible: boolean;
  title: string;
  message?: string;
  actions?: PopupAction[];
  onDismiss?: () => void;
  /** Prevent backdrop / hardware-back dismiss */
  dismissible?: boolean;
}

const AppPopup: React.FC<AppPopupProps> = ({
  visible,
  title,
  message,
  actions = [{ label: 'OK', variant: 'primary' }],
  onDismiss,
  dismissible = true,
}) => {
  const { colors } = useApp();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      opacity.value = withTiming(0, { duration: 140 });
      scale.value = withTiming(0.94, { duration: 140 });
    }
  }, [visible, opacity, scale]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dismissible) {
        onDismiss?.();
      }
      return true;
    });
    return () => sub.remove();
  }, [visible, dismissible, onDismiss]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const runAction = (action: PopupAction) => {
    onDismiss?.();
    // Defer so the modal can close before navigation / side effects
    requestAnimationFrame(() => {
      action.onPress?.();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (dismissible) {
          onDismiss?.();
        }
      }}>
      <View style={styles.root}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.overlay },
            backdropStyle,
          ]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (dismissible) {
                onDismiss?.();
              }
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            cardStyle,
          ]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {actions.map((action, index) => {
              const variant =
                action.variant === 'destructive'
                  ? 'danger'
                  : action.variant === 'secondary'
                    ? 'outline'
                    : 'primary';
              return (
                <Button
                  key={`${action.label}-${index}`}
                  title={action.label}
                  variant={variant}
                  onPress={() => runAction(action)}
                  style={styles.actionBtn}
                />
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});

export default AppPopup;
