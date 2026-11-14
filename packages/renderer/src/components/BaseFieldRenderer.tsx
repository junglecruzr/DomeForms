/**
 * Base Field Renderer Component
 */

import type { FieldInstance } from '@domeforms/core';
import { cn } from '../utils';

interface BaseFieldProps {
  field: FieldInstance;
  value?: unknown;
  error?: string;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

export function BaseFieldContainer({ 
  field, 
  children, 
  error, 
  labelPosition = 'top',
  className 
}: BaseFieldProps & { 
  children: React.ReactNode;
  labelPosition?: 'top' | 'left' | 'right' | 'floating' | 'none';
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {field.label && labelPosition !== 'none' && (
        <label className={cn(
          'text-sm font-medium text-foreground',
          labelPosition === 'left' && 'w-[40%] shrink-0'
        )}>
          {field.label}{field.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
