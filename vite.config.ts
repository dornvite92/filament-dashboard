/**
 * Konfiguracja Vite dla Filament Dashboard
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Bazowa ścieżka dla nginx (serwowany z /filament/)
  base: '/filament/',

  // Konfiguracja serwera deweloperskiego
  server: {
    port: 3000,
    host: true,
    // Proxy do Moonraker API podczas developmentu
    proxy: {
      '/api': {
        target: 'http://localhost:7125',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Optymalizacje builda
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Mniejsze chunki dla szybszego ładowania
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          xlsx: ['xlsx', 'file-saver'],
        },
      },
    },
  },
});
