/**
 * Main Field Renderer - dispatches to correct component
 */

import type { FieldInstance } from '@domeforms/core';
import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { TextareaField } from './fields/TextareaField';
import { RadioField } from './fields/RadioField';
import { cn } from '../utils';

interface FieldRendererProps {
  field: FieldInstance;
  value?: unknown;
  error?: string;
  onChange?: (value: unknown) => void;
  previewMode?: boolean;
}

export function FieldRenderer({ field, value, error, onChange, previewMode = false }: FieldRendererProps) {
  const commonProps = {
    field,
    value,
    error,
    onChange,
    disabled: field.disabled || previewMode,
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'search':
    case 'password':
      return <TextField {...commonProps} />;
    
    case 'number':
      return <NumberField {...commonProps} />;
    
    case 'textarea':
      return <TextareaField {...commonProps} />;
    
    case 'select':
    case 'multiselect':
      return <SelectField {...commonProps} />;
    
    case 'radio':
      return <RadioField {...commonProps} />;
    
    case 'checkbox':
      return (
        <BaseFieldContainer field={field} error={error}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange?.(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{field.label}</span>
          </label>
        </BaseFieldContainer>
      );
    
    case 'calculation':
      return (
        <BaseFieldContainer field={field} error={error}>
          <div className={cn(
            'flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-medium',
            error && 'border-destructive'
          )}>
            {typeof value === 'number' ? value : (field.placeholder || '0')}
          </div>
        </BaseFieldContainer>
      );
    
    case 'html':
      return (
        <div 
          className="prose prose-sm max-w-none p-4 bg-muted rounded-lg"
          dangerouslySetInnerHTML={{ __html: (value as string) || '' }}
        />
      );
    
    case 'divider':
      return <hr className="my-4 border-t" />;
    
    case 'button':
      return (
        <button
          type="button"
          onClick={() => onChange?.(true)}
          disabled={field.disabled}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {field.label}
        </button>
      );
    
    default:
      return (
        <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
          {field.type} field (not yet implemented)
        </div>
      );
  }
}

// Re-export for convenience
export { BaseFieldContainer } from './BaseFieldRenderer';
