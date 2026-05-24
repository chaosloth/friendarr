# AGENTS.md

## Project Overview

Friendarr is a standalone downloading microservice that fetches media from remote Seerr, Plex, Emby, and Jellyfin instances. It is the companion service to Seerr's "Friend Libraries" feature — Seerr discovers content on remote libraries and hands off download requests to Friendarr for the actual file transfer.

Includes a web UI at `/` (Seerr-styled) for managing the queue, API keys, source endpoints, limits, and schedules.

## Key Commands

| Command                | What it does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `pnpm install`         | Install dependencies                                                 |
| `pnpm build`           | Compile TypeScript to `dist/` and copy `src/ui/` to `dist/ui/`       |
| `pnpm start`           | Run the compiled service (`node dist/index.js`)                      |
| `pnpm dev`             | Build, then watch mode: `tsc --watch` + `node --watch dist/index.js` |
| `pnpm typecheck`       | Type-check without emitting (`tsc --noEmit`)                         |
| `pnpm lint`            | ESLint on `src/`                                                     |
| `pnpm format`          | Prettier format                                                      |
| `pnpm docker:build`    | Build production Docker image                                        |
| `pnpm docker:tag`      | Tag image for push (`DOCKER_REPO` env, default `conno/friendarr`)    |
| `pnpm docker:push`     | Push tagged image to Docker Hub                                      |
| `pnpm docker:release`  | Build + tag + push in one command                                    |
| `docker compose up -d` | Start dev stack with hot-reload                                      |

## Gotchas

- **No test framework or test files** — there is no `pnpm test` command.
- **Master key doubles as API key** — the `API_KEY` env var authenticates both master-level endpoints (`/api/v1/api-keys`, `/api/v1/queue`, `/api/v1/settings`) and regular download endpoints (`/api/v1/download`, `/api/v1/status/:downloadId`).
- **`dotenv` loads `.env`** — copy `.env.example` to `.env` and fill in values, or set env vars directly.
- **UI HTML is in `src/ui/index.html`** — `tsc` alone won't copy it; `pnpm build` handles this. The `dev` script also copies it on start, but does not watch HTML for changes.

## Architecture

```
src/
├── index.ts              Express server entry point (port 5056, serves UI at /)
├── logger.ts             Seerr-themed colored console logger
├── config.ts             Environment variable configuration (dotenv)
├── auth.ts               Bearer token auth (master key + in-memory API keys)
├── types.ts              DownloadRequest, DownloadJob, ApiKey types
├── settings.ts           Runtime settings store (concurrency, bandwidth, schedules, source endpoints)
├── routes/
│   └── api.ts            All REST endpoints
├── lib/
│   ├── queue.ts          Download queue (list, pause, resume, cancel, schedule gating)
│   └── file-placer.ts    Movie/TV file placement (Plex/Jellyfin/Emby conventions)
├── sources/
│   ├── seerr.ts          Seerr source adapter (X-Api-Key)
│   ├── emby-jellyfin.ts  Emby/Jellyfin source adapter (MediaBrowser header)
│   └── plex.ts           Plex source adapter (2-step: resolve parts → download)
└── ui/
    └── index.html        Seerr-styled SPA (queue view + settings)
```

## Web UI

Served at `/`. Authenticate with the master API key to access:

- **Queue** — view all jobs with status badges, progress bars; pause/resume/cancel individual jobs; pause/resume all; clear finished
- **Settings** — manage API keys, source endpoints, concurrency limits, bandwidth limits, and download schedules with multiple time windows per day

All UI-reachable API endpoints require the master API key (`Bearer` token).

## API Endpoints

| Method   | Path                         | Auth              | Purpose                             |
| -------- | ---------------------------- | ----------------- | ----------------------------------- |
| `POST`   | `/api/v1/download`           | Bearer API key    | Queue a download                    |
| `GET`    | `/api/v1/status/:downloadId` | Bearer API key    | Track download progress             |
| `GET`    | `/api/v1/queue`              | Bearer master key | List all jobs + global paused state |
| `POST`   | `/api/v1/queue/:id/pause`    | Bearer master key | Pause a single job                  |
| `POST`   | `/api/v1/queue/:id/resume`   | Bearer master key | Resume a paused job                 |
| `DELETE` | `/api/v1/queue/:id`          | Bearer master key | Cancel a job                        |
| `DELETE` | `/api/v1/queue`              | Bearer master key | Clear all completed/failed jobs     |
| `POST`   | `/api/v1/queue/pause-all`    | Bearer master key | Globally pause queue processing     |
| `POST`   | `/api/v1/queue/resume-all`   | Bearer master key | Globally resume queue processing    |
| `GET`    | `/api/v1/settings`           | Bearer master key | Get runtime settings                |
| `PUT`    | `/api/v1/settings`           | Bearer master key | Update runtime settings             |
| `POST`   | `/api/v1/api-keys`           | Bearer master key | Create API key                      |
| `GET`    | `/api/v1/api-keys`           | Bearer master key | List API keys                       |
| `DELETE` | `/api/v1/api-keys/:key`      | Bearer master key | Revoke API key                      |
| `GET`    | `/api/v1/health`             | None              | Health check + active downloads     |

