import { describe, it, expect } from 'vitest';
import { uuid, isUUID } from '../types/base.js';

describe('Core Types', () => {
  it('generates valid UUIDs', () => {
    const id = uuid();
    expect(isUUID(id)).toBe(true);
    expect(id).toHaveLength(36);
  });

  it('validates UUID format', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isUUID('invalid')).toBe(false);
  });
});