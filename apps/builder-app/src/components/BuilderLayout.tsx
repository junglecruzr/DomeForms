import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Palette, Plus, ChevronLeft, ChevronRight, Save, Eye, Undo, Redo, Download, Upload, Code } from 'lucide-react';
import { Button } from '@domeforms/ui/components/button';
import { Card } from '@domeforms/ui/components/card';
import { Separator } from '@domeforms/ui/components/separator';
import { useFormStore } from '../store/form-store';
import { cn } from '@domeforms/ui/lib/utils';

export function BuilderLayout() {
  const location = useLocation();
  const { form, isDirty, isSaving, previewMode, canUndo, canRedo, undo, redo, setPreviewMode } = useFormStore();
  
  const handleSave = async () => {
    // TODO: Implement save to API
    console.log('Save form', form);
  };

  const handleExport = () => {
    if (!form) return;
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        useFormStore.getState().setForm(imported);
      } catch (err) {
        console.error('Import failed', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Palette className="h-6 w-6" />
            DomeForms
          </NavLink>
          <Separator orientation="vertical" className="h-6" />
          <NavLink 
            to="/" 
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors', 
              location.pathname === '/' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
          >
            <LayoutDashboard className="h-4 w-4 mr-1" />
            Forms
          </NavLink>
          <NavLink 
            to="/themes" 
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/themes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
          >
            <Palette className="h-4 w-4 mr-1" />
            Themes
          </NavLink>
          <NavLink 
            to="/settings" 
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </NavLink>
        </div>
        
        <div className="flex items-center gap-2">
          {form && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={undo} 
                disabled={!canUndo()}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={redo} 
                disabled={!canRedo()}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={handleExport} title="Export JSON">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" title="Import JSON">
                <Upload className="h-4 w-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImport}
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                variant={previewMode ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave} 
                disabled={isSaving || !isDirty}
                className="ml-2"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}