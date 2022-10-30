import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  shims: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  clean: true,
}))
