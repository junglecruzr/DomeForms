/**
 * Base branded types
 */

export type UUID = string & { readonly __brand: unique symbol };
export type ISODateString = string & { readonly __brand: unique symbol };
export type CSSColor = string & { readonly __brand: unique symbol };
export type CSSSize = string & { readonly __brand: unique symbol };

export function uuid(): UUID {
  return crypto.randomUUID() as UUID;
}

export function isUUID(val: string): val is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
}