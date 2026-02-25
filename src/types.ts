// ── Enums ───────────────────────────────────────────────────────────

export interface ChangelogTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type ChangelogStatus = 'draft' | 'published' | 'archived';

export type VersionType = 'major' | 'minor' | 'patch';

export type MonitorStatus = 'operational' | 'degraded' | 'outage';

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export type IncidentSeverity = 'minor' | 'major' | 'critical';

export type FeedbackType = 'bug_report' | 'feature_request' | 'improvement' | 'other';

export type FeedbackStatus = 'new' | 'investigating' | 'planned' | 'resolved' | 'wont_fix';

export type EmailSubscriptionType = 'changelogs' | 'status_updates' | 'newsletters';

export type Locale = 'en' | 'de';

// ── Response Models ─────────────────────────────────────────────────

export interface Changelog {
  id: string;
  title: string;
  content: string;
  version: string;
  status: ChangelogStatus;
  versionType: VersionType;
  tags: ChangelogTag[];
  isBreakingChange: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorCheckSummary {
  status: MonitorStatus;
  checkedAt: string;
  responseTime: number;
}

export interface MonitorStatusEntry {
  id: string;
  name: string;
  description: string | null;
  url: string;
  group: string;
  currentStatus: MonitorStatus | 'unknown';
  responseTime: number;
  statusCode: number | null;
  lastChecked: string | null;
  history: MonitorCheckSummary[];
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  published: boolean;
  resolvedAt: string | null;
  affectedMonitorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  userEmail: string | null;
  userName: string | null;
  featureOrService: string | null;
  planTier: string | null;
  browserInfo: string | null;
  deviceInfo: string | null;
  parentFeedbackId: string | null;
  resolvedAt: string | null;
  resolutionEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SimilarFeedback {
  id: string;
  title: string;
  description: string;
  type: FeedbackType;
  status: FeedbackStatus;
}

export interface SubmitFeedbackResponse {
  feedback: Feedback;
  similar: SimilarFeedback[];
}

export interface SubscribeResponse {
  success: boolean;
}

// ── Param Types ─────────────────────────────────────────────────────

export interface ChangelogListParams {
  tag?: string;
  since?: string;
  breaking?: boolean;
  limit?: number;
  offset?: number;
  locale?: Locale;
}

export interface ChangelogGetParams {
  locale?: Locale;
}

export interface SubscribeParams {
  email: string;
  subscribeTo: EmailSubscriptionType[];
}

export interface SubmitFeedbackParams {
  type: FeedbackType;
  title: string;
  description: string;
  userEmail?: string;
  userName?: string;
  featureOrService?: string;
  planTier?: string;
  browserInfo?: string;
  deviceInfo?: string;
  attachments?: File[];
}

// ── Client Config ───────────────────────────────────────────────────

export interface BeaconClientConfig {
  baseUrl: string;
  apiKey?: string;
  fetch?: typeof globalThis.fetch;
}
