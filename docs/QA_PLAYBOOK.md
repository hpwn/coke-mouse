# QA Playbook

## Quick manual checks

* **Routing/base path**

  * Preview: `http://localhost:4173/coke-mouse/`
  * Pages: `https://hpwn.github.io/coke-mouse/`
  * Hard-refresh nested routes → no 404s.
* **Tabs & a11y**

  * Keyboard through Positive | Negative; verify `aria-selected` / `aria-controls`.
* **Positive**

  * Add/rename habits; log/edit/delete entries; grouping headers (Today/Yesterday/YYYY-MM-DD).
  * CSV export opens in text editor & spreadsheet; escaping intact.
* **Negative**

  * View timeline toggle; add/edit/delete logs.
  * “Time since last” updates immediately after log changes.
* **Delete habit**

  * Name-to-confirm; logs removed; empty state shown.
* **Export/Import**

  * v2 export; clear storage; import → round-trip OK.
  * v1 import → positives intact, negatives imported.
* **Persistence**

  * Reload and confirm state.
* **Edge content**

  * Note with commas, quotes, newlines, emojis:
    `He said, "keep going"\nLine2 🚀` → CSV still valid.

## Bug report template

### Summary

<one line>

### Steps to Reproduce

1.
2.
3.

### Expected

<what should happen>

### Actual

<what happened>

### Evidence

* Screenshot / console log
* Export file (if relevant)

### Environment

* Browser + version:
* URL (Preview/Pages):
* Commit/Branch:
