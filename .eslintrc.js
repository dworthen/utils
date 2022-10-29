module.exports = {
  plugins: ['simple-import-sort', 'react-hooks', '@d-dev'],
  extends: ['standard-with-typescript', 'eslint-config-prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'import/extensions': 'off',
    'sort-imports': 'off',
    'simple-import-sort/imports': 'error',
    'no-void': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@d-dev/extensions': [
      'error',
      [
        {
          // files: ['**/*/cjs/src/**/*.{ts,tsx,js,jsx}'],
          ignorePackages: true,
          relativeModulePrefixes: ['.', '~'],
          disallowedExtensions: [],
          expectedExtensions: ['.js', '.css'],
        },
      ],
    ],
  },
}
