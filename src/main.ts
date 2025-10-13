import Page from './routes/+page.svelte';
import './styles/theme.css';
import './ui/theme';

const app = new Page({
  target: document.getElementById('app') as HTMLElement
});

export default app;
