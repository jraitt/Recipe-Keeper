import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3020,
    allowedHosts: ['recipes.compound-interests.com', 'localhost', '127.0.0.1'],
    hmr: process.env.NODE_ENV === 'production' ? false : true,
    ws: process.env.NODE_ENV === 'production' ? false : true,
    // Only use proxy in development - production uses nginx
    ...(process.env.NODE_ENV !== 'production' && {
      proxy: {
        '/api': {
          target: 'http://backend:3021',
          changeOrigin: true,
          secure: false,
        }
      }
    })
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});