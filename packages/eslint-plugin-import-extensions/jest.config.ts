export default {
  testMatch: ['**/tests/**/*.{js,cjs,ts}'],
  collectCoverage: true,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
}
