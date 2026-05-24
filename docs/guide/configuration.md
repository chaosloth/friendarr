# Configuration

All settings can be changed at runtime via the web UI (Settings tab) or the `PUT /api/v1/settings` endpoint.

**Settings are persisted** to `config/settings.json` in the data directory. They survive container rebuilds, image pulls, and process restarts. Map the config directory as a volume (`-v ./config:/app/config`) to retain all state (settings, API keys, logs, queue) across Docker lifecycles.

## Settings Reference

| Field                    | Type         | Default               | Description                                  |
| ------------------------ | ------------ | --------------------- | -------------------------------------------- |
| `maxConcurrentDownloads` | `number`     | `2`                   | Maximum parallel downloads                   |
| `maxBandwidth`           | `number`     | `0`                   | Bandwidth limit in bytes/sec (0 = unlimited) |
| `schedules`              | `Schedule[]` | `[]`                  | Time windows when downloads are allowed      |
| `webhooks`               | `Webhook[]`  | `[]`                  | URLs to POST download event notifications    |
| `incompletePath`         | `string`     | env `INCOMPLETE_PATH` | Directory for in-progress downloads          |
| `completedPath`          | `string`     | env `COMPLETED_PATH`  | Root directory for completed media           |
| `testMode`               | `boolean`    | `false`               | Skip actual downloads, mark jobs as complete |

## Schedules

Schedule windows restrict downloads to specific days and times. When schedules are configured and the current time is outside all windows, the queue pauses automatically.

```json
{
  "schedules": [
    {
      "days": [1, 2, 3, 4, 5],
      "windows": [{ "start": "02:00", "end": "06:00" }]
    }
  ]
}
```

- `days`: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
- `windows`: Time ranges in 24-hour `HH:MM` format. Windows can span midnight (e.g., `22:00` to `04:00`).

## Webhooks

Friendarr sends HTTP POST notifications to configured webhook URLs on download events.

```json
{
  "webhooks": [
    {
      "id": "wh-1",
      "url": "https://hooks.example.com/friendarr",
      "events": ["download.started", "download.complete", "download.failed"],
      "secret": "optional-hmac-secret",
      "enabled": true
    }
  ]
}
```

### Webhook Events

| Event                | Fires when                       |
| -------------------- | -------------------------------- |
| `download.requested` | A download is queued             |
| `download.started`   | A download begins processing     |
| `download.complete`  | A download finishes successfully |
| `download.failed`    | A download fails                 |

### Webhook Payload

```json
{
  "event": "download.complete",
  "downloadId": "uuid",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "request": {
    "source": { "type": "plex", "url": "...", "authToken": "***" },
    "destination": { "title": "Movie Name", "year": 2024 }
  },
  "outputPath": "/downloads/complete/movies/Movie Name (2024)/movie.mkv"
}
```

The `authToken` is redacted to `***` in webhook payloads.

### Signature Verification

If `secret` is set, each webhook includes an `X-Friendarr-Signature` header containing the HMAC-SHA256 hex digest of the request body.

## Test Mode

Enable `testMode` in settings to skip actual downloads. Jobs will be marked complete immediately with a fake output path. Useful for testing the queue, webhooks, and UI without a real media server.
