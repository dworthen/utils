import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['./src/index.ts', './src/plopfile.ts'],
  format: ['esm'],
  treeshake: true,
  splitting: false,
  sourcemap: false,
  clean: true,
}))
