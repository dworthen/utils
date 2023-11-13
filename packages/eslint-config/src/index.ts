import { TSESLint } from '@typescript-eslint/utils'

const config: TSESLint.Linter.Config = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'react-hooks',
    'react-refresh',
    '@d-dev',
    'jsx-a11y',
    'promise',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:promise/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 'off',
    'sort-imports': 'off',
    'simple-import-sort/imports': 'error',
    'no-void': 'off',
    'promise/avoid-new': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      { 'ts-expect-error': 'allow-with-description' },
    ],
    'react-refresh/only-export-components': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@d-dev/extensions': 'error',
  },
}

export default config
