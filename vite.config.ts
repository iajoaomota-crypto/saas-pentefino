import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon-v5.png', 'logo-v5.png'],
        manifest: {
          name: 'PenteFino Barber Shop',
          short_name: 'PenteFino',
          description: 'Dashboard de administração PenteFino',
          theme_color: '#00d26a',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: '/favicon-v5.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/logo-v5.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/logo-v5.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': 'http://localhost:3001'
      }
    },
  };
});
