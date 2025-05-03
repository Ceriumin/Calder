module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@components': './src/components/_index.tsx',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@assets': './assets',
          '@context': './src/context',
          '@constants': './src/constants',
          '@': './src',
        },
      },
    ],
  ],
};