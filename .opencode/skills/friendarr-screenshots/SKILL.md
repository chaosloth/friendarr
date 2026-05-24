---
name: friendarr-screenshots
description: Use ONLY when taking screenshots of the Friendarr UI for documentation. Launches Playwright Chromium, authenticates with the master API key from .env, navigates to a page, and captures a screenshot saved to docs/screenshots/. The Friendarr server must be running on port 5056.
---

# Friendarr Screenshots (Playwright)

## Prerequisites

Playwright with Chromium must be installed:

```bash
npx playwright install chromium
```

The Friendarr server must be running on port 5056:

```bash
pnpm dev
```

The `.env` file must have a valid `API_KEY` set — the script reads it for authentication.

## Screenshot script

### Capture all pages

```bash
pnpm docs:screenshots
```

### Capture a specific page

```bash
npx tsx scripts/screenshot.ts --path "/" --name "queue"
```

## Authentication

The script reads the `API_KEY` from `.env` and uses it to authenticate via the Friendarr auth modal. It:

1. Navigates to `http://localhost:5056`
2. Clicks the auth button to open the modal
3. Fills in the master API key
4. Clicks Connect
5. Waits for the modal to close

If already authenticated (cookie/session), the auth step is skipped.

## Output

Screenshots are saved to `docs/screenshots/<name>.png`. Reference them in docs like:

```markdown
![Queue Dashboard](/screenshots/queue.png)
```

## Available Targets

| `--name`   | Description                                           |
| ---------- | ----------------------------------------------------- |
| `queue`    | Queue dashboard with job table, pause/resume controls |
| `settings` | Settings page showing source endpoints tab            |
| `logs`     | Logs viewer with auto-refresh and level filter        |

## Viewport

Default: 1440×900 in dark mode, full-page capture.
