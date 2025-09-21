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

## Technology

Coke-mouse uses a small [Svelte](https://svelte.dev) + [Vite](https://vitejs.dev) app.

## Getting Started

```bash
npm ci
npm run dev
npm test
npm run build
```

## Persistence & Export/Import

State is saved in IndexedDB using [localforage](https://github.com/localForage/localForage). Use the **Export JSON** button to download your habits and **Import JSON** to restore them from a file.

Deleting a habit is permanent and removes all of its logs. There is no undo, so use the Delete button with care.

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
  - Stats: Last, Best (7d), and Tonight’s target (Last - 5m, never earlier than an hour before the wrap).
  - Comparison uses a 6PM wrap by default so 11:00 PM outranks 2:00 AM.
  - CSV export adds metric_kind, metric_minutes, metric_normalized, metric_display, metric_tz_offset columns.

## Contributing

Interested in contributing? Great! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
