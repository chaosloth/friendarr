# API Endpoints

## Download

### Queue a Download

`POST /api/v1/download` &mdash; API key required

Queues a media file for download from a remote Plex, Emby, or Jellyfin server.

**Request Body**

```json
{
  "source": {
    "type": "plex",
    "url": "http://192.168.1.100:32400",
    "authToken": "plex-token",
    "ratingKey": "12345"
  },
  "destination": {
    "mediaType": "movie",
    "tmdbId": 680,
    "title": "Pulp Fiction",
    "year": 1994
  },
  "metadata": {
    "nfo": true,
    "poster": true,
    "fanart": true
  }
}
```

**Response** `202 Accepted`

```json
{
  "id": "download-uuid",
  "status": "queued",
  "progress": 0,
  "bytesDownloaded": 0,
  "totalBytes": 0
}
```

### Get Download Status

`GET /api/v1/status/:downloadId` &mdash; API key required

Polls the current status and progress of a download job.

**Response** `200 OK`

```json
{
  "id": "download-uuid",
  "status": "downloading",
  "progress": 45,
  "bytesDownloaded": 450000000,
  "totalBytes": 1000000000,
  "request": { "source": {...}, "destination": {...} },
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

Status values: `queued`, `downloading`, `complete`, `failed`.

## All Endpoints

### API Keys

| Method | Path                    | Auth       |
| ------ | ----------------------- | ---------- |
| POST   | `/api/v1/api-keys`      | Master key |
| GET    | `/api/v1/api-keys`      | Master key |
| DELETE | `/api/v1/api-keys/:key` | Master key |

#### POST /api/v1/api-keys

Create a new API key.

**Request**

```json
{ "label": "My API Key" }
```

**Response**

```json
{ "apiKey": "sk-abc123..." }
```

#### GET /api/v1/api-keys

List all API keys.

**Response**

```json
{ "keys": [{ "key": "sk-...", "label": "...", "createdAt": "..." }] }
```

#### DELETE /api/v1/api-keys/:key

Revoke an API key.

### Queue Management

| Method | Path                       | Auth       |
| ------ | -------------------------- | ---------- |
| GET    | `/api/v1/queue`            | Master key |
| POST   | `/api/v1/queue/:id/pause`  | Master key |
| POST   | `/api/v1/queue/:id/resume` | Master key |
| DELETE | `/api/v1/queue/:id`        | Master key |
| DELETE | `/api/v1/queue`            | Master key |
| POST   | `/api/v1/queue/pause-all`  | Master key |
| POST   | `/api/v1/queue/resume-all` | Master key |

#### GET /api/v1/queue

List all queued and completed jobs.

**Response**

```json
{ "jobs": [...], "globalPaused": false }
```

#### POST /api/v1/queue/:id/pause

Pause a specific job.

#### POST /api/v1/queue/:id/resume

Resume a paused job.

#### DELETE /api/v1/queue/:id

Cancel a specific job.

#### DELETE /api/v1/queue

Clear all completed and failed jobs.

#### POST /api/v1/queue/pause-all

Pause all queue processing.

#### POST /api/v1/queue/resume-all

Resume all queue processing.

### Settings

| Method | Path               | Auth       |
| ------ | ------------------ | ---------- |
| GET    | `/api/v1/settings` | Master key |
| PUT    | `/api/v1/settings` | Master key |

#### GET /api/v1/settings

Get current runtime settings.

**Response**

```json
{ "maxConcurrentDownloads": 2, "maxBandwidth": 0, "schedules": [], ... }
```

#### PUT /api/v1/settings

Update runtime settings.

**Request**

```json
{ "maxConcurrentDownloads": 4, "testMode": false }
```

### Health & Auth

| Method | Path             | Auth |
| ------ | ---------------- | ---- |
| GET    | `/api/v1/health` | None |

#### GET /api/v1/health

Health check with active download count.

**Response**

```json
{ "status": "ok", "activeDownloads": 1 }
```

### Health & Auth

| Method | Path             | Auth    |
| ------ | ---------------- | ------- |
| GET    | `/api/v1/verify` | API key |

#### GET /api/v1/verify

Verify an API key is valid.

**Response**

```json
{ "status": "ok" }
```

### Logs

| Method | Path           | Auth       |
| ------ | -------------- | ---------- |
| GET    | `/api/v1/logs` | Master key |

#### GET /api/v1/logs

Get buffered log entries.

**Response**

```json
{
  "logs": [
    { "timestamp": "...", "level": "info", "label": "Queue", "message": "..." }
  ]
}
```

### Webhooks

| Method | Path                    | Auth       |
| ------ | ----------------------- | ---------- |
| POST   | `/api/v1/webhooks/test` | Master key |

#### POST /api/v1/webhooks/test

Test a webhook URL.

**Request**

```json
{ "url": "https://hooks.example.com/endpoint", "secret": "optional-hmac-key" }
```

**Response**

```json
{ "status": "ok" }
```

### other

| Method | Path             | Auth       |
| ------ | ---------------- | ---------- |
| GET    | `/api/v1/browse` | Master key |
