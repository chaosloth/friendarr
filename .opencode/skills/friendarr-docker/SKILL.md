---
name: friendarr-docker
description: Use ONLY when building, testing, or deploying Friendarr Docker images. Covers the multi-stage production Dockerfile, dev compose stack, local image smoke-testing, and pushing to Docker Hub (`conno/friendarr`). Do not use for generic Docker advice.
---

# Friendarr Docker Build & Deploy

## Dockerfiles

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage production build (Alpine). Compiles TypeScript, outputs minimal image with `dist/` only. |
| `Dockerfile.local` | Development image. Mounts source for hot-reload via `pnpm dev`. Used by `compose.yaml`. |

## Compose stack (development)

Start the dev stack with hot-reload:

```bash
docker compose up -d
```

Mounts the project root as a volume. Source changes trigger `tsc --watch` + `node --watch` restarts. The `node_modules/` and `dist/` directories are excluded from the bind mount via anonymous volumes.

Access the UI at `http://localhost:5056` and the API at `http://localhost:5056/api/v1`.

To follow logs:

```bash
docker compose logs -f
```

To stop:

```bash
docker compose down
```

## Building the production image locally

### Standard build (single arch)

```bash
docker build -t friendarr:test -f Dockerfile .
```

With version stamping:

```bash
docker build \
  --build-arg COMMIT_TAG=$(git rev-parse HEAD) \
  -t friendarr:test \
  -f Dockerfile .
```

The `COMMIT_TAG` build arg is stamped into `committag.json` inside the image.

### Multi-arch build

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg COMMIT_TAG=$(git rev-parse HEAD) \
  -t friendarr:test \
  -f Dockerfile .
```

## Smoke-testing the production image

After building, run and verify:

```bash
docker run --rm -p 5056:5056 friendarr:test
```

Wait for the log line `Server ready`, then:

```bash
curl -s http://localhost:5056/health
```

Expected: `{"status":"ok"}`

```bash
curl -s http://localhost:5056/api/v1/health
```

Expected: `{"status":"ok","activeDownloads":0}`

### Test with environment variables

```bash
docker run --rm -p 5056:5056 \
  -e API_KEY=sk-test \
  -e MAX_CONCURRENT_DOWNLOADS=4 \
  -e LIBRARY_BASE_PATH=/data/media \
  friendarr:test
```

### Test with volume mounts for downloads

```bash
docker run --rm -p 5056:5056 \
  -e LIBRARY_BASE_PATH=/media \
  -e TEMP_DIR=/tmp/friendarr \
  -v /path/to/media:/media:rw \
  friendarr:test
```

## Pushing to Docker Hub

The target repository is `conno/friendarr`.

### Local manual push

```bash
pnpm docker:build
pnpm docker:tag
pnpm docker:push
```

Or all at once:

```bash
pnpm docker:release
```

These scripts use the `DOCKER_REPO` env var (defaults to `conno/friendarr`).

### Custom repo

```bash
DOCKER_REPO=myorg/friendarr pnpm docker:release
```

## Verifying the image

After building, check the image:

```bash
# Image size (should be ~150-250 MB)
docker images friendarr:test

# Entrypoint and exposed ports
docker inspect friendarr:test --format '{{.Config.Cmd}} | Ports: {{.Config.ExposedPorts}}'

# Verify dist/ exists (compiled TypeScript)
docker run --rm --entrypoint sh friendarr:test -c "ls dist/index.js && echo 'dist/ OK'"

# Verify UI HTML is included
docker run --rm --entrypoint sh friendarr:test -c "ls dist/ui/index.html && echo 'UI OK'"

# Verify production node_modules only (no dev deps)
docker run --rm --entrypoint sh friendarr:test -c "ls node_modules/.pnpm | grep prettier || echo 'No prettier (good)'"
```

## GitHub Actions (CI/CD)

Two workflows automate Docker builds:

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/ci.yml` | Push to `develop`, PRs | Lint, typecheck, build. On `develop` push: build & push `:develop` tag to Docker Hub. |
| `.github/workflows/release.yml` | Tag push `v*` | Build multi-arch (`amd64` + `arm64`), push `:version`, `:v{major}.{minor}`, `:v{major}`, `:latest` tags to Docker Hub. |

Both workflows require these GitHub secrets:

| Secret | Purpose |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token (not password) |

## Build caching

The production `Dockerfile` uses Docker BuildKit cache mounts for pnpm. To warm the cache for faster rebuilds:

```bash
docker buildx build \
  --build-arg COMMIT_TAG=$(git rev-parse HEAD) \
  -t friendarr:test \
  -f Dockerfile \
  --cache-to type=local,dest=/tmp/docker-cache \
  --cache-from type=local,src=/tmp/docker-cache \
  .
```
