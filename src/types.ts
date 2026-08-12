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

export type FeedbackType = 'bug_report' | 'feature_request' | 'improvement' | 'support' | 'other';

export type FeedbackStatus =
  | 'new'
  | 'investigating'
  | 'in_progress'
  | 'waiting_for_user'
  | 'planned'
  | 'resolved'
  | 'wont_fix';

export type FeedbackUrgency = 'critical' | 'high' | 'medium' | 'low';

/**
 * Where the reporter's organisation stands commercially. `'customer'` means they
 * have paid; the trial values mean they are still evaluating. Absent/null on a
 * feedback record means "not stated" — NOT "paying customer".
 */
export type FeedbackReporterStage = 'customer' | 'trial_business' | 'trial_enterprise';

export type FeedbackMessageSender = 'user' | 'admin';

export type EmailSubscriptionType = 'changelogs' | 'status_updates' | 'newsletters';

export type Locale = 'en' | 'de';

// ── Response Models ─────────────────────────────────────────────────

export interface Changelog {
  id: string;
  title: string;
  content: string;
  headerImage: string | null;
  version: string;
  status: ChangelogStatus;
  versionType: VersionType;
  tags: ChangelogTag[];
  isBreakingChange: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorDailySummary {
  date: string;
  status: MonitorStatus;
  totalChecks: number;
  operationalChecks: number;
  degradedChecks: number;
  outageChecks: number;
  avgResponseTimeMs: number;
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
  uptimePercent: string | null;
  dailySummaries: MonitorDailySummary[];
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
  sentryIssueId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  urgency: FeedbackUrgency | null;
  userEmail: string | null;
  userName: string | null;
  featureOrService: string | null;
  planTier: string | null;
  reporterStage: FeedbackReporterStage | null;
  reporterTrialEndsAt: string | null;
  browserInfo: string | null;
  deviceInfo: string | null;
  pageUrl: string | null;
  parentFeedbackId: string | null;
  assigneeId: string | null;
  jiraIssueKey: string | null;
  jiraIssueUrl: string | null;
  publicToken: string | null;
  tags: Record<string, string> | null;
  resolvedAt: string | null;
  resolutionEmailSent: boolean;
  consentToNotify: boolean;
  deletedAt: string | null;
  statusChangedAt: string | null;
  lastUserMessageAt: string | null;
  autoClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SimilarFeedback = Feedback & { similarity: number };

export interface SubmitFeedbackResponse {
  feedback: Feedback;
  similar: SimilarFeedback[];
}

export interface SubmitPublicFeedbackResponse {
  success: boolean;
}

export interface FeedbackMessage {
  id: string;
  feedbackId: string;
  sender: FeedbackMessageSender;
  authorUserId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  body: string;
  isDraft: boolean;
  draftSource: string | null;
  createdAt: string;
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

/** The fields accepted by BOTH the authenticated and the public submit endpoints. */
export interface FeedbackParamsBase {
  type: FeedbackType;
  title: string;
  description: string;
  userEmail?: string;
  userName?: string;
  featureOrService?: string;
  planTier?: string;
  browserInfo?: string;
  deviceInfo?: string;
  pageUrl?: string;
  consentToNotify?: boolean;
  tags?: Record<string, string>;
  attachments?: File[];
}

export interface SubmitFeedbackParams extends FeedbackParamsBase {
  /**
   * Commercial stage of the reporter's organisation, so support can prioritise a
   * ticket from a customer who is still evaluating us.
   *
   * AUTHENTICATED ONLY. This lives here and not on `FeedbackParamsBase` because
   * `submitPublic()` posts to an unauthenticated endpoint where Beacon strips the
   * field server-side — anyone could otherwise claim trial priority for their own
   * ticket. Advertising it on the public params type would make it a silent no-op.
   */
  reporterStage?: FeedbackReporterStage;
  /**
   * When the reporter's trial ends, ISO 8601. A snapshot at report time, not a live
   * fact. Only meaningful alongside a trial `reporterStage`. Authenticated only,
   * for the same reason.
   */
  reporterTrialEndsAt?: string;
}

export interface SubmitPublicFeedbackParams extends Omit<FeedbackParamsBase, 'userEmail'> {
  userEmail: string;
}

export interface SendFeedbackMessageParams {
  token: string;
  body: string;
}

// ── Client Config ───────────────────────────────────────────────────

export interface BeaconClientConfig {
  baseUrl: string;
  apiKey?: string;
  fetch?: typeof globalThis.fetch;
}
