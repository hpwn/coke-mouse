let deferred: any = null;

export function listenBeforeInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferred = e;
    document.documentElement.setAttribute('data-a2hs', 'ready');
  });
}

export async function promptInstall() {
  if (!deferred) return false;
  const e = deferred;
  deferred = null;
  document.documentElement.setAttribute('data-a2hs', 'pending');
  const res = await e.prompt();
  document.documentElement.removeAttribute('data-a2hs');
  return res?.outcome === 'accepted';
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}
