# Utilities

Health checks, key verification, logs, directory browsing, disk space, and webhook testing.

---

## Health Check

- **Method:** `GET`
- **Path:** `/api/v1/health`
- **Auth:** None

Returns basic health status and the number of active downloads.

### Response

```json
{
  "status": "ok",
  "activeDownloads": 2
}
```

A root-level `GET /health` (no active download count) is also available with no authentication required.

---

## Verify API Key

- **Method:** `GET`
- **Path:** `/api/v1/verify`
- **Auth:** Bearer API key (or master key)

Used to test whether a given API key is valid. Returns the key's label and creation date.

### Response

```json
{
  "valid": true,
  "label": "Seerr instance",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

A `401 Unauthorized` is returned for invalid or missing tokens.

---

## Logs

- **Method:** `GET`
- **Path:** `/api/v1/logs`
- **Auth:** Master key

Returns buffered log entries from the server. The buffer size is controlled by the `LOG_BUFFER_SIZE` environment variable (default `500`).

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `level` | `string` | — | Filter by minimum log level (`debug`, `info`, `warn`, `error`) |

### Response

```json
{
  "entries": [
    {
      "timestamp": "2025-01-15T10:30:00.000Z",
      "level": "info",
      "message": "Download started: Pulp Fiction (1994)",
      "label": "Queue"
    }
  ]
}
```

The **Logs** tab in the web UI provides a real-time tail with auto-refresh and level filtering.

---

## Browse Directories

- **Method:** `GET`
- **Path:** `/api/v1/browse`
- **Auth:** Master key

Lists the contents of a directory on the server's filesystem. Used by the path picker in the web UI.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `path` | `string` | `/` | Directory path to list |

### Response

```json
{
  "path": "/downloads",
  "entries": [
    { "name": "incomplete", "isDirectory": true },
    { "name": "complete", "isDirectory": true }
  ]
}
```

Only directories are listed. Regular files are filtered out.

---

## Disk Space

- **Method:** `GET`
- **Path:** `/api/v1/disk`
- **Auth:** Master key

Returns available disk space at the configured paths.

### Response

```json
{
  "incomplete": { "free": 107374182400, "total": 500107862016 },
  "completed": { "free": 107374182400, "total": 500107862016 }
}
```

Values are in bytes. Displayed in the sidebar info panel.

---

## Test Webhook

- **Method:** `POST`
- **Path:** `/api/v1/webhooks/test`
- **Auth:** Master key

Sends a test payload to a webhook URL to verify connectivity.

### Request

```json
{
  "url": "https://example.com/hooks/download",
  "secret": "whsec_..."
}
```

### Response

```json
{
  "success": true,
  "statusCode": 200
}
```

A `success: false` response indicates the webhook URL could not be reached or returned an error.

---

## Bootstrap

- **Method:** `POST`
- **Path:** `/api/v1/bootstrap`
- **Auth:** None

Sets the master API key when no key is configured. This endpoint is only available during initial setup when the `API_KEY` environment variable is not set. It is called by the setup wizard to persist the generated key to the `.env` file.

### Request

```json
{
  "key": "sk-generated-key-here"
}
```

### Response

```json
{
  "message": "Master key activated"
}
```

Returns `403 Forbidden` if a master key is already configured.
