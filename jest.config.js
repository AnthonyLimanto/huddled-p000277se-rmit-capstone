module.exports = {
    preset: 'jest-expo',
    setupFiles: ['./jest.setup.js'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(jest-)?(' +
        [
          '@rneui',
          'react-native',
          '@react-native',
          '@expo',
          'expo',
          'expo-.*',
          'expo-modules-core',
          'react-native-ratings',
          'react-native-size-matters',
        ].join('|') +
      ')/)',
    ],
  };