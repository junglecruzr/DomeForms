/**
 * Submission and analytics types
 */

import type { UUID, ISODateString } from './base.js';
import type { FieldValue } from './field.js';

export interface User {
  id: UUID;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Submission {
  id: UUID;
  formId: UUID;
  formVersion: number;
  data: Record<string, FieldValue>;
  metadata: SubmissionMetadata;
  status: SubmissionStatus;
  paymentStatus?: PaymentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  completedAt?: ISODateString;
}

export interface SubmissionMetadata {
  ip?: string;
  userAgent?: string;
  referrer?: string;
  utm?: UTMTags;
  duration?: number;
  pageViews?: number;
  incomplete?: boolean;
  language?: string;
  timezone?: string;
}

export interface UTMTags {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export type SubmissionStatus = 'pending' | 'completed' | 'failed' | 'spam' | 'archived';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';

// Analytics
export type AnalyticsPeriod = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

export interface FormAnalytics {
  formId: UUID;
  period: AnalyticsPeriod;
  views: number;
  starts: number;
  submissions: number;
  completionRate: number;
  averageDuration: number;
  fieldAnalytics: FieldAnalytics[];
  stepAnalytics?: StepAnalytics[];
  deviceBreakdown: DeviceBreakdown;
  browserBreakdown: BrowserBreakdown;
  sourceBreakdown: SourceBreakdown;
}

export interface FieldAnalytics {
  fieldId: UUID;
  fieldName: string;
  fieldType: string;
  totalResponses: number;
  uniqueResponses: number;
  skipRate: number;
  errorRate: number;
  distribution?: Record<string, number>;
  numericStats?: NumericStats;
}

export interface NumericStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  sum: number;
  stdDev: number;
}

export interface StepAnalytics {
  stepIndex: number;
  stepName: string;
  views: number;
  completions: number;
  dropOffs: number;
  dropOffRate: number;
  averageDuration: number;
}

export interface DeviceBreakdown {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface BrowserBreakdown {
  chrome: number;
  firefox: number;
  safari: number;
  edge: number;
  other: number;
}

export interface SourceBreakdown {
  direct: number;
  organic: number;
  referral: number;
  social: number;
  email: number;
  paid: number;
  other: number;
}