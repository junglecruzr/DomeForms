/**
 * Select Dropdown Field
 */

import { BaseFieldContainer } from '../BaseFieldRenderer';
import type { FieldInstance } from '@domeforms/core';
import { cn } from '../../utils';

interface SelectFieldProps {
  field: FieldInstance;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export function SelectField({ field, value, onChange, error }: SelectFieldProps) {
  const options = field.options || [];
  
  return (
    <BaseFieldContainer field={field} error={error}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={field.disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
          error && 'border-destructive'
        )}
      >
        <option value="">{field.placeholder || 'Select an option...'}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </BaseFieldContainer>
  );
}
