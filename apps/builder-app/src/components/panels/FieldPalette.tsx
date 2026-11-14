'use client';

import { useState } from 'react';
import { DragOverlay } from '@dnd-kit/core';
import { cn } from '@domeforms/ui/lib/utils';
import { Button } from '@domeforms/ui/components/button';
import { Card, CardContent } from '@domeforms/ui/components/card';
import { Input } from '@domeforms/ui/components/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@domeforms/ui/components/tabs';
import { useFormStore } from '../../store/form-store';
import { addField } from '../../store/form-actions';
import { v4 as uuidv4 } from 'uuid';

const FIELD_CATEGORIES = {
  input: { label: 'Input Fields', icon: '📝', fields: [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'textarea', label: 'Textarea', icon: '📄' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'password', label: 'Password', icon: '🔒' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'tel', label: 'Phone', icon: '📞' },
    { type: 'url', label: 'URL', icon: '🔗' },
    { type: 'search', label: 'Search', icon: '🔍' },
    { type: 'hidden', label: 'Hidden', icon: '👻' },
  ]},
  selection: { label: 'Selection Fields', icon: '☑️', fields: [
    { type: 'select', label: 'Select', icon: '📋' },
    { type: 'multiselect', label: 'Multi Select', icon: '📋' },
    { type: 'radio', label: 'Radio Buttons', icon: '⭕' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'checkbox-group', label: 'Checkbox Group', icon: '☑️' },
    { type: 'toggle', label: 'Toggle', icon: '🔘' },
    { type: 'rating', label: 'Rating', icon: '⭐' },
  ]},
  datetime: { label: 'Date & Time', icon: '📅', fields: [
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'time', label: 'Time', icon: '⏰' },
    { type: 'datetime', label: 'DateTime', icon: '📅' },
    { type: 'daterange', label: 'Date Range', icon: '📆' },
  ]},
  advanced: { label: 'Advanced Fields', icon: '🔧', fields: [
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'image', label: 'Image Upload', icon: '🖼️' },
    { type: 'signature', label: 'Signature', icon: '✍️' },
    { type: 'calculation', label: 'Calculation', icon: '🧮' },
  ]},
  layout: { label: 'Layout Elements', icon: '📦', fields: [
    { type: 'html', label: 'HTML', icon: '💻' },
    { type: 'divider', label: 'Divider', icon: '➖' },
    { type: 'section', label: 'Section', icon: '📦' },
    { type: 'page-break', label: 'Page Break', icon: '➡️' },
  ]},
  buttons: { label: 'Buttons', icon: '🔘', fields: [
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'recaptcha', label: 'reCAPTCHA', icon: '🤖' },
    { type: 'turnstile', label: 'Turnstile', icon: '🛡️' },
  ]},
};

function DraggableField({ field, category }: { field: any; category: string }) {
  return (
    <div
      className="p-3 bg-card border rounded-lg cursor-grab hover:border-primary/50 hover:bg-accent transition-all group"
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-domeforms-field', JSON.stringify({ ...field, category }));
        e.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{field.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{field.label}</div>
          <div className="text-xs text-muted-foreground capitalize">{category}</div>
        </div>
      </div>
    </div>
  );
}

export function FieldPalette() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('input');

  const filteredCategories = Object.entries(FIELD_CATEGORIES).map(([key, cat]) => ({
    ...cat,
    key,
    fields: cat.fields.filter(f => f.label.toLowerCase().includes(search.toLowerCase())),
  })).filter(cat => cat.fields.length > 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-2">
        <Input
          placeholder="Search fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm"
        />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 mb-2 p-1 bg-muted">
          {Object.entries(FIELD_CATEGORIES).map(([key, cat]) => (
            <TabsTrigger key={key} value={key} className="text-xs py-1.5">
              <span className="flex items-center gap-1">{cat.icon} {cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(FIELD_CATEGORIES).map(([key, cat]) => (
          <TabsContent key={key} value={key} className="flex-1 overflow-y-auto p-2">
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {cat.icon} {cat.label}
              </h4>
              <div className="space-y-2">
                {cat.fields.map((field) => (
                  <DraggableField key={field.type} field={field} category={cat.label} />
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}