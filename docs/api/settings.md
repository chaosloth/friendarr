# Settings

Runtime settings control download concurrency, bandwidth limits, schedules, source endpoints, webhooks, and paths. All can be changed via the web UI or this API.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/settings` | Read all runtime settings |
| `PUT` | `/api/v1/settings` | Update runtime settings (partial) |

Both endpoints require the master API key.

---

## Get Settings

- **Method:** `GET`
- **Path:** `/api/v1/settings`
- **Auth:** Master key

### Response

```json
{
  "maxConcurrentDownloads": 2,
  "maxBandwidth": 0,
  "schedules": [
    {
      "days": [1, 2, 3, 4, 5],
      "bandwidth": 0,
      "windows": [{ "start": "02:00", "end": "06:00" }]
    }
  ],
  "webhooks": [
    {
      "url": "https://example.com/hooks/download",
      "secret": "whsec_...",
      "events": ["download.complete", "download.failed"],
      "enabled": true
    }
  ],
  "incompletePath": "/downloads/incomplete",
  "completedPath": "/downloads/complete",
  "moviePath": "/downloads/complete/movies",
  "tvPath": "/downloads/complete/tv",
  "testMode": false,
  "logLevel": "info"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `maxConcurrentDownloads` | `number` | `2` | Max parallel downloads |
| `maxBandwidth` | `number` | `0` | Global speed limit in bytes/sec (0 = unlimited) |
| `schedules` | `array` | `[]` | Time-window restrictions for downloads |
| `webhooks` | `array` | `[]` | Webhook endpoints for event notifications |
| `incompletePath` | `string` | `/downloads/incomplete` | Directory for in-progress downloads |
| `completedPath` | `string` | `/downloads/complete` | Root directory for completed media |
| `moviePath` | `string` | `""` | Custom movie directory (falls back to `completedPath/movies`) |
| `tvPath` | `string` | `""` | Custom TV directory (falls back to `completedPath/tv`) |
| `testMode` | `boolean` | `false` | When true, skips actual downloads |
| `logLevel` | `string` | `"info"` | Minimum log level (`debug`, `info`, `warn`, `error`) |

---

## Update Settings

- **Method:** `PUT`
- **Path:** `/api/v1/settings`
- **Auth:** Master key

Sends a partial update — only include the fields you want to change. Omitted fields keep their current values.

### Request

```json
{
  "maxConcurrentDownloads": 4,
  "maxBandwidth": 10485760,
  "testMode": false
}
```

### Response

Returns the full settings object (same shape as GET).

---

## Schedules

Each schedule defines one or more time windows during which downloads are permitted. If `schedules` is empty or not set, downloads run at any time.

```json
{
  "days": [0, 1, 2, 3, 4, 5, 6],
  "bandwidth": 0,
  "windows": [{ "start": "02:00", "end": "06:00" }]
}
```

- **`days`** — Day-of-week numbers (`0` = Sunday, `6` = Saturday).
- **`bandwidth`** — Per-window bandwidth cap in bytes/sec. Overrides the global `maxBandwidth` during this window. `0` = unlimited.
- **`windows`** — Time ranges in `HH:MM` 24-hour format. End times can cross midnight (e.g., `"22:00"` to `"02:00"`).
- When multiple schedules overlap, the last schedule in the array wins.

Configure schedules via the **Settings → Schedules** tab in the web UI for a visual 7×24 grid editor with click-drag window creation.

## Test Mode

When `testMode` is `true`, download jobs skip the actual file transfer. They are marked `complete` immediately with zero bytes transferred. Useful for testing request flows and Seerr integration without consuming real bandwidth.

Enable from the **Settings → General** tab.