A root-level `GET /health` endpoint (no auth, no active-download count) also exists in `src/index.ts`.

## Download Request Format

Sent by Seerr's `POST /request/:id/send-to-remote`:

```json
{
  "source": {
    "type": "seerr | plex | emby | jellyfin",
    "url": "https://friend-server.example.com",
    "authToken": "...",
    "deviceId": "Seerr-script",
    "mediaId": "123",
    "ratingKey": "456"
  },
  "destination": {
    "libraryPath": "/media/movies",
    "mediaType": "movie | tv",
    "title": "Movie Title",
    "year": 2024,
    "tmdbId": 123456
  },
  "metadata": {
    "nfo": true,
    "poster": true,
    "fanart": true
  }
}
```

## Environment Variables

| Variable                   | Default                 | Purpose                                                                |
| -------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `PORT`                     | `5056`                  | Listen port                                                            |
| `API_KEY`                  | —                       | Master API key for managing API keys (also works as a regular API key) |
| `INCOMPLETE_PATH`          | `/downloads/incomplete` | Directory for in-progress downloads                                    |
| `COMPLETED_PATH`           | `/downloads/complete`   | Root directory for completed media (movies/tv beneath)                 |
| `MAX_CONCURRENT_DOWNLOADS` | `2`                     | Initial max parallel downloads (overridable at runtime via settings)   |

## Source-Specific Auth

| Source   | Auth Method                             |
| -------- | --------------------------------------- |
| Seerr    | `X-Api-Key` header                      |
| Plex     | `X-Plex-Token` header                   |
| Emby     | `MediaBrowser` auth header with `Token` |
| Jellyfin | `MediaBrowser` auth header with `Token` |

## File Placement Convention

```
/movies/Movie Title (Year)/
  Movie Title (Year).mkv

/tv/Show Title/
  Season 01/
    Show Title - S01E01.mkv
```

## Environment

- **Node >= 20, TypeScript 5**
- No external DB — download jobs, API keys, and settings are stored in memory
- Plex downloads use a two-step process: resolve media parts, then download each part
- Multi-part Plex files are concatenated via a `PassThrough` stream
- Schedule gating: when schedules are configured, `processQueue()` only dequeues jobs during active windows (based on current day + time). Outside windows, the queue pauses automatically.

## Docker

| File                  | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `Dockerfile`          | Multi-stage Alpine production build (TypeScript compile, minimal runtime) |
| `Dockerfile.local`    | Dev image with hot-reload via `pnpm dev`                                  |
| `docker-compose.yaml` | Dev stack (source mount, port 5056)                                       |

### Docker Hub

The project pushes to `conno/friendarr` on Docker Hub. The `DOCKER_REPO` env var in package.json scripts can override this.

### GitHub Actions

| Workflow                        | Trigger                | What it does                                                   |
| ------------------------------- | ---------------------- | -------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | PRs, push to `develop` | Lint, typecheck, build. Pushes `:develop` tag on develop push. |
| `.github/workflows/release.yml` | Tag push `v*`          | Multi-arch build + push `:version`, `:latest` to Docker Hub    |

Both require `DOCKER_USERNAME` and `DOCKER_TOKEN` GitHub secrets.

## OpenCode Skills

- **`friendarr-commit`** — Conventional Commits workflow, pre-commit checks, what not to commit
- **`friendarr-docker`** — Docker build, dev stack, smoke test, push workflow

## Logging

Uses a Seerr-themed colored console logger with timestamp, level, and label format:

```
2026-05-23T10:32:14.051Z [info] [Server]: Friendarr 0.1.0
2026-05-23T10:32:14.054Z [info] [Auth]: Master API key configured
```

Levels: `info` (green), `warn` (yellow), `error` (red), `debug` (blue).
