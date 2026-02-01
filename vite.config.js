import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: (process.env.VITE_BASE_URL || './'),
  plugins: [
    react({
      jsxRuntime: 'automatic',
      include: [/\.[jt]sx?(\?.*)?$/]
    }),
    svgr(),
    {
      name: 'transform-js-as-jsx',
      async transform(code, id) {
        if (/src[\\/].*\.js(\?.*)?$/.test(id)) {
          return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
        }
        return null;
      },
    }
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
      'routes': path.resolve(__dirname, 'src/routes.jsx'),
      'routes.js': path.resolve(__dirname, 'src/routes.jsx')
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  esbuild: {
    jsx: 'automatic'
  },
  
  build: {
    outDir: 'dist', // Output directory for build
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:59201',
        changeOrigin: true,
        secure: false,
      },
    },
  }
});
