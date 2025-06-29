const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are properly handled
config.resolver.sourceExts.push('ts', 'tsx', 'mjs');

// Enable package exports and condition names for proper module resolution
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

// Explicitly set the babel transformer
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = config;