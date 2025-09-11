import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '$app/environment': fileURLToPath(new URL('./test/mocks/app-environment.ts', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom'
  }
});
