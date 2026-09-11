module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Must be listed last – required by Reanimated 4 / Worklets
  plugins: ['react-native-worklets/plugin'],
};
