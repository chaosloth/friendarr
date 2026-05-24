# Download

The download endpoints are the core of Friendarr — they let Seerr (or any client) submit and track download jobs.

## Queue a Download

- **Method:** `POST`
- **Path:** `/api/v1/download`
- **Auth:** Bearer API key (or master key)

Adds a download job to the queue. The job runs as soon as the queue processor picks it up (respecting concurrency limits and schedule windows).

### Request Body

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
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `source.type` | `"plex" \| "emby" \| "jellyfin"` | Remote media server type |
| `source.url` | `string` | Base URL of the remote server |
| `source.authToken` | `string` | Auth token for the remote server |
| `source.ratingKey` | `string` | Plex rating key (Plex only) |
| `source.mediaId` | `string` | Emby/Jellyfin item ID |
| `source.deviceId` | `string` | Device identifier (Emby/Jellyfin) |
| `destination.mediaType` | `"movie" \| "tv"` | Media type |
| `destination.tmdbId` | `number` | TMDB ID for metadata lookups |
| `destination.title` | `string` | Title for file naming |
| `destination.year` | `number` | Release year |
| `destination.seasonNumber` | `number` | Season number (TV only) |
| `metadata.nfo` | `boolean` | Generate NFO file |
| `metadata.poster` | `boolean` | Download poster image |
| `metadata.fanart` | `boolean` | Download fanart image |

### Response

```json
{
  "id": "abc123-...",
  "status": "queued",
  "progress": 0,
  "bytesDownloaded": 0,
  "totalBytes": 0
}
```

**Status:** `202 Accepted`

---

## Get Download Status

- **Method:** `GET`
- **Path:** `/api/v1/status/:downloadId`
- **Auth:** Bearer API key (or master key)

Polls the status and progress of a previously queued download.

### Response

```json
{
  "id": "abc123-...",
  "status": "downloading",
  "progress": 45,
  "bytesDownloaded": 524288000,
  "totalBytes": 1165084440,
  "source": { "type": "plex", "url": "..." },
  "destination": { "title": "Pulp Fiction", "year": 1994 },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:32:00.000Z"
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `queued` | Waiting in the queue |
| `downloading` | Actively transferring |
| `complete` | Finished successfully |
| `failed` | Download error or cancelled |
| `paused` | Paused by user |
