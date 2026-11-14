/**
 * Validation engine
 */

import { z } from 'zod';
import type { ValidationRule, FieldValue, ValidatorType } from '../types/index.js';
import { validationRuleSchema } from '../schemas/index.js';

// Built-in validator functions
export const validators: Record<Exclude<ValidatorType, 'custom'>, (value: FieldValue, params?: Record<string, unknown>) => boolean> = {
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  minLength: (value, params) => {
    if (typeof value !== 'string') return false;
    return value.length >= (params?.min as number ?? 0);
  },
  maxLength: (value, params) => {
    if (typeof value !== 'string') return false;
    return value.length <= (params?.max as number ?? Infinity);
  },
  min: (value, params) => {
    const num = typeof value === 'number' ? value : Number(value);
    return !isNaN(num) && num >= (params?.min as number ?? -Infinity);
  },
  max: (value, params) => {
    const num = typeof value === 'number' ? value : Number(value);
    return !isNaN(num) && num <= (params?.max as number ?? Infinity);
  },
  pattern: (value, params) => {
    if (typeof value !== 'string') return false;
    const pattern = params?.pattern as string;
    const flags = params?.flags as string | undefined;
    try {
      return new RegExp(pattern, flags).test(value);
    } catch {
      return false;
    }
  },
  email: (value) => {
    if (typeof value !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  url: (value) => {
    if (typeof value !== 'string') return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  phone: (value) => {
    if (typeof value !== 'string') return false;
    // Basic phone validation - can be extended with libphonenumber
    return /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/.test(value);
  },
  numeric: (value) => {
    if (typeof value === 'number') return true;
    if (typeof value !== 'string') return false;
    return !isNaN(Number(value)) && isFinite(Number(value));
  },
  integer: (value) => {
    if (typeof value === 'number') return Number.isInteger(value);
    if (typeof value !== 'string') return false;
    const num = Number(value);
    return Number.isInteger(num);
  },
  uuid: (value) => {
    if (typeof value !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  },
  date: (value) => {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  },
  dateRange: (value, params) => {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    const min = params?.min ? new Date(params.min as string) : null;
    const max = params?.max ? new Date(params.max as string) : null;
    if (min && date < min) return false;
    if (max && date > max) return false;
    return true;
  },
  fileSize: (value, params) => {
    if (!value || typeof value !== 'object') return false;
    const file = value as { size?: number };
    return typeof file.size === 'number' && file.size <= (params?.maxBytes as number ?? Infinity);
  },
  fileType: (value, params) => {
    if (!value || typeof value !== 'object') return false;
    const file = value as { type?: string };
    const allowedTypes = params?.allowedTypes as string[] ?? [];
    if (!file.type || allowedTypes.length === 0) return true;
    return allowedTypes.some(t => file.type!.startsWith(t) || file.type === t);
  },
};

export function validateField(value: FieldValue, rules: ValidationRule[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const rule of rules) {
    const validator = validators[rule.type as Exclude<ValidatorType, 'custom'>];
    
    if (rule.type === 'custom' && rule.validator) {
      try {
        const fn = new Function('value', 'params', rule.validator);
        if (!fn(value, rule.params)) {
          errors.push(rule.message);
        }
      } catch {
        errors.push(rule.message);
      }
    } else if (validator) {
      if (!validator(value, rule.params)) {
        errors.push(rule.message);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateForm(data: Record<string, FieldValue>, fields: Array<{ name: string; validation: ValidationRule[] }>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  for (const field of fields) {
    const value = data[field.name];
    const result = validateField(value, field.validation);
    if (!result.valid) {
      errors[field.name] = result.errors;
    }
  }
  
  return errors;
}

// Zod schema for validation rules
export { validationRuleSchema };