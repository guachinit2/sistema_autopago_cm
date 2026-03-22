/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist', 'node_modules', 'build', '*.cjs'],
  overrides: [
    {
      files: ['apps/backend/**/*.ts'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'react/prop-types': 'off',
        'react/display-name': 'off',
      },
    },
    {
      files: ['apps/frontend/**/*.ts', 'apps/frontend/**/*.tsx'],
      env: {
        browser: true,
        node: false,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'react/prop-types': 'off',
  },
};
