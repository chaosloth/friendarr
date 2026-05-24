# File Placement

Friendarr places completed downloads into a directory structure compatible with Plex, Emby, and Jellyfin libraries.

## Directory Layout

```
{completedPath}/
├── movies/
│   └── Movie Title (Year)/
│       └── Movie Title (Year).mkv
└── tv/
    └── Show Title/
        └── Season 01/
            └── Show Title - S01E01.mkv
```

## Configuring Paths

| Path       | Env Var           | Description                              |
| ---------- | ----------------- | ---------------------------------------- |
| Completed  | `COMPLETED_PATH`  | Root for final media files               |
| Incomplete | `INCOMPLETE_PATH` | Temp directory for in-progress downloads |

Both can be overridden at runtime via settings.

## Two-Stage Download

1. **Download** → `{incompletePath}/{jobId}-{filename}` — the file streams directly to a temp location
2. **Place** → `{completedPath}/movies/...` or `{completedPath}/tv/...` — the file is hard-linked to its final destination
3. **Cleanup** → The temp file is removed

If the incomplete and completed directories are on the same filesystem, hard links avoid copying data — the second stage is instant.

## Filename Sanitization

Filenames and folder names are sanitized to remove characters that are invalid on most filesystems:

- `< > : " / \ | ? *` → removed
- Multiple spaces → collapsed to single space
- Leading/trailing dots and spaces → trimmed

## Movie Convention

```
{completedPath}/movies/{Title} ({Year})/{Title} ({Year}).{ext}
```

## TV Convention

```
{completedPath}/tv/{Show Title}/Season {SS}/{Show Title} - S{SS}E{EE}.{ext}
```

The season and episode numbers come from the download request's `destination.seasonNumber` and content-disposition header from the media server.
