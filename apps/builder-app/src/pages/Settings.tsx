'use client';

import { cn } from '@domeforms/ui/lib/utils';
import { Button } from '@domeforms/ui/components/button';
import { Input } from '@domeforms/ui/components/input';
import { Label } from '@domeforms/ui/components/label';
import { Switch } from '@domeforms/ui/components/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@domeforms/ui/components/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@domeforms/ui/components/tabs';


export function Settings() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your DomeForms workspace</p>
      </div>

      <Tabs defaultValue="general" className="flex-1">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 max-w-2xl">
          <Card><CardHeader><CardTitle>Workspace Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Workspace Name</Label><Input placeholder="My Workspace" defaultValue="Default Workspace" /></div>
              <div className="space-y-2"><Label>Default Language</Label><select className="border rounded-md px-3 py-2 w-full"><option>English (US)</option><option>Spanish</option><option>French</option><option>German</option></select></div>
              <div className="space-y-2"><Label>Timezone</Label><select className="border rounded-md px-3 py-2 w-full"><option>UTC</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Tokyo</option></select></div>
              <div className="flex items-center gap-2"><Switch id="maintenance" defaultChecked={false} /><Label htmlFor="maintenance">Maintenance Mode</Label></div>
            </CardContent></Card>

          <Card><CardHeader><CardTitle>Form Defaults</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2"><Switch id="honeypot" defaultChecked={true} /><Label htmlFor="honeypot">Enable Honeypot (Anti-spam)</Label></div>
              <div className="flex items-center gap-2"><Switch id="progress" defaultChecked={true} /><Label htmlFor="progress">Show Progress Bar</Label></div>
              <div className="flex items-center gap-2"><Switch id="keyboard" defaultChecked={true} /><Label htmlFor="keyboard">Enable Keyboard Navigation</Label></div>
              <div className="flex items-center gap-2"><Switch id="autofocus" defaultChecked={true} /><Label htmlFor="autofocus">Auto-focus First Field</Label></div>
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 max-w-2xl">
          <Card><CardHeader><CardTitle>Theme</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Default Theme</Label><select className="border rounded-md px-3 py-2 w-full"><option>Default (Light)</option><option>Dark</option><option>Custom</option></select></div>
              <div className="flex items-center gap-2"><Switch id="animations" defaultChecked={true} /><Label htmlFor="animations">Enable Animations</Label></div>
              <div className="flex items-center gap-2"><Switch id="rounded" defaultChecked={true} /><Label htmlFor="rounded">Rounded Corners</Label></div>
            </CardContent></Card>

          <Card><CardHeader><CardTitle>Email Templates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>From Name</Label><Input placeholder="DomeForms" defaultValue="DomeForms" /></div>
              <div className="space-y-2"><Label>From Email</Label><Input type="email" placeholder="noreply@domeforms.com" defaultValue="noreply@domeforms.com" /></div>
              <div className="space-y-2"><Label>Reply-To Email</Label><Input type="email" placeholder="support@domeforms.com" /></div>
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 max-w-2xl">
          <Card><CardHeader className="flex items-center justify-between"><CardTitle>API Keys</CardTitle><Button size="sm">Generate New Key</Button></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Manage API keys for external integrations</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded"><div><p className="font-mono text-sm">df_live_abc123...</p><p className="text-xs text-muted-foreground">Created Jan 15, 2024 • Last used 2 hours ago</p></div><Button variant="ghost" size="sm">Revoke</Button></div>
                <div className="flex items-center justify-between p-3 bg-muted rounded"><div><p className="font-mono text-sm">df_test_xyz789...</p><p className="text-xs text-muted-foreground">Created Jan 10, 2024 • Never used</p></div><Button variant="ghost" size="sm">Revoke</Button></div>
              </div>
            </CardContent></Card>

          <Card><CardHeader><CardTitle>Webhooks</CardTitle></CardHeader>
            <CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Configure webhook endpoints for form submissions</p><Button variant="outline" size="sm">Add Webhook</Button></CardContent></Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 max-w-2xl">
          <Card className="border-destructive"><CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-4"><p className="text-sm text-muted-foreground">These actions are irreversible</p><div className="flex items-center justify-between p-3 border rounded"><div><p className="font-medium text-destructive">Delete Workspace</p><p className="text-sm text-muted-foreground">Permanently delete this workspace and all data</p></div><Button variant="destructive">Delete Workspace</Button></div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
