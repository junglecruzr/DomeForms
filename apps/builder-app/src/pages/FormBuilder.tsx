import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import { useFormStore } from '../store/form-store';
import { BuilderCanvas } from '../components/canvas/BuilderCanvas';
import { FieldPalette } from '../components/panels/FieldPalette';
import { PropertyPanel } from '../components/panels/PropertyPanel';
import { LayerTree } from '../components/panels/LayerTree';
import { Card, CardContent } from '@domeforms/ui/components/card';
import { Separator } from '@domeforms/ui/components/separator';

export function FormBuilder() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { form, setForm, isDirty, isSaving, setSaving } = useFormStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => api.getForm(formId!),
    enabled: !!formId,
  });

  const saveMutation = useMutation({
    mutationFn: (formData: any) => api.updateForm(formId!, formData),
    onMutate: async (newForm) => {
      await queryClient.cancelQueries({ queryKey: ['form', formId] });
      const previous = queryClient.getQueryData(['form', formId]);
      queryClient.setQueryData(['form', formId], newForm);
      return { previous };
    },
    onError: (err, newForm, context) => {
      if (context?.previous) queryClient.setQueryData(['form', formId], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
    onSettled: () => {
      setSaving(false);
    },
  });

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form, setForm]);

  const handleSave = () => {
    if (!form) return;
    setSaving(true);
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to load form</h2>
              <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
              <button onClick={() => navigate('/')} className="text-primary hover:underline">
                Back to forms
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-row overflow-hidden">
      {/* Left Panel - Field Palette */}
      <aside className="w-72 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Elements</h3>
          <p className="text-xs text-muted-foreground">Drag to canvas</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <FieldPalette />
        </div>
      </aside>

      {/* Center - Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <BuilderCanvas />
      </main>

      {/* Right Panel - Properties & Layers */}
      <aside className="w-80 border-l bg-card flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Properties</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <PropertyPanel />
        </div>
        <Separator />
        <div className="p-4 border-t">
          <h3 className="font-semibold mb-2">Layers</h3>
          <LayerTree />
        </div>
      </aside>
    </div>
  );
}