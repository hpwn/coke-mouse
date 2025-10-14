import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const BASE_PATH = process.env.BASE_PATH ?? '';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'coke-mouse',
        short_name: 'coke-mouse',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: '#0b0f17',
        background_color: '#0b0f17',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      pwaAssets: { image: 'static/icon.svg', preset: 'minimal' },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//]
      },
      devOptions: { enabled: true, suppressWarnings: true }
    })
  ]
});
