import { useFormStore } from './form-store';
import type { FormPage, Column, Row, FieldInstance, ConditionalLogicRule, IntegrationConfig, ThemeVariables, UUID } from '@domeforms/core';
import { uuid } from '@domeforms/core';

const { pushHistory } = useFormStore.getState();

function withHistory<T>(fn: () => T) {
  const { form } = useFormStore.getState();
  if (form) {
    pushHistory();
    const result = fn();
    useFormStore.setState((state) => { state.isDirty = true; });
    return result;
  }
}

// Page actions
export const addPage = (page: FormPage) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) state.form.pages.push(page); });
});

export const updatePage = (pageId: string, updates: Partial<FormPage>) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); if (p) Object.assign(p, updates); } });
});

export const deletePage = (pageId: string) => withHistory(() => {
  const { form } = useFormStore.getState();
  if (form && form.pages.length > 1) {
    useFormStore.setState((state) => { if (state.form) state.form.pages = state.form.pages.filter((p: FormPage) => p.id !== pageId); });
  }
});

export const reorderPages = (fromIndex: number, toIndex: number) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const [r] = state.form.pages.splice(fromIndex, 1); state.form.pages.splice(toIndex, 0, r); } });
});

// Column actions
export const addColumn = (pageId: string, column: Column) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); if (p) p.columns.push(column); } });
});

export const updateColumn = (pageId: string, columnId: string, updates: Partial<Column>) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); const c = p?.columns.find((x: Column) => x.id === columnId); if (c) Object.assign(c, updates); } });
});

export const deleteColumn = (pageId: string, columnId: string) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); if (p && p.columns.length > 1) p.columns = p.columns.filter((c: Column) => c.id !== columnId); } });
});

// Row actions
export const addRow = (pageId: string, columnId: string, row: Row) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); const c = p?.columns.find((x: Column) => x.id === columnId); if (c) c.rows.push(row); } });
});

export const updateRow = (pageId: string, columnId: string, rowId: string, updates: Partial<Row>) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); const c = p?.columns.find((x: Column) => x.id === columnId); const r = c?.rows.find((x: Row) => x.id === rowId); if (r) Object.assign(r, updates); } });
});

export const deleteRow = (pageId: string, columnId: string, rowId: string) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); const c = p?.columns.find((x: Column) => x.id === columnId); if (c) c.rows = c.rows.filter((r: Row) => r.id !== rowId); } });
});

// Field actions
export const addField = (pageId: string, columnId: string, rowId: string, field: FieldInstance) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); const c = p?.columns.find((x: Column) => x.id === columnId); const r = c?.rows.find((x: Row) => x.id === rowId); if (r) r.fields.push(field); } });
});

export const updateField = (pageId: string, columnId: string, rowId: string, fieldId: string, updates: Partial<FieldInstance>) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); const c = p?.columns.find((x: Column) => x.id === columnId); const r = c?.rows.find((x: Row) => x.id === rowId); const f = r?.fields.find((x: FieldInstance) => x.id === fieldId); if (f) Object.assign(f, updates); } });
});

export const deleteField = (pageId: string, columnId: string, rowId: string, fieldId: string) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const p = state.form.pages.find((x: FormPage) => x.id === pageId); const c = p?.columns.find((x: Column) => x.id === columnId); const r = c?.rows.find((x: Row) => x.id === rowId); if (r) r.fields = r.fields.filter((f: FieldInstance) => f.id !== fieldId); if (state.selectedFieldId === fieldId) state.selectedFieldId = null; } });
});

export const moveField = (from: { pageId: string; columnId: string; rowId: string; fieldIndex: number }, to: { pageId: string; columnId: string; rowId: string; fieldIndex: number }) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { const fp = state.form.pages.find((x: FormPage) => x.id === from.pageId); const fc = fp?.columns.find((x: Column) => x.id === from.columnId); const fr = fc?.rows.find((x: Row) => x.id === from.rowId); const tp = state.form.pages.find((x: FormPage) => x.id === to.pageId); const tc = tp?.columns.find((x: Column) => x.id === to.columnId); const tr = tc?.rows.find((x: Row) => x.id === to.rowId); if (fr && tr) { const [f] = fr.fields.splice(from.fieldIndex, 1); tr.fields.splice(to.fieldIndex, 0, f); } } });
});

// Selection actions (needed by LayerTree)
export const setSelectedField = (fieldId: string | null) => {
  useFormStore.setState((state) => { state.selectedFieldId = fieldId; });
};

export const setSelectedColumn = (columnId: string | null) => {
  useFormStore.setState((state) => { state.selectedColumnId = columnId; });
};

export const setSelectedRow = (rowId: string | null) => {
  useFormStore.setState((state) => { state.selectedRowId = rowId; });
};

// Logic actions
export const updateLogic = (logic: ConditionalLogicRule[]) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { state.form.logic = logic; } });
});

// Integration actions
export const updateIntegrations = (integrations: IntegrationConfig[]) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { state.form.integrations = integrations; } });
});

// Theme actions
export const updateTheme = (theme: ThemeVariables) => withHistory(() => {
  useFormStore.setState((state) => { if (state.form) { (state.form as any).theme = theme; } });
});
