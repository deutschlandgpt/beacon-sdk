# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript SDK for the Beacon status page API. Provides a type-safe client for interacting with changelogs, monitors, incidents, feedback, and subscriber management.

## Development Commands

```bash
# Install dependencies
pnpm install

# Build the SDK (outputs to dist/ as both ESM and CJS)
pnpm build

# Run all tests
pnpm test

# Run a single test file (vitest run accepts a path/pattern)
pnpm test test/changelogs.test.ts

# Type check without emitting files
pnpm typecheck

# Format all files / check formatting (Prettier, config: @deutschlandgpt/prettier-config)
pnpm format
pnpm format:check
```

There is no separate lint step — Prettier (`format:check`) plus `typecheck` cover static checking.

### CI Checks

PRs targeting `master` must pass the `static-checks` workflow (`.github/workflows/static-checks.yml`), which runs, in order: `pnpm format:check`, `pnpm typecheck`, `pnpm test`, and `pnpm audit --audit-level=critical`. Run these locally before pushing.

## Architecture

### Resource-Based Design

The SDK follows a resource-based architecture where each API domain (changelogs, monitors, incidents, etc.) is implemented as a separate resource class:

- **BeaconClient** (`src/client.ts`): Main client class that handles HTTP requests, authentication, and error handling. Resource classes are instantiated as properties on this client.
- **Resources** (`src/resources/`): Each resource class (Changelogs, Monitors, Incidents, Subscribers, Feedback) accepts the BeaconClient in its constructor and delegates HTTP requests to `client.request()`.

### Request Flow

1. User calls a method on a resource (e.g., `beacon.changelogs.list()`)
2. Resource method calls `this.client.request<T>(method, path, options)`
3. BeaconClient.request() handles:
   - URL construction with query parameters
   - Authentication headers (x-api-key) if `auth: true` in options
   - Body serialization (JSON or FormData)
   - Response parsing
   - Error mapping to typed error classes

**Exception — URL builders:** Some resource methods return a URL string instead of performing a fetch. `Changelogs.rssUrl(locale?)` uses `client.buildUrl(path)` to construct an RSS feed URL without an HTTP request. When adding URL-returning helpers, use `buildUrl()` rather than `request()`.

**Authenticated endpoints:** Pass `auth: true` in request options to attach the `x-api-key` header; this throws `BeaconAuthError` if no `apiKey` was configured. Public methods (e.g. `feedback.submitPublic()`, `changelogs.list()`) omit it. `FormData` bodies (file attachments) are sent via the `formData` option, which skips JSON serialization and the `content-type` header.

### Error Handling

All API errors extend `BeaconError` (`src/errors.ts`) with a typed hierarchy:

- **BeaconValidationError** (400): Includes `details` property for validation errors
- **BeaconAuthError** (401): Authentication failures
- **BeaconNotFoundError** (404): Resource not found
- **BeaconError**: Base class for all other HTTP errors

Errors are thrown from `BeaconClient.request()` based on response status codes.

### Type Definitions

All types are centralized in `src/types.ts`:

- **Response Models**: TypeScript interfaces for API responses (Changelog, Monitor, Incident, etc.)
- **Param Types**: Interfaces for method parameters (ChangelogListParams, SubmitFeedbackParams, etc.)
- **Enums**: String literal unions for status values, tags, etc.

### Testing

Tests use Vitest with custom helpers (`test/helpers.ts`):

- `mockFetch()`: Creates a mock fetch function for testing
- `jsonResponse()`: Creates a Response object with JSON body
- `createClient()`: Factory function for creating test BeaconClient instances

Each resource has a corresponding test file (e.g., `test/changelogs.test.ts`).

## Build Output

The build process (tsup) generates:

- `dist/index.js` - ESM module
- `dist/index.cjs` - CommonJS module
- `dist/index.d.ts` - TypeScript declarations for ESM
- `dist/index.d.cts` - TypeScript declarations for CJS
- Source maps for all outputs

## Releasing

Releases are **tag-driven**, not driven by the committed `package.json` version. The publish workflow (`.github/workflows/publish.yml`) runs on pushing a tag matching `*.*.*` whose base branch is `master`/`main`:

1. It extracts the version from the git tag (the tag _is_ the version).
2. It runs `npm version <tag> --no-git-tag-version`, which overwrites the `version` field in `package.json` at CI time.
3. It builds and publishes that version to npm.

Because CI overwrites the version, **you do not need to manually bump `version` in `package.json`** — the committed value is ignored at publish time and will drift from published versions. To cut a release, tag a commit on `master` and push the tag:

```bash
git tag 0.1.0
git push origin 0.1.0
```

## Adding New Resources

To add a new API resource:

1. Create a new class in `src/resources/[name].ts` that accepts BeaconClient in constructor
2. Add the resource as a property in BeaconClient constructor (`src/client.ts`)
3. Define types in `src/types.ts`
4. Export types and classes from `src/index.ts`
5. Create corresponding test file in `test/[name].test.ts`
