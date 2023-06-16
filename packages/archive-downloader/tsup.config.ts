import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['./src/index.ts', './src/bin.ts'],
  format: ['esm', 'cjs'],
  target: 'node18',
  shims: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  clean: true,
}))
