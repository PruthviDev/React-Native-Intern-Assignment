/**
 * Entry point.
 * gesture-handler and reanimated MUST load before the app so the
 * worklets runtime is ready (fixes "runtime is not ready" invariant).
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
