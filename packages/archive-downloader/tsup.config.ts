import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['./src/index.ts', './src/bin.ts'],
  format: ['esm'],
  target: 'node18',
  shims: true,
  treeshake: true,
  splitting: true,
  sourcemap: true,
  clean: true,
}))
