module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: ['@d-dev'],
  plugins: ['@d-dev'],
  rules: {
    '@d-dev/extensions': [
      'error',
      [
        {
          expectedExtensions: ['.js', '.json'],
        },
      ],
    ],
  },
}
