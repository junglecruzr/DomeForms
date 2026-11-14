/**
 * Layout types - Pages, Columns, Rows
 */

import type { UUID, CSSColor, CSSSize } from './base.js';
import type { FieldInstance, ConditionalLogicRule, IntegrationConfig } from './index.js';

export interface ResponsiveWidths {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}

export interface RowSettings {
  gap?: CSSSize;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  padding?: CSSSize;
  backgroundColor?: CSSColor;
  borderRadius?: CSSSize;
  border?: string;
}

export interface Row {
  id: UUID;
  fields: FieldInstance[];
  settings?: RowSettings;
}

export interface Column {
  id: UUID;
  width: number;
  offset?: number;
  rows: Row[];
  responsive?: ResponsiveWidths;
}

export interface FormPage {
  id: UUID;
  name: string;
  description?: string;
  columns: Column[];
  logic?: ConditionalLogicRule[];
}