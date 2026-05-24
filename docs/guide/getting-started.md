# Getting Started

## Prerequisites

- **Node.js** >= 20
- **pnpm** (recommended) or npm

## Docker

The fastest way to get Friendarr running is with Docker:

```bash
docker pull conno/friendarr:latest

docker run -d \
  -p 5056:5056 \
  -e API_KEY=your-master-key-here \
  -e COMPLETED_PATH=/downloads/complete \
  -e INCOMPLETE_PATH=/downloads/incomplete \
  -v /path/to/your/downloads:/downloads:rw \
  -v ./config:/app/config \
  conno/friendarr:latest
```

::: tip Persist data between rebuilds
Map the `config/` directory (`-v ./config:/app/config`) to persist API keys and settings across container rebuilds and image pulls. This is where Friendarr stores `api-keys.json`.
:::

### Docker Compose

```yaml
# docker-compose.yaml
services:
  friendarr:
    image: conno/friendarr:latest
    ports:
      - "5056:5056"
    environment:
      - API_KEY=your-master-key-here
      - COMPLETED_PATH=/downloads/complete
      - INCOMPLETE_PATH=/downloads/incomplete
    volumes:
      - /path/to/your/downloads:/downloads:rw
      - ./config:/app/config
```

```bash
docker compose up -d
```

## Running Locally

```bash
git clone https://github.com/chaosloth/friendarr.git
cd friendarr
pnpm install
pnpm build
pnpm start
```

For development with hot reload:

```bash
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env` and set the required values:

| Variable | Default | Required | Purpose |
|---|---|---|---|
| `PORT` | `5056` | No | Listen port |
| `API_KEY` | — | **Yes** | Master API key for managing API keys and accessing the UI |
| `INCOMPLETE_PATH` | `/downloads/incomplete` | No | Directory for in-progress downloads |
| `COMPLETED_PATH` | `/downloads/complete` | No | Root directory for completed media (movies/tv beneath) |
| `MOVIE_PATH` | `""` | No | Custom movie directory (falls back to `COMPLETED_PATH/movies`) |
| `TV_PATH` | `""` | No | Custom TV directory (falls back to `COMPLETED_PATH/tv`) |
| `MAX_CONCURRENT_DOWNLOADS` | `2` | No | Max parallel downloads (overridable at runtime) |
| `DEBUG` | `false` | No | Enable debug-level logging |
| `LOG_BUFFER_SIZE` | `500` | No | Number of log entries kept in memory |
| `DATA_DIR` | `./config` | No | Path for persistent data (API keys) |

### About the API_KEY

The `API_KEY` serves double duty:

- **Master key** — required to access the web UI, manage API keys, and configure settings
- **Regular API key** — also works as a regular API key for download endpoints

Generate a secure key:

```bash
openssl rand -hex 32
```

## Verifying

Check that Friendarr is running:

```bash
curl http://localhost:5056/health
# {"status":"ok"}
```

Open the web UI at **http://localhost:5056** and enter your master API key (or follow the setup wizard if no key is configured).

## Setup Wizard

When no `API_KEY` is configured, Friendarr shows a setup wizard on first launch:

1. **Language** — choose your preferred language from the supported list
2. **API Key** — generate a secure key with a label, or paste an existing one
3. **Paths** — configure download directory locations

The wizard persists the key to your `.env` file so it survives restarts.

## Integration with Seerr

In Seerr, go to **Settings → Services → Friendarr** and configure:

1. **Enable** Friendarr
2. Set **Hostname** to your Friendarr server (e.g., `localhost`)
3. Set **Port** to `5056`
4. Set **API Key** to the same value as Friendarr's `API_KEY`
5. Click **Test** to verify connectivity

Seerr will then automatically send download requests to Friendarr when a user requests media from a Friend Library.
