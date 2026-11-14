'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Settings, LayoutGrid } from 'lucide-react';
import { cn } from '@domeforms/ui/lib/utils';
import { Button } from '@domeforms/ui/components/button';
import { useFormStore } from '../../store/form-store';
import { addColumn, addRow, addField, deleteField, deleteRow, deleteColumn, updateField } from '../../store/form-actions';
import { uuid } from '@domeforms/core';
import type { Column, Row, FormPage } from '@domeforms/core';

function SortableRow({ row, pageId, columnId, rowId }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rowId, data: { type: 'field', rowId, columnId, pageId } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  
  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="flex items-center gap-2 p-2 bg-background rounded-lg border hover:border-primary/50 transition-colors">
        <button {...attributes} {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground"><GripVertical className="h-4 w-4" /></button>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{row.label || row.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{row.type}</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); updateField(pageId, columnId, rowId, row.id, { hidden: !row.hidden }); }}>
            {row.hidden ? <Settings className="h-3 w-3" /> : <Settings className="h-3 w-3 text-green-500" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteField(pageId, columnId, rowId, row.id); }}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortableColumn({ column, pageId, columnId }: any) {
  return (
    <div className="flex flex-col gap-2 min-h-[200px]" style={{ flex: `0 0 ${column.width / 12 * 100}%` }}>
      <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
        <span>Column ({column.width}/12)</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addRow(pageId, columnId, { id: uuid(), fields: [] })}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteColumn(pageId, columnId)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
      <SortableContext items={column.rows.map((r: any) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {column.rows.map((row: any) => (
            <SortableRow key={row.id} row={row} pageId={pageId} columnId={columnId} rowId={row.id} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortablePage({ page, pageId }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
        <h3 className="font-medium">{page.name}</h3>
        <Button variant="outline" size="sm" onClick={() => addColumn(pageId, { id: uuid(), width: 12, rows: [{ id: uuid(), fields: [] }] })}>
          <LayoutGrid className="h-3 w-3 mr-1" /> Add Column
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-4">
        {page.columns.map((column: any) => (
          <SortableColumn key={column.id} column={column} pageId={pageId} columnId={column.id} />
        ))}
      </div>
    </div>
  );
}

export function BuilderCanvas() {
  const { form, previewMode } = useFormStore();
  const [activePageIndex, setActivePageIndex] = useState(0);

  if (!form) return <div className="flex-1 flex items-center justify-center text-muted-foreground">No form loaded</div>;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={() => {}}>
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <div className="border-b bg-white px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {form.pages.map((page: any, index: number) => (
            <button
              key={page.id}
              onClick={() => setActivePageIndex(index)}
              className={cn(
                'px-3 py-1.5 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap',
                index === activePageIndex ? 'bg-white border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {page.name}
            </button>
          ))}
          <button onClick={() => { /* add page */ }} className="ml-2 px-3 py-1.5 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6" style={{ background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
          <div className="max-w-4xl mx-auto">
            {form.pages[activePageIndex] && <SortablePage page={form.pages[activePageIndex]} pageId={form.pages[activePageIndex].id} />}
          </div>
        </div>
        <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center text-muted-foreground mx-6 mb-6">
          <LayoutGrid className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Drag fields from the left panel to build your form</p>
        </div>
      </div>
    </DndContext>
  );
}
