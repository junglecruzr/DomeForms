import { describe, it, expect } from 'vitest';
import { validateField, validators } from '../validation/index.js';

describe('Validation', () => {
  it('validates required fields', () => {
    expect(validators.required('hello')).toBe(true);
    expect(validators.required('')).toBe(false);
    expect(validators.required(null)).toBe(false);
    expect(validators.required([])).toBe(false);
    expect(validators.required(['a'])).toBe(true);
  });

  it('validates string length', () => {
    expect(validators.minLength('hello', { min: 3 })).toBe(true);
    expect(validators.minLength('hi', { min: 3 })).toBe(false);
    expect(validators.maxLength('hello', { max: 10 })).toBe(true);
    expect(validators.maxLength('hello world', { max: 5 })).toBe(false);
  });

  it('validates email', () => {
    expect(validators.email('test@example.com')).toBe(true);
    expect(validators.email('invalid')).toBe(false);
    expect(validators.email('test@')).toBe(false);
  });

  it('validates numbers', () => {
    expect(validators.min(5, { min: 3 })).toBe(true);
    expect(validators.min(2, { min: 3 })).toBe(false);
    expect(validators.max(5, { max: 10 })).toBe(true);
    expect(validators.max(15, { max: 10 })).toBe(false);
  });

  it('validates pattern', () => {
    expect(validators.pattern('abc123', { pattern: '^[a-z]+[0-9]+$' })).toBe(true);
    expect(validators.pattern('123abc', { pattern: '^[a-z]+[0-9]+$' })).toBe(false);
  });

  it('validateField returns errors', () => {
    const result = validateField('', [
      { type: 'required', message: 'Field is required' },
      { type: 'minLength', message: 'Too short', params: { min: 3 } },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});