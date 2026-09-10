/**
 * Root App Navigator – switches Auth vs Main based on session,
 * and hosts modal screens (ImageDetails, EditProfile).
 */

import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { Loading } from '../components';
import StackNavigator from './StackNavigator';
import TabNavigator from './TabNavigator';
import ImageDetailsScreen from '../screens/ImageDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { RootStackParamList } from './types';

const RootStack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { bootstrapping, isLoggedIn, isDark, colors } = useApp();

  if (bootstrapping) {
    return <Loading message="Starting app…" />;
  }

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <RootStack.Screen name="MainTabs" component={TabNavigator} />
            <RootStack.Screen
              name="ImageDetails"
              component={ImageDetailsScreen}
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <RootStack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={StackNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
