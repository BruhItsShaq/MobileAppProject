module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],
    'linebreak-style': ['error', 'windows'],
    'no-underscore-dangle': 'off',
    'camel-case': 'off',
    'no-console': 'off',
    // 'react/destructing-assignment': ['error', 'never'],
  },
};
