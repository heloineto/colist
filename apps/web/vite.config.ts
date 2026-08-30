import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/route-tree.gen.ts',
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Never serve index.html for API navigations (Google OAuth redirect).
      workbox: { navigateFallbackDenylist: [/^\/api\//] },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'safari-pinned-tab.svg',
      ],
      manifest: {
        name: 'Colist',
        short_name: 'Colist',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#2b8a3e',
        background_color: '#2b8a3e',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: { tsconfigPaths: true },
  server: { proxy: { '/api': 'http://localhost:5100' } },
});
