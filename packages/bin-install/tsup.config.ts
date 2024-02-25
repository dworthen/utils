import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['./src/index.ts', './src/bin.ts'],
  format: ['esm', 'cjs'],
  target: 'node20',
  shims: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  clean: true,
}))
