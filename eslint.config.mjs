import globals from 'globals';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.browser,
      sourceType: 'module',
      ecmaVersion: 2020,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.json'],
        },
      },
    },
  },
  {
    ignores: ['.config/*', 'node_modules/*', 'coverage/*'],
  },
];
