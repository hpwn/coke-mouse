# coke-mouse 🐭

[Inspiration 🎥](https://www.youtube.com/watch?v=n0FwB482fIg)

## Overview

Coke-mouse is a habit management system that gamifies the balance between positive and negative habits 🔄. Inspired by behavioral science experiments, this system tracks time spent on productive activities and rewards these efforts with points. These points can be spent on indulgences, promoting a healthy balance in daily routines.

## Features

- **Negative Habits** 📉: Track time between indulgences and stretch goals as you improve.
- **Negative Timelines** 🕒: View and manage histories of negative habit logs.
- **Positive Habits** 📈: Create daily habits and log successes with free-form notes and timestamps.
- **Log Edit/Delete** ✏️🗑️: Modify or remove individual entries in both positive and negative timelines.
- **Date Grouping** 📅: Timelines group entries by Today, Yesterday, or YYYY-MM-DD.
- **Per-habit CSV Export** 📄: Download logs for any habit as a CSV file.
- **Export/Import** 🔄: Save or load all habit data as JSON for backup or transfer.
- **Delete Habits** 🗑️: Remove a habit and all its logs via a protected confirmation dialog.
- **Habit Pipeline & Nudges** 🚦: Track each habit as Queued, Active, Paused, or Archived while lightweight daily/weekly prompts encourage adding and starting habits.

## Technology

Coke-mouse uses a small [Svelte](https://svelte.dev) + [Vite](https://vitejs.dev) app.

## Getting Started

```bash
npm ci
npm run dev
npm test
npm run build
```

## UI Theme & Icons

- Dark mode follows system with a toggle (bottom-right).
- Buttons progressively gain icons + tooltips; text hides on small screens but remains accessible.
- To force an icon on any custom button, add `data-icon="play|plus|clock|trash|download|list|target|timer|log"` and an `aria-label`.
- Global component styles live in **src/styles/components.css** (inputs, selects, buttons, chips, tooltips, timeline).
- To theme a new control, prefer tokens: `--input-bg`, `--input-border`, `--surface-1`, `--border`, `--focus-ring`.

## Dark mode (SvelteKit)

- Bootstrap sets `data-theme` in **src/app.html** before paint.
- Global tokens load in **src/routes/+layout.svelte** via `../styles/theme.css`.
- Floating toggle rendered by **$lib/components/ThemeToggle.svelte**.

## PWA

- Uses **@vite-pwa/sveltekit** with `start_url`/`scope` set to `.` so GitHub Pages base paths work.
- Icons are generated from **static/icon.svg**.
- An install hint appears when `beforeinstallprompt` fires. You can remove it later if desired.
- Service worker set to **autoUpdate**; assets & pages cached for offline use.

### Auth (Supabase)

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON` in repo secrets or `.env.local`.
- Email link redirects to `/auth/callback`.
- Session persists in `localStorage`.

### Install tips

- Chrome/Edge: use the omnibox **Install** icon or ⋮ → **Install app**.
- If not visible, open the app with `?pwa=debug` and confirm `manifest link: yes` and `beforeinstallprompt: ready`.

### PWA debug overlay

- Open the app with `?pwa=debug` (for example: `/coke-mouse/?pwa=debug`).
- The overlay shows the manifest link, service worker scope/state, caches, and whether `beforeinstallprompt` has fired.
- If the Install button appears there, click it to manually trigger the install prompt in Chromium-based browsers.

## Persistence & Export/Import

State is saved in IndexedDB using [localforage](https://github.com/localForage/localForage). Use the **Export JSON** button to download your habits and **Import JSON** to restore them from a file.

Deleting a habit is permanent and removes all of its logs. There is no undo, so use the Delete button with care.

The Home view includes a Today bar with quick nudges. Add new ideas straight into the queued pipeline, promote queued habits to active status at the start of the week, and keep an eye on the suggested soft cap of three active habits to stay focused without overload.

Export files are versioned. The current format is `version: 2` and includes both negative and positive sections:

```json
{
  "version": 2,
  "exportedAt": 0,
  "negative": { "habits": [], "logs": [] },
  "positive": { "habits": [], "logs": [] }
}
```

Older `version: 1` exports contained only the negative section and can still be imported.

## Metrics

- **Time of Day (Bedtime)**: mark a Positive habit to track nightly bedtimes.
  - Actions: **Log Now** captures the current local time, **Log Time…** lets you enter a specific date and HH:MM.
  - Stats: Last, Best (7d), and Tonight’s target (Last - 5m in local minutes, never earlier than 5:00 PM local).
  - Comparison uses a 6PM wrap by default so 11:00 PM outranks 2:00 AM.
  - CSV export adds metric_kind, metric_minutes, metric_normalized, metric_display, metric_tz_offset columns.
  - CSV downloads are prefixed with a UTF-8 BOM so emoji stay intact in Excel.

## Contributing

Interested in contributing? Great! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
