/**
 * Validation schemas
 */

import { z } from 'zod';

export const validationRuleSchema = z.object({
  type: z.enum([
    'required', 'minLength', 'maxLength', 'min', 'max', 'pattern',
    'email', 'url', 'phone', 'numeric', 'integer', 'uuid',
    'date', 'dateRange', 'fileSize', 'fileType', 'custom',
  ]),
  message: z.string(),
  params: z.record(z.unknown()).optional(),
  validator: z.string().optional(),
});