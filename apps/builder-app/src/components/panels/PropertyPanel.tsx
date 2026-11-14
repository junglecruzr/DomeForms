'use client';

import { cn } from '@domeforms/ui/lib/utils';
import { Button } from '@domeforms/ui/components/button';
import { Input } from '@domeforms/ui/components/input';
import { Textarea } from '@domeforms/ui/components/textarea';
import { Label } from '@domeforms/ui/components/label';
import { Switch } from '@domeforms/ui/components/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@domeforms/ui/components/select';
import { Card, CardContent, CardHeader, CardTitle } from '@domeforms/ui/components/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@domeforms/ui/components/tabs';
import { useFormStore } from '../../store/form-store';
import { updateField, updateColumn, updatePage } from '../../store/form-actions';

const VALIDATORS = [
  { value: 'required', label: 'Required' },
  { value: 'email', label: 'Email' },
  { value: 'minLength', label: 'Min Length' },
  { value: 'maxLength', label: 'Max Length' },
  { value: 'pattern', label: 'Pattern (Regex)' },
  { value: 'min', label: 'Minimum Value' },
  { value: 'max', label: 'Maximum Value' },
];

export function PropertyPanel() {
  const { selectedFieldId, selectedColumnId, selectedRowId, form } = useFormStore();

  if (!form) return <div className="text-center py-8 text-muted-foreground">No form loaded</div>;

  let selectedElement: any = null;
  let elementType: 'field' | 'column' | 'row' | 'page' = 'field';

  if (selectedFieldId) {
    for (const page of form.pages) {
      for (const column of page.columns) {
        for (const row of column.rows) {
          const field = row.fields.find(f => f.id === selectedFieldId);
          if (field) { selectedElement = field; elementType = 'field'; break; }
        }
        if (selectedElement) break;
      }
      if (selectedElement) break;
    }
  } else if (selectedColumnId) {
    for (const page of form.pages) {
      const column = page.columns.find(c => c.id === selectedColumnId);
      if (column) { selectedElement = column; elementType = 'column'; break; }
    }
  } else if (form.pages.length > 0) {
    selectedElement = form.pages[0];
    elementType = 'page';
  }

  if (!selectedElement) {
    return <div className="text-center py-8 text-muted-foreground"><p>Select an element to edit its properties</p></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <Tabs defaultValue="general" className="h-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">{elementType.charAt(0).toUpperCase() + elementType.slice(1)} Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {elementType === 'field' && (
                <>
                  <div className="space-y-2"><Label>Label</Label><Input value={selectedElement.label} onChange={(e) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { label: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Name (unique)</Label><Input value={selectedElement.name} onChange={(e) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Placeholder</Label><Input value={selectedElement.placeholder || ''} onChange={(e) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { placeholder: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Help Text</Label><Textarea value={selectedElement.helpText || ''} onChange={(e) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { helpText: e.target.value })} rows={2} /></div>
                  <div className="flex items-center gap-2"><Switch checked={selectedElement.required} onCheckedChange={(checked) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { required: checked })} /><Label className="text-sm">Required</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={selectedElement.hidden} onCheckedChange={(checked) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { hidden: checked })} /><Label className="text-sm">Hidden</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={selectedElement.disabled} onCheckedChange={(checked) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { disabled: checked })} /><Label className="text-sm">Disabled</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={selectedElement.readonly} onCheckedChange={(checked) => updateField(selectedElement.pageId, selectedElement.columnId, selectedElement.rowId, selectedElement.id, { readonly: checked })} /><Label className="text-sm">Read Only</Label></div>
                </>
              )}
              {elementType === 'column' && (
                <div className="space-y-2"><Label>Width (1-12)</Label><Input type="number" min="1" max="12" value={selectedElement.width} onChange={(e) => updateColumn(selectedElement.pageId, selectedElement.id, { width: parseInt(e.target.value) })} /></div>
              )}
              {elementType === 'page' && (
                <>
                  <div className="space-y-2"><Label>Page Name</Label><Input value={selectedElement.name} onChange={(e) => updatePage(selectedElement.id, { name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={selectedElement.description || ''} onChange={(e) => updatePage(selectedElement.id, { description: e.target.value })} rows={2} /></div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          {elementType === 'field' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Validation Rules</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {selectedElement.validation?.map((rule: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Select value={rule.type} onValueChange={(v) => {}}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{VALIDATORS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent></Select>
                    <Input placeholder="Error message" value={rule.message} onChange={(e) => {}} className="flex-1" />
                    {rule.type === 'pattern' && <Input placeholder="Regex pattern" value={rule.params?.pattern || ''} onChange={(e) => {}} className="w-40" />}
                    <Button variant="ghost" size="icon" className="text-destructive">×</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm">Add Validation Rule</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {elementType === 'field' && selectedElement.calculation && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Calculation</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2"><Label>Formula</Label><Textarea value={selectedElement.calculation.formula} onChange={(e) => {}} rows={2} placeholder="e.g., field1 + field2 * 0.1" /></div>
                <div className="space-y-2"><Label>Format</Label><Select value={selectedElement.calculation.format || 'number'} onValueChange={(v) => {}}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="number">Number</SelectItem><SelectItem value="currency">Currency</SelectItem><SelectItem value="percent">Percentage</SelectItem></SelectContent></Select></div>
              </CardContent>
            </Card>
          )}
          {elementType === 'field' && selectedElement.conditionalLogic?.length && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Conditional Logic</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{selectedElement.conditionalLogic.length} rule(s) configured</p><Button variant="outline" size="sm">Manage Rules</Button></CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
