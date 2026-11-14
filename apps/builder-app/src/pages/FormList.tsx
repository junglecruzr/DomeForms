import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Copy, Eye, Download, MoreVertical } from 'lucide-react';
import { Button } from '@domeforms/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@domeforms/ui/components/card';
import { Input } from '@domeforms/ui/components/input';
import { Badge } from '@domeforms/ui/components/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@domeforms/ui/components/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

function FormCard({ form, onEdit, onDuplicate, onDelete, onView, onExport }: any) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{form.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{form.description || 'No description'}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onView}><Eye className="h-4 w-4 mr-2" />Preview</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}><Download className="h-4 w-4 mr-2" />Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{form.pages?.length || 0} page{form.pages?.length > 1 ? 's' : ''}</Badge>
          <Badge variant={form.status === 'PUBLISHED' ? 'default' : 'outline'}>{form.status}</Badge>
          <Badge variant="outline">{form.version} version{form.version > 1 ? 's' : ''}</Badge>
        </div>
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <span className="text-xs text-muted-foreground">Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
          <Button variant="outline" size="sm" onClick={onEdit}>Open Builder</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FormList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['forms', search, statusFilter],
    queryFn: () => api.getForms({ search, status: statusFilter !== 'all' ? statusFilter : undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createForm(data),
    onSuccess: (form) => { queryClient.invalidateQueries({ queryKey: ['forms'] }); navigate(`/builder/${form.id}`); },
  });

  const deleteMutation = useMutation({ mutationFn: (id: string) => api.deleteForm(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forms'] }) });
  const duplicateMutation = useMutation({ mutationFn: (id: string) => api.duplicateForm(id), onSuccess: (form) => { queryClient.invalidateQueries({ queryKey: ['forms'] }); navigate(`/builder/${form.id}`); } });

  const handleCreate = () => createMutation.mutate({ name: 'Untitled Form', workspaceId: 'default' });
  const filteredForms = data?.forms?.filter((f: any) => f.name.toLowerCase().includes(search.toLowerCase()) && (statusFilter === 'all' || f.status === statusFilter)) || [];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold">Forms</h1><p className="text-muted-foreground">Manage your forms</p></div>
        <Button onClick={handleCreate} disabled={createMutation.isPending}><Plus className="h-4 w-4 mr-2" /> Create Form</Button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search forms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background"><option value="all">All Status</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select>
      </div>
      {isLoading ? <div className="flex-1 flex items-center justify-center">Loading...</div> : filteredForms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center"><div className="text-6xl mb-4">📝</div><h2 className="text-xl font-semibold mb-2">No forms yet</h2><p className="text-muted-foreground mb-6">Create your first form to get started</p><Button onClick={handleCreate} size="lg"><Plus className="h-4 w-4 mr-2" /> Create Form</Button></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 flex-1 overflow-y-auto">
          {filteredForms.map((form: any) => (
            <FormCard key={form.id} form={form} onEdit={() => navigate(`/builder/${form.id}`)} onView={() => window.open(`/preview/${form.id}`, '_blank')} onDuplicate={() => duplicateMutation.mutate(form.id)} onDelete={() => { if (confirm('Delete this form?')) deleteMutation.mutate(form.id); }} onExport={() => { const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = form.name.replace(/\s+/g, '-').toLowerCase() + '.json'; a.click(); URL.revokeObjectURL(url); }} />
          ))}
        </div>
      )}
    </div>
  );
}
