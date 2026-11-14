/**
 * Form definition types
 */

import type { UUID, ISODateString, CSSColor, CSSSize } from './base.js';
import type { FormPage } from './layout.js';
import type { ConditionalLogicRule } from './logic.js';
import type { IntegrationConfig } from './integration.js';

export interface FormSettings {
  submitAction: 'message' | 'redirect' | 'none';
  successMessage?: string;
  redirectUrl?: string;
  redirectDelay?: number;
  honeypotEnabled: boolean;
  honeypotFieldName?: string;
  recaptchaEnabled: boolean;
  recaptchaSiteKey?: string;
  recaptchaAction?: string;
  turnstileEnabled: boolean;
  turnstileSiteKey?: string;
  submissionLimit?: number;
  submissionLimitPeriod?: 'day' | 'week' | 'month' | 'total';
  submissionLimitMessage?: string;
  openAt?: ISODateString;
  closeAt?: ISODateString;
  closedMessage?: string;
  showProgressBar: boolean;
  showStepNumbers: boolean;
  enableKeyboardNavigation: boolean;
  autoFocusFirstField: boolean;
  scrollToTopOnStepChange: boolean;
  saveIncomplete: boolean;
  incompleteExpiryDays?: number;
  disableBrowserAutocomplete: boolean;
  sanitizeHtml: boolean;
  notifyOnSubmission: boolean;
  notificationEmails: string[];
}

export const defaultFormSettings: FormSettings = {
  submitAction: 'message',
  successMessage: 'Thank you! Your submission has been received.',
  honeypotEnabled: true,
  honeypotFieldName: 'website_url',
  recaptchaEnabled: false,
  turnstileEnabled: false,
  showProgressBar: true,
  showStepNumbers: true,
  enableKeyboardNavigation: true,
  autoFocusFirstField: true,
  scrollToTopOnStepChange: true,
  saveIncomplete: true,
  incompleteExpiryDays: 30,
  disableBrowserAutocomplete: false,
  sanitizeHtml: true,
  notifyOnSubmission: false,
  notificationEmails: [],
};

export interface FormDefinition {
  id: UUID;
  version: number;
  name: string;
  description?: string;
  settings: FormSettings;
  themeId?: UUID;
  pages: FormPage[];
  logic: ConditionalLogicRule[];
  integrations: IntegrationConfig[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  publishedAt?: ISODateString;
}