---
layout: home

hero:
  name: Friendarr
  text: Downloading Service for Friend Libraries
  tagline: Fetches media from remote Plex, Emby, and Jellyfin instances — the companion to Seerr's Friend Libraries feature.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/overview

features:
  - title: Multi-Source Support
    details: Downloads from Plex, Emby, and Jellyfin servers with automatic source-specific authentication.
  - title: Two-Stage Downloads
    details: Files download to an incomplete directory first, then hard-link to the completed path — atomic and safe.
  - title: Webhook Notifications
    details: "HMAC-SHA256 signed webhooks for download events — requested, started, complete, and failed."
  - title: Schedule Gating
    details: Configure time windows per day of week to restrict when downloads can run.
  - title: Seerr Integration
    details: Designed as Seerr's companion. Seerr sends download requests, Friendarr handles the transfer.
  - title: Seerr-Styled Web UI
    details: Dark-themed dashboard for managing the queue, API keys, source endpoints, webhooks, and schedules.
---

## Architecture

Friendarr is a standalone Express microservice that receives download requests from Seerr (or any HTTP client), connects to the remote media server, downloads the file, and places it in the correct library directory.

```mermaid
graph LR
    A[Seerr] -->|POST /api/v1/download| B[Friendarr :5056]
    B -->|Plex / Emby / Jellyfin| C[Remote Media Server]
    B -->|Write file| D[Media Library]
     B -->|Webhook| E[External Services]
```

## Screenshots

<div class="screenshots-grid">
  <div>
    <img src="/screenshots/wizard-step1.png" alt="Setup Wizard - Language">
    <p><strong>Setup Wizard</strong> — language selection on first launch</p>
  </div>
  <div>
    <img src="/screenshots/queue.png" alt="Queue Dashboard">
    <p><strong>Queue Dashboard</strong> — monitor and manage downloads</p>
  </div>
  <div>
    <img src="/screenshots/settings.png" alt="Settings">
    <p><strong>Settings</strong> — configure sources, schedules, and paths</p>
  </div>
  <div>
    <img src="/screenshots/logs.png" alt="Logs">
    <p><strong>Logs Viewer</strong> — real-time server log tail</p>
  </div>
</div>

## Quick Start

```bash
# Clone and install
git clone https://github.com/chaosloth/friendarr.git
cd friendarr
pnpm install

# Configure
cp .env.example .env
# Edit .env — set API_KEY to a secure random string

# Build and run
pnpm build
pnpm start
```

Open **http://localhost:5056** and enter your master API key to access the dashboard.

## Docker

```bash
docker run -d \
  -p 5056:5056 \
  -e API_KEY=your-master-key \
  -e COMPLETED_PATH=/downloads/complete \
  -e INCOMPLETE_PATH=/downloads/incomplete \
  -v /path/to/downloads:/downloads:rw \
  -v ./config:/app/config \
  conno/friendarr:latest
```
