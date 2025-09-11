import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      '$app/environment': fileURLToPath(new URL('./test/mocks/app-environment.ts', import.meta.url))
    }
  },
  test: {
    environment: 'node'
  }
});
