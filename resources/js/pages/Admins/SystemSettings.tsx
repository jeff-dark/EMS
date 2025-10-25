import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SettingsProps {
  settings: {
    institution_name?: string;
    institution_logo_url?: string | null;
    signatory_name?: string;
    signatory_title?: string;
  };
}

export default function SystemSettingsPage({ settings }: SettingsProps) {
  const { data, setData, post, processing } = useForm({
    institution_name: settings?.institution_name ?? '',
    signatory_name: settings?.signatory_name ?? '',
    signatory_title: settings?.signatory_title ?? '',
    logo: null as File | null,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/system-settings', { forceFormData: true });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'System Settings', href: '/admin/system-settings' }]}> 
      <Head title="System Settings" />
      <div className="p-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Institution Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm" htmlFor="institution_name">Institution Name</label>
                <Input id="institution_name" value={data.institution_name} onChange={e => setData('institution_name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm" htmlFor="signatory_name">Official Signatory Name</label>
                <Input id="signatory_name" value={data.signatory_name} onChange={e => setData('signatory_name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm" htmlFor="signatory_title">Official Signatory Title</label>
                <Input id="signatory_title" value={data.signatory_title} onChange={e => setData('signatory_title', e.target.value)} />
              </div>
              <div>
                <label className="text-sm" htmlFor="logo">Institution Logo (PNG/JPG)</label>
                <Input id="logo" type="file" accept="image/*" onChange={e => setData('logo', e.target.files?.[0] ?? null)} />
                {settings?.institution_logo_url && (
                  <div className="mt-2">
                    <img src={settings.institution_logo_url} alt="Current Logo" className="h-12 w-12 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
