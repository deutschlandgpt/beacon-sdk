import type { BeaconClient } from '../client';
import type {
  FeedbackMessage,
  FeedbackParamsBase,
  SendFeedbackMessageParams,
  SubmitFeedbackParams,
  SubmitFeedbackResponse,
  SubmitPublicFeedbackParams,
  SubmitPublicFeedbackResponse,
} from '../types';

// Takes the BASE params on purpose, not SubmitFeedbackParams: this builder is
// shared with the unauthenticated submitPublic(), so it must not be able to read —
// let alone emit — the authenticated-only fields. Those are set in submit() below.
function buildFeedbackFormData(params: FeedbackParamsBase): FormData {
  const formData = new FormData();

  formData.set('type', params.type);
  formData.set('title', params.title);
  formData.set('description', params.description);

  if (params.userEmail !== undefined) formData.set('userEmail', params.userEmail);
  if (params.userName !== undefined) formData.set('userName', params.userName);
  if (params.featureOrService !== undefined)
    formData.set('featureOrService', params.featureOrService);
  if (params.planTier !== undefined) formData.set('planTier', params.planTier);
  if (params.browserInfo !== undefined) formData.set('browserInfo', params.browserInfo);
  if (params.deviceInfo !== undefined) formData.set('deviceInfo', params.deviceInfo);
  if (params.pageUrl !== undefined) formData.set('pageUrl', params.pageUrl);
  if (params.consentToNotify !== undefined)
    formData.set('consentToNotify', String(params.consentToNotify));
  if (params.tags !== undefined) formData.set('tags', JSON.stringify(params.tags));

  if (params.attachments) {
    for (const file of params.attachments) {
      formData.append('attachments', file);
    }
  }

  return formData;
}

export class Feedback {
  constructor(private readonly client: BeaconClient) {}

  async submit(params: SubmitFeedbackParams): Promise<SubmitFeedbackResponse> {
    const formData = buildFeedbackFormData(params);

    // Authenticated-only fields, set here rather than in the shared builder so
    // submitPublic() physically cannot emit them (the builder's param type does
    // not have them, and `tsc` is a CI gate). Beacon strips them on the public
    // endpoint anyway; this keeps the SDK from advertising a silent no-op.
    if (params.reporterStage !== undefined) formData.set('reporterStage', params.reporterStage);
    if (params.reporterTrialEndsAt !== undefined)
      formData.set('reporterTrialEndsAt', params.reporterTrialEndsAt);

    return this.client.request<SubmitFeedbackResponse>('POST', '/api/v1/feedback', {
      formData,
      auth: true,
    });
  }

  async submitPublic(params: SubmitPublicFeedbackParams): Promise<SubmitPublicFeedbackResponse> {
    return this.client.request<SubmitPublicFeedbackResponse>('POST', '/api/v1/public-feedback', {
      formData: buildFeedbackFormData(params),
    });
  }

  async messages(token: string): Promise<FeedbackMessage[]> {
    return this.client.request<FeedbackMessage[]>('GET', '/api/v1/public-feedback/messages', {
      query: { token },
    });
  }

  async sendMessage(params: SendFeedbackMessageParams): Promise<FeedbackMessage> {
    return this.client.request<FeedbackMessage>('POST', '/api/v1/public-feedback/messages', {
      body: params,
    });
  }
}
