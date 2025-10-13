export type IconName =
  | "sun" | "moon" | "plus" | "play" | "clock" | "edit" | "trash" | "download" | "list" | "target" | "timer" | "log";

const P = (d:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

const icons: Record<IconName,string> = {
  sun:    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon:   '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  plus:   'M12 5v14M5 12h14',
  play:   'M6 4l14 8-14 8z',
  clock:  'M12 8v5l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  edit:   'M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  trash:  'M3 6h18M8 6v14h8V6M10 6V4h4v2',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  list:   'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  target: 'M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8zm0-14v2m0 8v2m8-6h-2M6 12H4',
  timer:  'M10 2h4M12 14V8M21 13a9 9 0 1 1-9-9',
  log:    'M4 4h16v4H4zM4 12h16v8H4z'
};

export function iconSvg(name: IconName): string {
  const d = icons[name];
  if (!d) return '';
  if (d.indexOf('<') === 0) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return P(d);
}
