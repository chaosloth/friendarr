# Queue Management

Queue endpoints let the dashboard (and any admin tool) monitor and control the download queue. All require the master API key.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/queue` | List all jobs + global paused state |
| `POST` | `/api/v1/queue/:id/pause` | Pause a single job |
| `POST` | `/api/v1/queue/:id/resume` | Resume a paused job |
| `POST` | `/api/v1/queue/:id/retry` | Retry a failed job |
| `DELETE` | `/api/v1/queue/:id` | Cancel a job |
| `DELETE` | `/api/v1/queue` | Clear all completed/failed jobs |
| `POST` | `/api/v1/queue/pause-all` | Globally pause the queue |
| `POST` | `/api/v1/queue/resume-all` | Globally resume the queue |

All endpoints return JSON. Pause, resume, retry, and cancel return the updated job object.

---

## List All Jobs

- **Method:** `GET`
- **Path:** `/api/v1/queue`
- **Auth:** Master key

Returns all jobs and whether the queue is globally paused.

### Response

```json
{
  "jobs": [
    {
      "id": "abc123-...",
      "status": "downloading",
      "progress": 45,
      "bytesDownloaded": 524288000,
      "totalBytes": 1165084440,
      "source": { "type": "plex", "url": "..." },
      "destination": { "title": "Pulp Fiction", "year": 1994 },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "globalPaused": false
}
```

---

## Pause / Resume a Job

- **Method:** `POST`
- **Path:** `/api/v1/queue/:id/pause` | `/api/v1/queue/:id/resume`
- **Auth:** Master key

Pauses or resumes an individual job. Paused jobs are skipped by the queue processor until resumed.

### Response

```json
{
  "id": "abc123-...",
  "status": "paused"
}
```

---

## Retry a Failed Job

- **Method:** `POST`
- **Path:** `/api/v1/queue/:id/retry`
- **Auth:** Master key

Re-queues a failed job, resetting its progress and status to `queued`.

### Response

```json
{
  "id": "abc123-...",
  "status": "queued",
  "progress": 0
}
```

---

## Cancel a Job

- **Method:** `DELETE`
- **Path:** `/api/v1/queue/:id`
- **Auth:** Master key

Removes a job from the queue. If the job is currently downloading, the transfer is aborted.

### Response

```json
{
  "id": "abc123-...",
  "status": "cancelled"
}
```

---

## Clear Finished Jobs

- **Method:** `DELETE`
- **Path:** `/api/v1/queue`
- **Auth:** Master key

Removes all jobs with status `complete`, `failed`, or `cancelled`. Active and queued jobs are untouched.

```json
{ "removed": 5 }
```

---

## Pause All / Resume All

- **Method:** `POST`
- **Path:** `/api/v1/queue/pause-all` | `/api/v1/queue/resume-all`
- **Auth:** Master key

Toggles the global paused flag. When globally paused, no new jobs are dequeued for processing. Already-running jobs finish normally.

### Response

```json
{ "globalPaused": true }
```
