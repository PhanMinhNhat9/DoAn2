import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['doan2-hrnx.onrender.com']
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'VietFood - Khám phá ẩm thực Việt',
          short_name: 'VietFood',
          description: 'Ứng dụng AI nhận diện và chia sẻ món ăn Việt Nam',
          theme_color: '#ea580c',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
