<p align="center">
  <h1 align="center">
    Friendarr
  </h1>
  <p align="center">
    Standalone downloading microservice for Friend Libraries
  </p>
</p>

<p align="center">
  <a href="https://friendarr.download/"><img src="https://img.shields.io/badge/docs-vitepress-brightgreen" alt="Docs"></a>
  <img src="https://img.shields.io/docker/pulls/conno/friendarr" alt="Docker pulls">
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node">
</p>

**Friendarr** is the download companion to [Seerr](https://github.com/seerr-team/seerr)'s **Friend Libraries** feature. Seerr discovers media on your friends' remote libraries (Plex, Emby, Jellyfin). When you request something from a friend, Seerr hands the download job to Friendarr. Friendarr pulls the file from the remote server and places it into your local media library.

**[Read the full documentation →](https://friendarr.download/)**

## Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/chaosloth/friendarr/main/docs/screenshots/queue.png" alt="Queue Dashboard" width="400">
  <img src="https://raw.githubusercontent.com/chaosloth/friendarr/main/docs/screenshots/settings.png" alt="Settings" width="400">
  <br/>
  <img src="https://raw.githubusercontent.com/chaosloth/friendarr/main/docs/screenshots/logs.png" alt="Logs" width="400">
</p>

## Quick Start

### Docker

```bash
docker pull conno/friendarr:latest
docker run -d \
  -p 5056:5056 \
  -v /path/to/your/downloads:/downloads:rw \
  -v ./config:/app/config \
  conno/friendarr:latest
```

On first launch, the **setup wizard** creates your master API key and persists it to the `config/` directory. To pre-configure a key instead, add:

```bash
  -e API_KEY=your-master-key-here \
```

### Manual

```bash
git clone https://github.com/chaosloth/friendarr.git
cd friendarr
pnpm install
cp .env.example .env
# edit .env with your settings (API_KEY optional — the wizard can create one)
pnpm build
pnpm start
```

Open **http://localhost:5056** and enter your master API key.

**Persistence**: All state — master API key, API keys, settings, schedules, webhooks, the download queue, and logs — are persisted to the `config/` directory. Mount it as a Docker volume to retain everything across image pulls and container rebuilds.

## Documentation

Full documentation with configuration, API reference, file placement, and source setup: **[friendarr.download](https://friendarr.download/)**

## Development

```bash
pnpm install
pnpm dev        # watch mode: auto-recompile + restart
pnpm typecheck  # TypeScript check without emitting
pnpm lint       # ESLint
pnpm format     # Prettier
```

See the [documentation](https://friendarr.download/) for the full architecture overview and contributing guide.

## License

[MIT](./LICENSE)
