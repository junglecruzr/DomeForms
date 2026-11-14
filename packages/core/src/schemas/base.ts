/**
 * Base Zod schemas
 */

import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const isoDateSchema = z.string().datetime();
export const cssColorSchema = z.string();
export const cssSizeSchema = z.string();