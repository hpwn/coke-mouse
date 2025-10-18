import type { HandleClientError } from '@sveltejs/kit';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, reg) {
    console.log('[PWA] registered:', swUrl, reg);
  },
  onRegisterError(error) {
    console.error('[PWA] register error:', error);
  }
});

export const handleError: HandleClientError = ({ error }) => {
  console.error('[PWA] client error:', error);
};
