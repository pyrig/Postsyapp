module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['@babel/preset-typescript', { 
        allowNamespaces: true,
        allowDeclareFields: true 
      }]
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};