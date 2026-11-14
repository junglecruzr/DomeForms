/**
 * Theme types
 */

import type { UUID, ISODateString, CSSColor, CSSSize } from './base.js';

export interface ThemeVariables {
  'color-primary': CSSColor;
  'color-primary-hover': CSSColor;
  'color-primary-text': CSSColor;
  'color-secondary': CSSColor;
  'color-secondary-hover': CSSColor;
  'color-secondary-text': CSSColor;
  'color-success': CSSColor;
  'color-warning': CSSColor;
  'color-error': CSSColor;
  'color-background': CSSColor;
  'color-surface': CSSColor;
  'color-surface-hover': CSSColor;
  'color-border': CSSColor;
  'color-text': CSSColor;
  'color-text-muted': CSSColor;
  'color-text-inverse': CSSColor;
  'font-family': string;
  'font-family-mono': string;
  'font-size-base': CSSSize;
  'font-size-sm': CSSSize;
  'font-size-lg': CSSSize;
  'font-size-xl': CSSSize;
  'line-height-base': string;
  'font-weight-normal': string;
  'font-weight-medium': string;
  'font-weight-bold': string;
  'spacing-xs': CSSSize;
  'spacing-sm': CSSSize;
  'spacing-md': CSSSize;
  'spacing-lg': CSSSize;
  'spacing-xl': CSSSize;
  'border-radius-sm': CSSSize;
  'border-radius-md': CSSSize;
  'border-radius-lg': CSSSize;
  'border-radius-full': CSSSize;
  'border-width': CSSSize;
  'shadow-sm': string;
  'shadow-md': string;
  'shadow-lg': string;
  'transition-fast': string;
  'transition-normal': string;
  'transition-slow': string;
  'input-height': CSSSize;
  'input-padding-x': CSSSize;
  'input-padding-y': CSSSize;
  'label-gap': CSSSize;
  'field-gap': CSSSize;
  'section-gap': CSSSize;
}

export const defaultThemeVariables: ThemeVariables = {
  'color-primary': '#0ea5e9' as CSSColor,
  'color-primary-hover': '#0284c7' as CSSColor,
  'color-primary-text': '#ffffff' as CSSColor,
  'color-secondary': '#64748b' as CSSColor,
  'color-secondary-hover': '#475569' as CSSColor,
  'color-secondary-text': '#ffffff' as CSSColor,
  'color-success': '#22c55e' as CSSColor,
  'color-warning': '#f59e0b' as CSSColor,
  'color-error': '#ef4444' as CSSColor,
  'color-background': '#ffffff' as CSSColor,
  'color-surface': '#f8fafc' as CSSColor,
  'color-surface-hover': '#f1f5f9' as CSSColor,
  'color-border': '#e2e8f0' as CSSColor,
  'color-text': '#0f172a' as CSSColor,
  'color-text-muted': '#64748b' as CSSColor,
  'color-text-inverse': '#ffffff' as CSSColor,
  'font-family': 'Inter, system-ui, sans-serif',
  'font-family-mono': 'JetBrains Mono, monospace',
  'font-size-base': '1rem' as CSSSize,
  'font-size-sm': '0.875rem' as CSSSize,
  'font-size-lg': '1.125rem' as CSSSize,
  'font-size-xl': '1.25rem' as CSSSize,
  'line-height-base': '1.5',
  'font-weight-normal': '400',
  'font-weight-medium': '500',
  'font-weight-bold': '600',
  'spacing-xs': '0.25rem' as CSSSize,
  'spacing-sm': '0.5rem' as CSSSize,
  'spacing-md': '1rem' as CSSSize,
  'spacing-lg': '1.5rem' as CSSSize,
  'spacing-xl': '2rem' as CSSSize,
  'border-radius-sm': '0.25rem' as CSSSize,
  'border-radius-md': '0.375rem' as CSSSize,
  'border-radius-lg': '0.5rem' as CSSSize,
  'border-radius-full': '9999px' as CSSSize,
  'border-width': '1px' as CSSSize,
  'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'transition-fast': '150ms ease',
  'transition-normal': '200ms ease',
  'transition-slow': '300ms ease',
  'input-height': '2.5rem' as CSSSize,
  'input-padding-x': '0.75rem' as CSSSize,
  'input-padding-y': '0.5rem' as CSSSize,
  'label-gap': '0.375rem' as CSSSize,
  'field-gap': '1.5rem' as CSSSize,
  'section-gap': '2rem' as CSSSize,
};

export interface Theme {
  id: UUID;
  name: string;
  isDefault: boolean;
  variables: ThemeVariables;
  customCss?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}