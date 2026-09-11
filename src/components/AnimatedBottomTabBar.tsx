/**
 * Floating capsule bottom tab bar with a sliding active pill.
 * Used as `tabBar` for the main BottomTabNavigator.
 */

import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { elevatedShadow, radius, spacing } from '../theme';
import Icon, { IconName } from './Icon';

const TAB_ICONS: Record<
  string,
  { active: IconName; inactive: IconName }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Favorites: { active: 'heart', inactive: 'heart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

const TabItem: React.FC<{
  focused: boolean;
  activeIcon: IconName;
  inactiveIcon: IconName;
  color: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
}> = ({
  focused,
  activeIcon,
  inactiveIcon,
  color,
  onPress,
  onLongPress,
  accessibilityLabel,
}) => {
  const pressScale = useSharedValue(1);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * (focused ? 1.06 : 1) }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.88, { duration: 90 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      style={styles.tab}>
      <Animated.View style={iconStyle}>
        <Icon
          name={focused ? activeIcon : inactiveIcon}
          size={22}
          color={color}
        />
      </Animated.View>
    </Pressable>
  );
};

const AnimatedBottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useApp();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const translateX = useSharedValue(0);

  const tabCount = state.routes.length;
  const tabWidth = tabCount > 0 && barWidth > 0 ? barWidth / tabCount : 0;
  // Inner padding so the active capsule sits inside the outer pill
  const capsuleInset = 4;
  const capsuleWidth = Math.max(tabWidth - capsuleInset * 2, 0);

  useEffect(() => {
    if (tabWidth <= 0) {
      return;
    }
    translateX.value = withSpring(
      state.index * tabWidth + capsuleInset,
      SPRING,
    );
  }, [state.index, tabWidth, translateX]);

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: capsuleWidth,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}>
      <View
        onLayout={onBarLayout}
        style={[
          styles.capsule,
          {
            backgroundColor: colors.tabCapsule,
            borderColor: colors.border,
          },
          elevatedShadow(colors, isDark),
        ]}>
        {capsuleWidth > 0 ? (
          <Animated.View
            style={[
              styles.activePill,
              { backgroundColor: colors.tabActiveBg },
              pillStyle,
            ]}
          />
        ) : null}

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const icons = TAB_ICONS[route.name] ?? {
            active: 'ellipse' as IconName,
            inactive: 'ellipse-outline' as IconName,
          };
          const color = focused
            ? isDark
              ? colors.black
              : colors.white
            : colors.tabInactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            // Avoid pushing duplicate screens – only navigate when not focused
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              focused={focused}
              activeIcon={icons.active}
              inactiveIcon={icons.inactive}
              color={color}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  activePill: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    borderRadius: radius.pill,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default AnimatedBottomTabBar;
