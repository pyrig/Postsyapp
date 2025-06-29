const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are properly handled
config.resolver.sourceExts.push('ts', 'tsx', 'mjs');

// Explicitly set the babel transformer
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = config;