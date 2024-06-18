import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import * as path from 'path';

import manifest from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        // Ensure webextension-polyfill is properly resolved
        'webextension-polyfill': path.resolve(
          __dirname,
          'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
        ),
      },
    },
    build: {
      emptyOutDir: true, // Clears the output directory on build
      outDir: 'build', // Specifies the output directory for the build
      rollupOptions: {
        input: {
          contentScript: path.resolve(__dirname, 'src/contentScript/index.ts'),
          inpage: path.resolve(__dirname, 'src/contentScript/inpage.ts'),
          background: path.resolve(__dirname, 'src/background/index.ts'), // Make sure the path matches where your background script is
        },
        output: {
          dir: 'build',
          format: 'es',
          inlineDynamicImports: false,
          entryFileNames: '[name].js',
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    plugins: [crx({ manifest }), react()],
  };
});
