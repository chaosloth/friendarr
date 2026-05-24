# API Overview

Friendarr exposes a REST API at `http://localhost:5056/api/v1`.

## Authentication

All API endpoints (except `/health`) require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <api-key>
```

### Two Levels of Access

| Level          | Key                             | Access                                                                      |
| -------------- | ------------------------------- | --------------------------------------------------------------------------- |
| **API key**    | Master key or generated API key | Download endpoints, status tracking                                         |
| **Master key** | The `API_KEY` env var           | Everything above + queue management, settings, API key CRUD, logs, webhooks |

The master API key also works as a regular API key for download endpoints.

### Response Format

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| `200`  | Success                                     |
| `201`  | Created (API keys)                          |
| `202`  | Accepted (download queued)                  |
| `204`  | No content (deleted)                        |
| `400`  | Bad request — missing or invalid body       |
| `401`  | Missing or malformed `Authorization` header |
| `403`  | Invalid API key or insufficient permissions |
| `404`  | Resource not found                          |
| `502`  | Upstream error (webhook test failure)       |

Error responses have the shape:

```json
{
  "error": "Human-readable error message"
}
```

## Health Check

```
GET /health
```

No authentication required. Returns:

```json
{
  "status": "ok"
}
```

Also available at `/api/v1/health` with additional info:

```json
{
  "status": "ok",
  "activeDownloads": 0
}
```

## API Key Verification

```
GET /api/v1/verify
Authorization: Bearer <api-key>
```

Returns `{"status":"ok"}` if the API key is valid. Useful for testing connectivity.
