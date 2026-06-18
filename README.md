# Beacon SDK

TypeScript SDK for the Beacon status page API. Interact with changelogs, monitors, incidents, and more.

## Installation

```bash
pnpm add @deutschlandgpt/beacon-sdk
```

## Requirements

- Node.js 18 or higher
- TypeScript 5.0+ (for TypeScript projects)

## Quick Start

```typescript
import { BeaconClient } from "@deutschlandgpt/beacon-sdk";

// Initialize the client
const beacon = new BeaconClient({
  baseUrl: "https://your-beacon-instance.com",
  apiKey: "your-api-key", // Optional, required for authenticated endpoints
});

// Fetch changelogs
const changelogs = await beacon.changelogs.list();
console.log(changelogs);
```

## Configuration

The `BeaconClient` accepts the following configuration options:

```typescript
const beacon = new BeaconClient({
  baseUrl: string;        // Your Beacon instance URL (required)
  apiKey?: string;        // API key for authenticated endpoints (optional)
  fetch?: typeof fetch;   // Custom fetch implementation (optional)
});
```

## API Reference

### Changelogs

List and retrieve changelogs from your Beacon instance.

```typescript
// List all changelogs
const changelogs = await beacon.changelogs.list();

// List with filters
const filtered = await beacon.changelogs.list({
  tag: "api", // Filter by tag: 'api' | 'chat' | 'workflows'
  since: "2024-01-01", // Only changelogs after this date
  breaking: true, // Only breaking changes
  limit: 10, // Limit results
  offset: 0, // Pagination offset
});

// Get a specific changelog by ID
const changelog = await beacon.changelogs.get("changelog-id");
```

### Monitors

Check the status of monitored services.

```typescript
// Get status of all monitors
const monitors = await beacon.monitors.status();

// Each monitor includes:
// - id, name, description
// - currentStatus: 'operational' | 'degraded' | 'outage' | 'unknown'
// - responseTime, statusCode, lastChecked
// - uptimePercent: 90-day uptime as a string (e.g. "99.95"), or null
// - dailySummaries: per-day check summaries (up to 90 days)
```

### Incidents

Retrieve incident information.

```typescript
// List all incidents
const incidents = await beacon.incidents.list();

// Get active incidents (requires API key)
const activeIncidents = await beacon.incidents.active();

// Incident properties include:
// - status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
// - severity: 'minor' | 'major' | 'critical'
// - affectedMonitorIds: array of affected monitor IDs
```

### Subscribers

Manage email subscriptions.

```typescript
// Subscribe to updates
const response = await beacon.subscribers.subscribe({
  email: "user@example.com",
  subscribeTo: ["changelogs", "status_updates", "newsletters"],
});

// Subscription types:
// - 'changelogs': Product changelog updates
// - 'status_updates': Service status updates
// - 'newsletters': General newsletters
```

### Feedback

Submit user feedback. `submit()` requires an API key and returns the created
feedback plus similar existing feedback; `submitPublic()` is unauthenticated
(for public/embedded forms) and returns `{ success: true }`.

```typescript
// Submit feedback (requires API key)
const result = await beacon.feedback.submit({
  type: "bug_report", // 'bug_report' | 'feature_request' | 'improvement' | 'support' | 'other'
  title: "Issue with login",
  description: "Detailed description of the issue",

  // Optional fields
  userEmail: "user@example.com",
  userName: "John Doe",
  featureOrService: "Authentication",
  planTier: "Pro",
  browserInfo: navigator.userAgent,
  deviceInfo: "Desktop",
  consentToNotify: true,
  tags: { source: "widget", region: "eu" }, // Arbitrary key/value metadata
  attachments: [file1, file2], // Array of File objects
});

// Response includes the created feedback and similar existing feedback
console.log(result.feedback);
console.log(result.similar);

// Submit feedback from a public form (no API key required)
await beacon.feedback.submitPublic({
  type: "feature_request",
  title: "Add dark mode",
  description: "Please add a dark theme",
  userEmail: "user@example.com",
});
```

