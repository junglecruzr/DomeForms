/**
 * Number Input Field
 */

import { BaseFieldContainer } from '../BaseFieldRenderer';
import type { FieldInstance } from '@domeforms/core';
import { cn } from '../../utils';

interface NumberFieldProps {
  field: FieldInstance;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
}

export function NumberField({ field, value, onChange, error }: NumberFieldProps) {
  return (
    <BaseFieldContainer field={field} error={error}>
      <input
        type="number"
        placeholder={field.placeholder}
        value={value ?? ''}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        disabled={field.disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive'
        )}
      />
    </BaseFieldContainer>
  );
}
