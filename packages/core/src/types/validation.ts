/**
 * Validation types
 */

export type ValidatorType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'phone'
  | 'numeric'
  | 'integer'
  | 'uuid'
  | 'date'
  | 'dateRange'
  | 'fileSize'
  | 'fileType'
  | 'custom';

export interface ValidationRule {
  type: ValidatorType;
  message: string;
  params?: Record<string, unknown>;
  validator?: string;
}

export const builtInValidators: Record<Exclude<ValidatorType, 'custom'>, { params: string[] }> = {
  required: { params: [] },
  minLength: { params: ['min'] },
  maxLength: { params: ['max'] },
  min: { params: ['min'] },
  max: { params: ['max'] },
  pattern: { params: ['pattern', 'flags?'] },
  email: { params: [] },
  url: { params: [] },
  phone: { params: ['countryCode?'] },
  numeric: { params: [] },
  integer: { params: [] },
  uuid: { params: [] },
  date: { params: ['format?'] },
  dateRange: { params: ['min?', 'max?'] },
  fileSize: { params: ['maxBytes'] },
  fileType: { params: ['allowedTypes[]'] },
};