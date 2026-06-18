import type { BeaconClient } from '../client';
import type {
  FeedbackMessage,
  SendFeedbackMessageParams,
  SubmitFeedbackParams,
  SubmitFeedbackResponse,
  SubmitPublicFeedbackResponse,
} from '../types';

function buildFeedbackFormData(params: SubmitFeedbackParams): FormData {
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
    return this.client.request<SubmitFeedbackResponse>('POST', '/api/v1/feedback', {
      formData: buildFeedbackFormData(params),
      auth: true,
    });
  }

  async submitPublic(params: SubmitFeedbackParams): Promise<SubmitPublicFeedbackResponse> {
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
