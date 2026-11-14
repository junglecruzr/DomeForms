/**
 * Form settings schema
 */

import { z } from 'zod';
import { isoDateSchema } from './base.js';

export const formSettingsSchema = z.object({
  submitAction: z.enum(['message', 'redirect', 'none']).default('message'),
  successMessage: z.string().optional(),
  redirectUrl: z.string().url().optional(),
  redirectDelay: z.number().int().min(0).optional(),
  honeypotEnabled: z.boolean().default(true),
  honeypotFieldName: z.string().optional(),
  recaptchaEnabled: z.boolean().default(false),
  recaptchaSiteKey: z.string().optional(),
  recaptchaAction: z.string().optional(),
  turnstileEnabled: z.boolean().default(false),
  turnstileSiteKey: z.string().optional(),
  submissionLimit: z.number().int().min(1).optional(),
  submissionLimitPeriod: z.enum(['day', 'week', 'month', 'total']).optional(),
  submissionLimitMessage: z.string().optional(),
  openAt: isoDateSchema.optional(),
  closeAt: isoDateSchema.optional(),
  closedMessage: z.string().optional(),
  showProgressBar: z.boolean().default(true),
  showStepNumbers: z.boolean().default(true),
  enableKeyboardNavigation: z.boolean().default(true),
  autoFocusFirstField: z.boolean().default(true),
  scrollToTopOnStepChange: z.boolean().default(true),
  saveIncomplete: z.boolean().default(true),
  incompleteExpiryDays: z.number().int().min(1).optional(),
  disableBrowserAutocomplete: z.boolean().default(false),
  sanitizeHtml: z.boolean().default(true),
  notifyOnSubmission: z.boolean().default(false),
  notificationEmails: z.array(z.string().email()).default([]),
});