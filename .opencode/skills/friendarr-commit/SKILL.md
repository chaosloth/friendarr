---
name: friendarr-commit
description: Use ONLY when committing code changes to the Friendarr git repository. Ensures Conventional Commits format, meaningful messages, and proper pre-commit verification (no husky hooks exist, so checks run manually).
---

# Friendarr Commit Workflow

## Commit message format

Friendarr follows Conventional Commits. Every commit message MUST use:

```
type(scope): description
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`

**Scope**: The area affected (e.g., `api`, `ui`, `queue`, `sources`, `docker`, `settings`, `auth`). Use the directory or feature name.

**Description**: Lowercase, imperative mood ("add", not "added"). No period at the end.

### Examples

```
feat(ui): add queue and settings web dashboard
fix(api): handle missing master key gracefully
chore(docker): add multi-stage production Dockerfile
feat(settings): add schedule gating for downloads
```

## No Git Hooks

This repo has **no husky hooks** installed. There is no automatic lint-staged or commitlint enforcement. Verification must be run manually before every commit.

## Commit workflow

1. **Verify nothing is broken**: Run all checks BEFORE staging.

   ```bash
   pnpm typecheck && pnpm lint && pnpm format
   ```

   Fix every error before proceeding. **Do not skip this step.**

2. **Build succeeds**:

   ```bash
   pnpm build
   ```

3. **Stage only intended files**: `git add <specific files>` — avoid `git add -A` or `git add .`

4. **Verify what's staged**:

   ```bash
   git diff --cached --stat
   ```

5. **No secrets**: Never commit `.env` files, API keys, or credentials

6. **No unrelated changes**: Only files relevant to the change

7. **Write the commit**:

   ```bash
   git commit -m "type(scope): description"
   ```

8. **Verify the commit**:
   ```bash
   git log --oneline -1
   ```

## Multi-phase feature commits

When working on a feature with multiple phases, commit after each completed phase. Write commits that describe what was built, not a step-by-step log. Group related changes into logical units.

### Phase-appropriate commit messages

```
feat(ui): add Seerr-styled sidebar layout and auth modal
feat(api): add queue management endpoints (pause, resume, cancel, clear)
feat(settings): add runtime settings store with schedule support
feat(docker): add production Dockerfile and compose stack
```

## What NOT to commit

- `.env` files
- `dist/` build output
- `node_modules/`
- Editor temp files (`*.swp`, `*~`, `.DS_Store`)
- `.opencode/` internal files (unless intentionally adding skills/plans)

## Checking git status

Always run before committing:

```bash
git status
git diff --cached --stat
```

If `git status` shows unexpected files, unstage them with `git restore --staged <file>`.
