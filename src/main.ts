import Page from './routes/+page.svelte';

const app = new Page({
  target: document.getElementById('app') as HTMLElement
});

export default app;
