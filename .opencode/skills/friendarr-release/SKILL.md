---
name: friendarr-release
description: Use ONLY when creating a new release of Friendarr. Covers version bumping, git tagging, triggering the Docker Hub release workflow, creating GitHub Releases, and verifying the published image. Do not use for general git or Docker questions.
---

# Friendarr Release Workflow

## Overview

Friendarr releases are triggered by pushing a git tag matching `v*`. The GitHub Actions release workflow (`.github/workflows/release.yml`) builds multi-arch Docker images (linux/amd64 + linux/arm64) and pushes them to Docker Hub at `conno/friendarr`.

On tag push, the workflow:

1. Builds on both `amd64` and `arm64` runners in parallel
2. Merges into a multi-arch manifest in the publish job
3. Pushes semver tags: `v1.0.0`, `v1.0`, `v1`
4. Pushes `:latest` (only for stable releases — not pre-releases)

## Prerequisites

### GitHub Secrets

The release workflow requires these secrets configured in **Repo → Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token (generate at https://hub.docker.com/settings/security) |

### Local auth (for `gh release create`)

```bash
gh auth status
```

If not authenticated, run `gh auth login`.

## Pre-Release Checklist

Before tagging, verify everything passes:

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm build
```

All four must succeed with no errors.

## Version Bumping

Update the `version` field in `package.json`:

```json
{
  "version": "0.2.0"
}
```

Commit the version bump separately from the feature work:

```bash
git add package.json
git commit -m "chore(release): bump version to 0.2.0"
```

## Release Types

### Stable release

Tag format: `v<major>.<minor>.<patch>` (e.g., `v0.1.0`, `v1.0.0`)

Gets all semver tags **plus** `:latest`. This is what most users pull.

### Pre-release

Tag format: `v<major>.<minor>.<patch>-<suffix>` (e.g., `v0.2.0-rc1`, `v0.2.0-beta.2`)

Gets semver tags but **NOT** `:latest`. Users must pull the explicit version tag.

### Patch / hotfix

Tag format: `v<major>.<minor>.<patch>` (e.g., `v0.1.1`)

Same as stable — gets semver tags and `:latest`.

## Tagging & Triggering the Release

### Step 1: Create the tag

```bash
git tag v0.2.0
```

Always tag the commit you want to release (usually `HEAD`).

For an annotated tag with a message:

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
```

### Step 2: Push the tag

```bash
git push origin v0.2.0
```

Pushing the tag triggers `.github/workflows/release.yml`. The workflow runs on the tagged commit, not the branch HEAD.

### Step 3: Push the commit (if not already pushed)

```bash
git push origin develop
```

The tag push alone triggers the release — the branch push is only needed to keep the remote in sync.

### Step 4: Monitor the workflow

Check the Actions tab: `https://github.com/conno/friendarr/actions`

Or watch from the CLI:

```bash
gh run watch
```

If the rebuild warning is shown, run:

```bash
gh run list --workflow="Friendarr Release"
gh run watch <run-id>
```

### What the workflow looks like

| Job | Runners | What it does |
|---|---|---|
| `build` (matrix) | `ubuntu-24.04` + `ubuntu-24.04-arm` | Builds Docker image per arch, populates GitHub Actions cache |
| `publish` | `ubuntu-24.04` | Logs into Docker Hub, builds multi-arch manifest from cache, pushes all tags |

Total run time: ~5-8 minutes (mostly waiting for `pnpm install` on ARM).

## Creating a GitHub Release

After the workflow completes, create a formal GitHub Release with release notes:

```bash
gh release create v0.2.0 \
  --title "v0.2.0" \
  --notes-file /tmp/release-notes.md
```

Or with inline notes:

```bash
gh release create v0.2.0 \
  --title "v0.2.0" \
  --notes "## What's Changed

- feat(ui): add dark mode toggle
- fix(queue): handle cancelled downloads gracefully
- chore(docker): reduce image size"
```

For pre-releases, add `--prerelease`:

```bash
gh release create v0.2.0-rc1 \
  --title "v0.2.0-rc1" \
  --notes "Release candidate for v0.2.0" \
  --prerelease
```

### Generate release notes from commits

To generate notes automatically from commits since the last tag:

```bash
gh release create v0.2.0 \
  --title "v0.2.0" \
  --generate-notes
```

## Verifying the Published Image

Once the publish job completes, verify the image is pullable and functional:

```bash
# Pull the specific version
docker pull conno/friendarr:v0.2.0

# Pull latest (only works for stable releases)
docker pull conno/friendarr:latest

# Smoke test
docker run --rm -p 5056:5056 conno/friendarr:latest
```

Wait for the `Server ready` log line, then:

```bash
curl -s http://localhost:5056/health
```

Expected: `{"status":"ok"}`

```bash
curl -s http://localhost:5056/api/v1/health
```

Expected: `{"status":"ok","activeDownloads":0}`

### Verify tags on Docker Hub

```bash
docker buildx imagetools inspect conno/friendarr:latest
```

Look for `linux/amd64` and `linux/arm64` entries in the manifest. If only one architecture appears, the multi-arch merge may have failed.

## Docker Hub Tags Reference

For a stable tag `v0.2.0`, the following tags are pushed:

| Tag | Example | Notes |
|---|---|---|
| Exact version | `conno/friendarr:v0.2.0` | Always pushed |
| Minor version | `conno/friendarr:v0.2` | Always pushed |
| Major version | `conno/friendarr:v0` | Always pushed |
| Latest stable | `conno/friendarr:latest` | Only for stable (non-pre-release) tags |

## Manual Release (without GitHub Actions)

If the workflow can't be used (e.g., Docker Hub auth issue), build and push manually:

```bash
pnpm docker:release
```

This builds a single-arch image (current platform only) and pushes `:latest`. For a version tag:

```bash
pnpm docker:build
VERSION=$(node -p "require('./package.json').version")
docker tag friendarr:latest conno/friendarr:v$VERSION
docker push conno/friendarr:v$VERSION
docker push conno/friendarr:latest
```

Manual releases won't include ARM images.

## Troubleshooting

### Workflow didn't trigger

- Verify the tag format matches `v*` (must start with `v`)
- Check that the tag was pushed: `git ls-remote --tags origin`
- If the tag exists locally but not remotely, push it: `git push origin v0.2.0`

### Login failed

- Verify `DOCKER_USERNAME` and `DOCKER_TOKEN` secrets exist in the repo
- Confirm the token hasn't expired (check Docker Hub → Account Settings → Security)
- The token must have "Read & Write" permissions

### Multi-arch manifest missing

- Both `build` jobs must complete before `publish` runs
- Check each job's logs for OOM or timeout errors (ARM runner is slower)
- If ARM fails, retry the entire workflow by pushing a new tag (or delete and re-push the same tag)

### Image is broken

- Pull and inspect: `docker run --rm --entrypoint sh conno/friendarr:v0.2.0 -c "ls dist/index.js"`
- Check the build logs for TypeScript compilation errors
- If the smoke test fails, check `COMMIT_TAG` is set in the build args
