<p align="center">
  <h1 align="center">
    Friendarr
  </h1>
  <p align="center">
    Standalone downloading microservice for Friend Libraries
  </p>
</p>

<p align="center">
  <a href="https://chaosloth.github.io/friendarr/"><img src="https://img.shields.io/badge/docs-vitepress-brightgreen" alt="Docs"></a>
  <img src="https://img.shields.io/docker/pulls/conno/friendarr" alt="Docker pulls">
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node">
</p>

**Friendarr** is the download companion to [Seerr](https://github.com/seerr-team/seerr)'s **Friend Libraries** feature. Seerr discovers media on your friends' remote libraries (Plex, Emby, Jellyfin). When you request something from a friend, Seerr hands the download job to Friendarr. Friendarr pulls the file from the remote server and places it into your local media library.

**[Read the full documentation →](https://chaosloth.github.io/friendarr/)**

## Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/chaosloth/friendarr/main/docs/screenshots/queue.png" alt="Queue Dashboard" width="400">
  <img src="https://raw.githubusercontent.com/chaosloth/friendarr/main/docs/screenshots/settings.png" alt="Settings" width="400">
  <br/>
  <img src="https://raw.githubusercontent.com/chaosloth/friendarr/main/docs/screenshots/logs.png" alt="Logs" width="400">
</p>

## How It Fits Together

```mermaid
graph LR
    A[Your Media Server<br/>Plex / Jellyfin / Emby] <--> B[Seerr<br/>Request Manager]
    B --> C[Friendarr<br/>Downloading Service]
    C --> D[Friend's Library<br/>Plex / Emby / Jellyfin]
    C --> E[Your Media Storage<br/>/movies, /tv]
    B -->|Discovers content| D
    B -->|Sends download request| C
    C -->|Fetches file| D
    C -->|Writes file| E
    A <-->|Scans library| E
```

- **Seerr** handles the full request lifecycle — discovery, approvals, user management, notifications.
- **Friendarr** is a lightweight companion that only does one thing: download files from friend libraries.
- They communicate over a REST API authenticated with API keys.

## Request Flow

```mermaid
sequenceDiagram
    actor User
    participant Seerr
    participant Friendarr as Friendarr<br/>(Download Service)
    participant Remote as Friend's<br/>Media Server
    participant Storage as Your<br/>Media Storage

    User->>Seerr: Browse discover/search<br/>Sees "3 friends" badge
    User->>Seerr: Request movie from<br/>friend's library
    Seerr->>Friendarr: POST /api/v1/download<br/>Bearer sk-...
    Note right of Friendarr: {source, destination, metadata}
    Friendarr->>Friendarr: Enqueue job<br/>Check schedule window
    Friendarr->>Remote: GET /download (authenticated)
    Remote-->>Friendarr: Stream file
    Friendarr->>Storage: Write to /movies/Title (Year)/Title (Year).mkv
    Friendarr-->>Seerr: 202 Accepted + downloadId
    Seerr->>Friendarr: GET /api/v1/status/:id (poll)
    Friendarr-->>Seerr: {status: "downloading", progress: 45%}
    Seerr-->>User: Request status: Downloading
    Friendarr-->>Seerr: {status: "complete"}
    Seerr-->>User: Media available in your library!
```

## Quick Start

### Docker

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

### Manual

```bash
git clone https://github.com/chaosloth/friendarr.git
cd friendarr
pnpm install
cp .env.example .env
# edit .env with your API_KEY
pnpm build
pnpm start
```

Open **http://localhost:5056** and enter your master API key.

## Documentation

Full documentation with configuration, API reference, file placement, and source setup: **[chaosloth.github.io/friendarr](https://chaosloth.github.io/friendarr/)**

## Development

```bash
pnpm install
pnpm dev        # watch mode: auto-recompile + restart
pnpm typecheck  # TypeScript check without emitting
pnpm lint       # ESLint
pnpm format     # Prettier
```

See the [documentation](https://chaosloth.github.io/friendarr/) for the full architecture overview and contributing guide.

## License

[MIT](./LICENSE)