When feedback is submitted with a `userEmail`, the user can follow up through a
public conversation thread identified by the feedback's `publicToken`:

```typescript
// Fetch the message thread for a feedback item
const messages = await beacon.feedback.messages("public-token");

// Post a user reply to the thread
const message = await beacon.feedback.sendMessage({
  token: "public-token",
  body: "Any update on this?",
});
```

## Error Handling

The SDK provides typed error classes for different error scenarios:

```typescript
import {
  BeaconError,
  BeaconValidationError,
  BeaconAuthError,
  BeaconNotFoundError,
} from "@deutschlandgpt/beacon-sdk";

try {
  const changelogs = await beacon.changelogs.list();
} catch (error) {
  if (error instanceof BeaconAuthError) {
    console.error("Authentication failed:", error.message);
  } else if (error instanceof BeaconNotFoundError) {
    console.error("Resource not found:", error.message);
  } else if (error instanceof BeaconValidationError) {
    console.error("Validation error:", error.message);
    console.error("Details:", error.details);
  } else if (error instanceof BeaconError) {
    console.error("API error:", error.message);
    console.error("Status:", error.status);
  }
}
```

### Error Types

- `BeaconError`: Base error class for all SDK errors
- `BeaconValidationError`: Validation errors (400 status)
- `BeaconAuthError`: Authentication errors (401 status)
- `BeaconNotFoundError`: Resource not found errors (404 status)

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions. All API responses and parameters are typed:

```typescript
import type {
  Changelog,
  MonitorStatusEntry,
  Incident,
  Feedback,
  ChangelogListParams,
  SubmitFeedbackParams,
} from "@deutschlandgpt/beacon-sdk";

// Types are automatically inferred
const changelogs: Changelog[] = await beacon.changelogs.list();
const monitor: MonitorStatusEntry = monitors[0];
```

## Examples

### Displaying System Status

```typescript
const monitors = await beacon.monitors.status();
const activeIncidents = await beacon.incidents.list();

monitors.forEach((monitor) => {
  console.log(`${monitor.name}: ${monitor.currentStatus}`);
  console.log(`Response time: ${monitor.responseTime}ms`);
});

if (activeIncidents.length > 0) {
  console.log("\nActive Incidents:");
  activeIncidents.forEach((incident) => {
    console.log(`[${incident.severity}] ${incident.title}`);
    console.log(`Status: ${incident.status}`);
  });
}
```

### Fetching Recent Changelogs

```typescript
const recentChanges = await beacon.changelogs.list({
  limit: 5,
  since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
});

recentChanges.forEach((changelog) => {
  console.log(`v${changelog.version} - ${changelog.title}`);
  console.log(changelog.content);
  console.log(`Tags: ${changelog.tags.join(", ")}`);
  if (changelog.isBreakingChange) {
    console.log("⚠️ Breaking Change");
  }
});
```

### User Feedback Collection

```typescript
// Collect feedback with file attachments
const fileInput = document.querySelector<HTMLInputElement>("#file-input");
const files = Array.from(fileInput?.files ?? []);

const feedback = await beacon.feedback.submit({
  type: "bug_report",
  title: "Cannot upload files",
  description: "Getting an error when uploading files larger than 10MB",
  userEmail: "user@example.com",
  featureOrService: "File Upload",
  attachments: files,
});

console.log("Feedback submitted:", feedback.feedback.id);

if (feedback.similar.length > 0) {
  console.log("Similar feedback found:");
  feedback.similar.forEach((item) => {
    console.log(`- ${item.title} (${item.status})`);
  });
}
```

## Releasing

Publishing is driven by git tags, not by the `version` field in `package.json`. Pushing a tag like `0.1.0` from a commit on `master` triggers the publish workflow, which derives the published version from the tag and overwrites `package.json` at build time. Manually bumping the version in `package.json` has no effect on what gets published.

```bash
git tag 0.1.0
git push origin 0.1.0
```

## License

MIT

## Author

Titanom
