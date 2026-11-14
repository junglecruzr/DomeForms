/**
 * Field types and definitions
 */

import type { UUID } from './base.js';
import type { ValidationRule } from './validation.js';
import type { ConditionalLogicRule } from './logic.js';
import type { CalculationConfig } from './calculation.js';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'hidden'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'checkbox-group'
  | 'toggle'
  | 'rating'
  | 'date'
  | 'time'
  | 'datetime'
  | 'daterange'
  | 'file'
  | 'image'
  | 'signature'
  | 'calculation'
  | 'html'
  | 'divider'
  | 'section'
  | 'page-break'
  | 'button'
  | 'recaptcha'
  | 'turnstile';

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
  selected?: boolean;
  showIf?: ConditionalLogicRule[];
}

export interface FieldLayout {
  labelPosition: 'top' | 'left' | 'right' | 'floating' | 'none';
  labelWidth?: number;
  fullWidth: boolean;
  wrapperClass?: string;
  labelClass?: string;
  inputClass?: string;
  errorClass?: string;
}

export interface FieldDefinition {
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: FieldValue;
  required: boolean;
  disabled: boolean;
  hidden: boolean;
  readonly: boolean;
  validation: ValidationRule[];
  conditionalLogic: ConditionalLogicRule[];
  calculation?: CalculationConfig;
  options?: FieldOption[];
  settings: Record<string, unknown>;
  layout: FieldLayout;
}

export interface FieldInstance extends FieldDefinition {
  id: UUID;
}

export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | FileValue
  | null
  | undefined;

export interface FileValue {
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}