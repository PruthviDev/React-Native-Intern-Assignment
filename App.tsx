/**
 * Root App component – wires providers and navigation.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppProvider';
import {
  PopupProvider,
  registerPopupListener,
  usePopup,
} from './src/context/PopupContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useApp } from './src/context/AppContext';

/** Bridges imperative showPopup() used by the network layer */
const PopupBridge: React.FC = () => {
  const { showPopup } = usePopup();
  useEffect(() => {
    registerPopupListener(showPopup);
    return () => registerPopupListener(null);
  }, [showPopup]);
  return null;
};

/** Inner shell so StatusBar can read theme from context */
const AppShell: React.FC = () => {
  const { isDark } = useApp();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <PopupBridge />
      <AppNavigator />
    </>
  );
};

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <PopupProvider>
            <AppShell />
          </PopupProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
