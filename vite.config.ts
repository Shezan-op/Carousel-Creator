import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Carousel Creator',
        short_name: 'Carousel',
        description: '100% Client-Side Carousel Generator',
        theme_color: '#09090B',
        background_color: '#09090B',
        display: 'standalone',
        icons: [
          { src: '/Logo.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' },
          { src: '/Logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/Logo.png', sizes: '192x192', type: 'image/png' }
        ]
      }
    })
  ]
});
