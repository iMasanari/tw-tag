// @ts-check

import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const input = {
  'tw-tag': './src/tw-tag.ts',
  'babel-plugin': './src/babel-plugin.ts',
}

export default defineConfig([
  {
    input,
    plugins: [esbuild()],
    output: [
      { format: 'esm', dir: 'dist', entryFileNames: '[name].mjs', chunkFileNames: 'chunk-[name]-[hash].mjs' },
      { format: 'cjs', dir: 'dist', entryFileNames: '[name].js', chunkFileNames: 'chunk-[name]-[hash].js', exports: 'named' },
    ],
    external: [/^node:/],
  }, {
    input,
    plugins: [dts()],
    output: [
      { format: 'esm', dir: 'dist', entryFileNames: '[name].d.ts' },
    ],
  },
])
