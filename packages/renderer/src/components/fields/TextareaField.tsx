/**
 * Textarea Field
 */

import { BaseFieldContainer } from '../BaseFieldRenderer';
import type { FieldInstance } from '@domeforms/core';
import { cn } from '../../utils';

interface TextareaFieldProps {
  field: FieldInstance;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export function TextareaField({ field, value = '', onChange, error }: TextareaFieldProps) {
  return (
    <BaseFieldContainer field={field} error={error}>
      <textarea
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={field.disabled}
        rows={4}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive'
        )}
      />
    </BaseFieldContainer>
  );
}
