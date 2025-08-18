import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM build
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'dist',
    outExtension: () => ({ js: '.mjs' }),
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    minify: false,
  },
  // CommonJS build
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    dts: false,
    clean: false,
    splitting: false,
    sourcemap: true,
    minify: false,
  },
  // CLI build
  {
    entry: ['src/cli/index.ts'],
    format: ['cjs'],
    outDir: 'dist/cli',
    outExtension: () => ({ js: '.js' }),
    dts: false,
    clean: false,
    splitting: false,
    sourcemap: true,
    minify: false,
    shims: true,
    banner: {
      js: '#!/usr/bin/env node\n',
    },
  },
]);
