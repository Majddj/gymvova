module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@shared': './src/shared',
            '@store': './src/store',
            '@app': './src/app',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
