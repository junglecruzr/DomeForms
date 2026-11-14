'use client';

import { ChevronRight, ChevronDown, GripVertical, Eye, EyeOff, MousePointer, Move, Trash2, Settings, Copy, Plus } from 'lucide-react';
import { cn } from '@domeforms/ui/lib/utils';
import { Button } from '@domeforms/ui/components/button';
import { useFormStore } from '../../store/form-store';
import { setSelectedField, setSelectedColumn, setSelectedRow, deleteField, deleteColumn, deleteRow, addRow, addColumn } from '../../store/form-actions';
import { uuid } from '@domeforms/core';

interface LayerTreeItemProps {
  item: any;
  type: 'page' | 'column' | 'row' | 'field';
  level: number;
  pageId?: string;
  columnId?: string;
  rowId?: string;
}

function LayerTreeItem({ item, type, level, pageId, columnId, rowId }: LayerTreeItemProps) {
  const { selectedFieldId, selectedColumnId, selectedRowId } = useFormStore();
  
  let isSelected = false;
  if (type === 'field') isSelected = selectedFieldId === item.id;
  else if (type === 'column') isSelected = selectedColumnId === item.id;
  else if (type === 'row') isSelected = selectedRowId === item.id;

  const icons: Record<string, string> = {
    page: '📄',
    column: '📑',
    row: '📋',
    text: '📝',
    textarea: '📄',
    email: '📧',
    number: '🔢',
    select: '📋',
    radio: '⭕',
    checkbox: '☑️',
    date: '📅',
    file: '📎',
    button: '🔘',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'field') setSelectedField(item.id);
    else if (type === 'column') setSelectedColumn(item.id);
    else if (type === 'row') setSelectedRow(item.id);
  };

  const children = type === 'page' 
    ? item.columns.map((col: any) => <LayerTreeItem key={col.id} item={col} type="column" level={level + 1} pageId={item.id} />)
    : type === 'column'
    ? item.rows.map((row: any) => <LayerTreeItem key={row.id} item={row} type="row" level={level + 1} pageId={pageId} columnId={item.id} />)
    : type === 'row'
    ? item.fields.map((field: any) => <LayerTreeItem key={field.id} item={field} type="field" level={level + 1} pageId={pageId} columnId={columnId} rowId={item.id} />)
    : null;

  return (
    <div className="select-none">
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded transition-colors',
          isSelected && 'bg-primary/10 text-primary',
          'hover:bg-accent'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span className="text-xl">{icons[item.type] || icons[type]}</span>
        <span className="flex-1 truncate text-sm">{item.label || item.name || item.type}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {type === 'column' && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); addRow(pageId!, item.id, { id: uuid(), fields: [] }); }}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
          {type === 'page' && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); addColumn(item.id, { id: uuid(), width: 12, rows: [{ id: uuid(), fields: [] }] }); }}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
          {type === 'field' && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); deleteField(pageId!, columnId!, rowId!, item.id); }}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
          {type === 'column' && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); deleteColumn(pageId!, item.id); }}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
        </div>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

export function LayerTree() {
  const { form } = useFormStore();

  if (!form) return <div className="text-center py-8 text-muted-foreground">No form loaded</div>;

  return (
    <div className="h-full overflow-y-auto p-2">
      {form.pages.map((page: any) => (
        <LayerTreeItem key={page.id} item={page} type="page" level={0} />
      ))}
    </div>
  );
}