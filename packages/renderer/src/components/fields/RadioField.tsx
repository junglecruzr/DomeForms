/**
 * Radio Button Field
 */

import { BaseFieldContainer } from '../BaseFieldRenderer';
import type { FieldInstance } from '@domeforms/core';
import { cn } from '../../utils';

interface RadioFieldProps {
  field: FieldInstance;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export function RadioField({ field, value, onChange, error }: RadioFieldProps) {
  const options = field.options || [];
  
  return (
    <BaseFieldContainer field={field} error={error}>
      <div className="space-y-2">
        {options.map((opt: any) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field.name}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={field.disabled || opt.disabled}
              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </BaseFieldContainer>
  );
}
