import type { BeaconClient } from '../client';
import type { SubmitFeedbackParams, SubmitFeedbackResponse } from '../types';

export class Feedback {
  constructor(private readonly client: BeaconClient) {}

  async submit(params: SubmitFeedbackParams): Promise<SubmitFeedbackResponse> {
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

    if (params.attachments) {
      for (const file of params.attachments) {
        formData.append('attachments', file);
      }
    }

    return this.client.request<SubmitFeedbackResponse>('POST', '/api/v1/feedback', {
      formData,
      auth: true,
    });
  }
}
