import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const BASE_PATH = process.env.BASE_PATH ?? '';

export default defineConfig({
  base: BASE_PATH,
  plugins: [sveltekit()]
});
