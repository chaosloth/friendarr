# Friendarr — Plan & Backlog

## Purpose

Friendarr is the standalone downloading companion service to Seerr's "Friend Libraries" feature. Seerr discovers content on remote libraries and hands off download requests to Friendarr, which handles the actual file transfer — authenticating with the source server, downloading the media, and placing it in the correct library directory structure where Radarr/Sonarr will discover it on the next scan.

## Relationship to Seerr

Seerr's `POST /api/v1/request/:id/send-to-remote` route builds a `downloadServicePayload` object that matches Friendarr's `DownloadRequest` schema exactly. Seerr sends this payload to Friendarr's `POST /api/v1/download` endpoint via HTTP.

## Completed

### Phase 1.0 — Core Service

| #      | Task                                                                               | Status |
| ------ | ---------------------------------------------------------------------------------- | ------ |
| 1.0.1  | Express server scaffold (TypeScript, port 5056)                                    | done   |
| 1.0.2  | Bearer token auth (master key + API keys)                                          | done   |
| 1.0.3  | API key management (create, list, delete)                                          | done   |
| 1.0.4  | Download queue with status tracking (queued/downloading/complete/failed)           | done   |
| 1.0.5  | File placer (movie/show folder structure)                                          | done   |
| 1.0.6  | Seerr-themed colored console logger                                                | done   |
| 1.0.7  | Health check endpoint                                                              | done   |
| 1.0.8  | Seerr source adapter (X-Api-Key, content-disposition parsing)                      | done   |
| 1.0.9  | Emby/Jellyfin source adapter (MediaBrowser auth, deviceId support)                 | done   |
| 1.0.10 | Plex source adapter (two-step: resolve parts → download, multi-part concatenation) | done   |

### Phase 1.5 — Web UI & UX

| #      | Task                                                                    | Status |
| ------ | ----------------------------------------------------------------------- | ------ |
| 1.5.1  | Seerr-themed web UI (sidebar, nav, dark theme)                          | done   |
| 1.5.2  | Queue dashboard (stats, table, pause/resume/clear actions)              | done   |
| 1.5.3  | Settings page (endpoints, API keys, limits, paths, schedules, webhooks) | done   |
| 1.5.4  | Auth modal (master API key authentication)                              | done   |
| 1.5.5  | Logs viewer with auto-refresh and level filtering                       | done   |
| 1.5.6  | Source endpoints management (add/edit/delete with token visibility)     | done   |
| 1.5.7  | API key CRUD UI (generate, reveal, copy, revoke)                        | done   |
| 1.5.8  | Webhook management (add, delete, event selection)                       | done   |
| 1.5.9  | Schedule gating (time-window based download restrictions)               | done   |
| 1.5.10 | First-run setup wizard (API key, paths, optional endpoint)              | done   |
| 1.5.11 | Full-page queue and logs tables (flex-1 min-h-0 overflow-auto)          | done   |
| 1.5.12 | API key reveal returns full key (server no longer truncates)            | done   |
| 1.5.13 | Copy button on generated API keys                                       | done   |
| 1.5.14 | Redact authToken from webhook payloads                                  | done   |
| 1.5.15 | Venn diagram logo icon in sidebar                                       | done   |
| 1.5.16 | Rename "Source Endpoints" to "Friend Libraries"                         | done   |
| 1.5.17 | New API key result: emerald styling (not yellow), truncate+copy         | done   |
| 1.5.18 | `/api/v1/verify` endpoint for auth validation                           | done   |

### Phase 2.0 — Production Readiness

| #     | Task                                                     | Status  |
| ----- | -------------------------------------------------------- | ------- |
| 2.0.1 | Dockerfile (Alpine, multi-stage)                         | pending |
| 2.0.2 | docker-compose.yml for local dev                         | pending |
| 2.0.3 | File rotation logger (winston or similar)                | pending |
| 2.0.4 | Graceful shutdown (finish active downloads on SIGTERM)   | pending |
| 2.0.5 | Health endpoint includes queue statistics                | pending |
| 2.0.6 | Persistent API key storage (JSON file or SQLite)         | pending |
| 2.0.7 | Download progress tracking (track bytes as stream flows) | pending |
| 2.0.8 | Resume support for interrupted downloads                 | pending |

### Phase 3.0 — Integration

| #     | Task                                                                  | Status  |
| ----- | --------------------------------------------------------------------- | ------- |
| 3.0.1 | Seerr `send-to-remote` actually calls Friendarr via HTTP              | done    |
| 3.0.2 | Callback to Seerr on download completion (update MediaRequest status) | pending |
| 3.0.3 | Webhook notifications on download events                              | done    |
| 3.0.4 | Webhook HMAC signature support                                        | done    |

### Phase 4.0 — Advanced

| #     | Task                                 | Status  |
| ----- | ------------------------------------ | ------- |
| 4.0.1 | Bandwidth throttling                 | pending |
| 4.0.2 | Per-source rate limiting             | pending |
| 4.0.3 | S3/cloud storage destination support | pending |
| 4.0.4 | Checksum verification after download | pending |

### Phase 5.0 — UX Polish

| #     | Task                                                      | Status |
| ----- | --------------------------------------------------------- | ------ |
| 5.0.1 | Runtime log level control from UI                         | done   |
| 5.0.2 | Full-width logs table                                     | done   |
| 5.0.3 | Configurable movie/TV directory paths                     | done   |
| 5.0.4 | File browser for path inputs (server-side API + modal UI) | done   |
| 5.0.5 | i18n translation system with 7 languages                  | done   |
| 5.0.6 | Language selection in setup wizard (first question)       | done   |
| 5.0.7 | Language selector in settings (new Display section)       | done   |

## Source-Specific Download Details

### Seerr

```
GET {baseUrl}/api/v1/media/{mediaId}/download
Headers: X-Api-Key: {apiKey}
```

Seerr source adapter **removed** — Seerr is not a media server and cannot serve file downloads. The `sendToFriendarr` helper now throws an error for `seerr` type sources. Users must configure a Plex, Emby, or Jellyfin endpoint.

### Emby / Jellyfin

```
GET {baseUrl}/Items/{itemId}/Download
Headers: Authorization: MediaBrowser Client="Seerr", Device="Seerr",
         DeviceId="{deviceId}", Version="1.0.0", Token="{apiKey}"
```

### Plex (Two-Step)

```
# Step 1: Resolve media parts
GET {baseUrl}/library/metadata/{ratingKey}?includeMedia=1
Headers: X-Plex-Token: {plexToken}

# Step 2: Download each part
GET {baseUrl}/library/parts/{partId}/file?download=1
Headers: X-Plex-Token: {plexToken}
```

Multi-part files are concatenated in order via a PassThrough stream.

## Environment Variables Reference

| Variable                   | Default                 | Purpose                                         |
| -------------------------- | ----------------------- | ----------------------------------------------- |
| `PORT`                     | `5056`                  | Listen port                                     |
| `API_KEY`                  | —                       | Master API key (required for managing API keys) |
| `INCOMPLETE_PATH`          | `/downloads/incomplete` | Directory for in-progress downloads             |
| `COMPLETED_PATH`           | `/downloads/complete`   | Root directory for completed media              |
| `MAX_CONCURRENT_DOWNLOADS` | `2`                     | Max parallel downloads                          |
| `MAX_BANDWIDTH`            | `0` (unlimited)         | Bandwidth limit in bytes/sec                    |

## File Placement Convention

```
{completedPath}/movies/Movie Title (Year)/Movie Title (Year).mkv
{completedPath}/tv/Show Title/Season 01/Show Title - S01E01.mkv
```
