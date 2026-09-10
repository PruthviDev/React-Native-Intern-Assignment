/**
 * Bottom tab navigator – Home, Favorites, Profile with animated capsule bar.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AnimatedBottomTabBar } from '../components';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Stable reference – avoids remounting the custom tab bar on each render */
const renderTabBar = (props: React.ComponentProps<typeof AnimatedBottomTabBar>) => (
  <AnimatedBottomTabBar {...props} />
);

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={renderTabBar}
    screenOptions={{
      headerShown: false,
      // Floating capsule overlays content – keep list footers clear
      sceneStyle: styles.scene,
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarAccessibilityLabel: 'Home' }}
    />
    <Tab.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{ tabBarAccessibilityLabel: 'Favorites' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarAccessibilityLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  scene: {
    paddingBottom: 84,
  },
});

export default TabNavigator;
