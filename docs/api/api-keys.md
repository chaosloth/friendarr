# API Keys

API keys allow external services (such as Seerr) to authenticate with Friendarr and submit download jobs. All API key management requires the master key.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/api-keys` | Create a new API key |
| `GET` | `/api/v1/api-keys` | List all API keys |
| `DELETE` | `/api/v1/api-keys/:key` | Revoke an API key |

Keys are persisted to disk in the `config/` directory and survive restarts.

---

## Create API Key

- **Method:** `POST`
- **Path:** `/api/v1/api-keys`
- **Auth:** Master key

Generates a new API key with a descriptive label.

### Request

```json
{
  "label": "Seerr instance"
}
```

### Response

```json
{
  "apiKey": "sk-a1b2c3d4e5f6...",
  "label": "Seerr instance",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

::: warning Save the key immediately
The full API key is only returned once at creation time. It cannot be recovered later.
:::

---

## List API Keys

- **Method:** `GET`
- **Path:** `/api/v1/api-keys`
- **Auth:** Master key

Returns all API keys without exposing the key values.

### Response

```json
[
  {
    "keyPrefix": "sk-a1b2c3...",
    "label": "Seerr instance",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

---

## Revoke API Key

- **Method:** `DELETE`
- **Path:** `/api/v1/api-keys/:key`
- **Auth:** Master key

Deletes the specified API key. The full key value must be provided in the URL path.

### Response

```json
{ "revoked": true }
```

The master API key (from the `API_KEY` environment variable) cannot be revoked through this endpoint.
