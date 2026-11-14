'use client';

import { useState } from 'react';
import { cn } from '@domeforms/ui/lib/utils';
import { Button } from '@domeforms/ui/components/button';
import { Input } from '@domeforms/ui/components/input';
import { Label } from '@domeforms/ui/components/label';
import { Card, CardContent, CardHeader, CardTitle } from '@domeforms/ui/components/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@domeforms/ui/components/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@domeforms/ui/components/select';

const THEME_DEFAULTS = {
  'color-primary': '#0ea5e9',
  'color-primary-hover': '#0284c7',
  'color-primary-text': '#ffffff',
  'color-secondary': '#64748b',
  'color-secondary-hover': '#475569',
  'color-secondary-text': '#ffffff',
  'color-success': '#22c55e',
  'color-warning': '#f59e0b',
  'color-error': '#ef4444',
  'color-background': '#ffffff',
  'color-surface': '#f8fafc',
  'color-surface-hover': '#f1f5f9',
  'color-border': '#e2e8f0',
  'color-text': '#0f172a',
  'color-text-muted': '#64748b',
  'color-text-inverse': '#ffffff',
  'font-family': 'Inter, system-ui, sans-serif',
  'font-family-mono': 'JetBrains Mono, monospace',
  'font-size-base': '1rem',
  'font-size-sm': '0.875rem',
  'font-size-lg': '1.125rem',
  'font-size-xl': '1.25rem',
  'line-height-base': '1.5',
  'font-weight-normal': '400',
  'font-weight-medium': '500',
  'font-weight-bold': '600',
  'spacing-xs': '0.25rem',
  'spacing-sm': '0.5rem',
  'spacing-md': '1rem',
  'spacing-lg': '1.5rem',
  'spacing-xl': '2rem',
  'border-radius-sm': '0.25rem',
  'border-radius-md': '0.375rem',
  'border-radius-lg': '0.5rem',
  'border-radius-full': '9999px',
  'border-width': '1px',
  'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'transition-fast': '150ms ease',
  'transition-normal': '200ms ease',
  'transition-slow': '300ms ease',
  'input-height': '2.5rem',
  'input-padding-x': '0.75rem',
  'input-padding-y': '0.5rem',
  'label-gap': '0.375rem',
  'field-gap': '1.5rem',
  'section-gap': '2rem',
};

const THEME_GROUPS = {
  Colors: Object.keys(THEME_DEFAULTS).filter(k => k.startsWith('color-')),
  Typography: Object.keys(THEME_DEFAULTS).filter(k => k.startsWith('font-') || k.startsWith('line-height') || k.startsWith('font-weight')),
  Spacing: Object.keys(THEME_DEFAULTS).filter(k => k.startsWith('spacing-')),
  Borders: Object.keys(THEME_DEFAULTS).filter(k => k.startsWith('border-')),
  Shadows: Object.keys(THEME_DEFAULTS).filter(k => k.startsWith('shadow-')),
  Transitions: Object.keys(THEME_DEFAULTS).filter(k => k.startsWith('transition-')),
  Forms: Object.keys(THEME_DEFAULTS).filter(k => k.startsWith('input-') || k.startsWith('label-') || k.startsWith('field-') || k.startsWith('section-')),
};

export function ThemeBuilder() {
  const [theme, setTheme] = useState<Record<string, string>>({ ...THEME_DEFAULTS });

  const handleChange = (key: string, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
    document.documentElement.style.setProperty(`--${key}`, value);
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold">Theme Builder</h1><p className="text-muted-foreground">Customize your form appearance</p></div>
        <div className="flex items-center gap-2"><Button variant="outline">Export JSON</Button><Button variant="outline">Import JSON</Button><Button>Save Theme</Button></div>
      </div>

      <Tabs defaultValue="colors" className="flex-1">
        <TabsList className="grid w-full grid-cols-7 mb-4">
          {Object.keys(THEME_GROUPS).map(key => <TabsTrigger key={key} value={key.toLowerCase()}>{key}</TabsTrigger>)}
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {Object.entries(THEME_GROUPS).map(([groupName, keys]) => (
          <TabsContent key={groupName} value={groupName.toLowerCase()} className="flex-1 overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {keys.map(key => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium capitalize">{key.replace(/-/g, ' ')}</Label>
                  {key.startsWith('color-') ? (
                    <div className="flex items-center gap-2"><input type="color" value={theme[key]} onChange={e => handleChange(key, e.target.value)} className="h-8 w-8 rounded border cursor-pointer" /><Input value={theme[key]} onChange={e => handleChange(key, e.target.value)} className="flex-1 text-sm font-mono" /></div>
                  ) : key.includes('font-family') ? (
                    <Select value={theme[key]} onValueChange={v => handleChange(key, v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem><SelectItem value="Roboto, system-ui, sans-serif">Roboto</SelectItem><SelectItem value="Open Sans, system-ui, sans-serif">Open Sans</SelectItem><SelectItem value="Poppins, system-ui, sans-serif">Poppins</SelectItem><SelectItem value="system-ui, sans-serif">System UI</SelectItem></SelectContent></Select>
                  ) : (
                    <Input value={theme[key]} onChange={e => handleChange(key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="preview" className="flex-1 overflow-y-auto">
          <Card className="max-w-2xl mx-auto"><CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4" style={{ background: theme['color-surface'] }}>
              <div className="space-y-4">
                <div><Label>Text Input</Label><Input placeholder="Enter text..." style={{ borderColor: theme['color-border'], backgroundColor: theme['color-background'], color: theme['color-text'] }} /></div>
                <div><Label>Email Input</Label><Input type="email" placeholder="email@example.com" style={{ borderColor: theme['color-border'], backgroundColor: theme['color-background'], color: theme['color-text'] }} /></div>
                <div><Label>Select</Label><Select><SelectTrigger style={{ borderColor: theme['color-border'], backgroundColor: theme['color-background'] }}><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent><SelectItem value="1">Option 1</SelectItem><SelectItem value="2">Option 2</SelectItem></SelectContent></Select></div>
                <Button style={{ backgroundColor: theme['color-primary'], color: theme['color-primary-text'] }}>Primary Button</Button>
                <Button variant="secondary" style={{ backgroundColor: theme['color-secondary'], color: theme['color-secondary-text'] }}>Secondary Button</Button>
                <Button variant="outline" style={{ borderColor: theme['color-border'] }}>Outline Button</Button>
              </div>
            </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
