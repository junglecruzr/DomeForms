/**
 * Text Input Field
 */

import { BaseFieldContainer } from './BaseFieldRenderer';
import type { FieldInstance } from '@domeforms/core';
import { cn } from '../utils';

interface TextFieldProps {
  field: FieldInstance;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export function TextField({ field, value = '', onChange, error }: TextFieldProps) {
  return (
    <BaseFieldContainer field={field} error={error}>
      <input
        type={field.type === 'password' ? 'password' : 'text'}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={field.disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive'
        )}
      />
    </BaseFieldContainer>
  );
}
