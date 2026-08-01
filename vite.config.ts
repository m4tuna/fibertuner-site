import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      // Forward /api/* to netlify dev (port 8888) so `npm run dev` works with Netlify functions.
      // Run `npm run netlify:dev` in a separate terminal to serve the functions.
      '/api': 'http://localhost:8888',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fibertuner Broadcast',
        short_name: 'FT Broadcast',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        start_url: '/broadcast/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
