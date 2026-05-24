# Media Sources

Friendarr downloads from three types of remote media servers: **Plex**, **Emby**, and **Jellyfin**.

::: warning Seerr is not a media server
Friendarr previously had a Seerr source adapter but it was removed. Seerr is a request manager, not a media server — it cannot serve file downloads. Configure a Plex, Emby, or Jellyfin remote library instead.
:::

## Source Authentication

| Source | Auth Method | Required Fields |
|---|---|---|
| Plex | `X-Plex-Token` header | `url`, `authToken`, `ratingKey` |
| Emby | `MediaBrowser` auth header with `Token` | `url`, `authToken`, `deviceId`, `mediaId` |
| Jellyfin | `MediaBrowser` auth header with `Token` | `url`, `authToken`, `deviceId`, `mediaId` |

## Plex (Two-Step Download)

Plex downloads use a two-step process because Plex stores media in parts that must be resolved first.

### Step 1: Resolve Media Parts

```
GET {baseUrl}/library/metadata/{ratingKey}?includeMedia=1
Header: X-Plex-Token: {plexToken}
```

The response contains the list of media parts (files) that make up the item.

### Step 2: Download Each Part

```
GET {baseUrl}/library/parts/{partId}/file?download=1
Header: X-Plex-Token: {plexToken}
```

For single-part files, the part is downloaded directly. For multi-part files (e.g., split MKVs), parts are concatenated via a `PassThrough` stream in order.

### Required Fields

- **`ratingKey`** — The Plex rating key that identifies the media item. This is sent by Seerr as `source.ratingKey`.

## Emby / Jellyfin

Emby and Jellyfin share the same API and authentication model.

```
GET {baseUrl}/Items/{itemId}/Download
Header: MediaBrowser Client="Seerr", Device="Seerr",
        DeviceId="{deviceId}", Version="1.0.0", Token="{apiKey}"
```

### Required Fields

- **`mediaId`** — The Emby/Jellyfin item ID. Sent by Seerr as `source.mediaId`.
- **`deviceId`** — An arbitrary device identifier. If not provided, Friendarr generates one as `BOT_friendarr` (base64-encoded).

### Content-Disposition

The downloaded filename is extracted from the `Content-Disposition` header in the response. If absent, falls back to `{title}.mkv`.

## Download Request Format

All downloads share a common request format. The `source` object is source-specific:

```json
// Plex
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

// Emby / Jellyfin
{
  "source": {
    "type": "emby",
    "url": "http://192.168.1.100:8096",
    "authToken": "api-key",
    "deviceId": "Seerr-script",
    "mediaId": "67890"
  },
  "destination": {
    "mediaType": "tv",
    "tmdbId": 1399,
    "title": "Game of Thrones",
    "year": 2011,
    "seasonNumber": 1
  }
}
```
