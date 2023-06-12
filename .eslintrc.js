module.exports = {
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
