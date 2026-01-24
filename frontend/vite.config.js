import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      // Include .js files as JSX files
      include: '**/*.{jsx,js}',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    svgr() // Transform SVG files to React components
  ],
  resolve: {
    alias: {
      // Set up src as base for all imports
      '~': path.resolve(__dirname, 'src'),
      // Add all the directories as aliases
      'src': path.resolve(__dirname, 'src'),
      'assets': path.resolve(__dirname, 'src/assets'),
      'components': path.resolve(__dirname, 'src/components'),
      'contexts': path.resolve(__dirname, 'src/contexts'),
      'layouts': path.resolve(__dirname, 'src/layouts'),
      'theme': path.resolve(__dirname, 'src/theme'),
      'variables': path.resolve(__dirname, 'src/variables'),
      'views': path.resolve(__dirname, 'src/views'),
      // Add specific files that might be imported directly
      'routes': path.resolve(__dirname, 'src/routes.js'),
      'routes.js': path.resolve(__dirname, 'src/routes.js')
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: 'jsx',
              contents: 'import React from "react"; ' + 'export default {}',
            }))
          },
        },
      ],
    },
  },
  build: {
    outDir: 'dist', // Output directory for build
  },
  server: {
    port: 3000, // Default port
    open: true, // Open browser on start
  }
});
