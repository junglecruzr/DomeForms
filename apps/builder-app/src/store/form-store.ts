import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { FormDefinition, FormPage, Column, Row, FieldInstance, ConditionalLogicRule, IntegrationConfig, ThemeVariables } from '@domeforms/core';

interface HistoryState {
  past: FormDefinition[];
  future: FormDefinition[];
}

interface FormStore extends HistoryState {
  form: FormDefinition | null;
  selectedFieldId: string | null;
  selectedColumnId: string | null;
  selectedRowId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  previewMode: boolean;
  
  setForm: (form: FormDefinition) => void;
  updateForm: (updates: Partial<FormDefinition>) => void;
  setSelectedField: (fieldId: string | null) => void;
  setSelectedColumn: (columnId: string | null) => void;
  setSelectedRow: (rowId: string | null) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  resetHistory: () => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
}

export const useFormStore = create<FormStore>()(
  immer((set, get) => ({
    past: [],
    future: [],
    form: null,
    selectedFieldId: null,
    selectedColumnId: null,
    selectedRowId: null,
    isDirty: false,
    isSaving: false,
    previewMode: false,

    setForm: (form) => set((state) => {
      state.form = form;
      state.past = [];
      state.future = [];
      state.isDirty = false;
      state.selectedFieldId = null;
      state.selectedColumnId = null;
      state.selectedRowId = null;
    }),

    updateForm: (updates) => set((state) => {
      if (state.form) {
        state.form = { ...state.form, ...updates, updatedAt: new Date().toISOString() as any };
        state.isDirty = true;
      }
    }),

    setSelectedField: (fieldId) => set((state) => {
      state.selectedFieldId = fieldId;
      state.selectedColumnId = null;
      state.selectedRowId = null;
    }),

    setSelectedColumn: (columnId) => set((state) => {
      state.selectedColumnId = columnId;
      state.selectedFieldId = null;
      state.selectedRowId = null;
    }),

    setSelectedRow: (rowId) => set((state) => {
      state.selectedRowId = rowId;
      state.selectedFieldId = null;
      state.selectedColumnId = null;
    }),

    pushHistory: () => set((state) => {
      if (state.form) {
        state.past.push(JSON.parse(JSON.stringify(state.form)));
        if (state.past.length > 50) state.past.shift();
        state.future = [];
      }
    }),

    undo: () => set((state) => {
      if (state.past.length > 0 && state.form) {
        state.future.unshift(JSON.parse(JSON.stringify(state.form)));
        state.form = state.past.pop()!;
        state.isDirty = true;
      }
    }),

    redo: () => set((state) => {
      if (state.future.length > 0 && state.form) {
        state.past.push(JSON.parse(JSON.stringify(state.form)));
        state.form = state.future.shift()!;
        state.isDirty = true;
      }
    }),

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    resetHistory: () => set((state) => {
      state.past = [];
      state.future = [];
    }),

    setDirty: (dirty) => set((state) => { state.isDirty = dirty; }),
    setSaving: (saving) => set((state) => { state.isSaving = saving; }),
    setPreviewMode: (preview) => set((state) => { state.previewMode = preview; }),
  }))
);