/**
 * Default eslint configuration options to use for the
 * extensions rule
 */

import { ExtensionsOptions } from './extensions.schema.js'

export const defaultSettings: Required<ExtensionsOptions> = {
  files: ['**/*.{ts,tsx,js,jsx,mts,mjs}'],
  ignorePackages: true,
  relativeModulePrefixes: ['.'],
  expectedExtensions: ['.js', '.json', '.css'],
  disallowedExtensions: [],
}
