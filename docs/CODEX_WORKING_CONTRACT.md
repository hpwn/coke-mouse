# Codex Working Contract (coke-mouse)

## Must follow
1. Make **ONLY** the changes described in the task. No unrelated edits.
2. Base branch is **main**.
3. After edits, run:
   ```bash
   npm test
   npm run build
   ```
4. Push the **work branch** named in the task (do **not** open a PR unless explicitly asked).

## Repo facts

* Node version: **20** (via `.nvmrc`)
* Dev: `npm run dev`
* Build: `npm run build`
* Preview: `npm run preview` → open `http://localhost:4173/coke-mouse/` (note base path)
* Tests: `npm test` (Vitest)

## UI/Deploy notes

* GitHub Pages base path: **/coke-mouse** (all local preview/links must respect this)
* Keep bundle lean; avoid heavy deps unless approved.

## Accessibility & Quality bar

* Keyboard navigation, labeled controls, sensible `aria-*`.
* No console errors/warnings in happy-path flows.
* Export/Import remains backward-compatible unless task says otherwise.
