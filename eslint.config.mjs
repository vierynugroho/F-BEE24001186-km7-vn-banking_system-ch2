import globals from 'globals';

export default [
  {
    rules: {
      'no-unused-vars': 'error',
    },
    parserOptions: {
      ecmaVersion: 2020, // mendukung import/export dan dynamic imports
      sourceType: 'module',
    },
    env: {
      es6: true,
      node: true,
    },
    rules: {
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
  { files: ['**/*.js'], languageOptions: { sourceType: 'module' } },
  { languageOptions: { globals: globals.browser } },
];
