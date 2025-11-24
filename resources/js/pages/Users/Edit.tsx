import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Role { id: number; name: string }
interface User { id: number; name: string; email: string; username?: string | null; role?: Role | null }
interface PageProps { user: User; roles: Role[]; errors: Record<string, string>; flash?: { message?: string; success?: string }; [key: string]: any }

export default function Edit() {
  const page = usePage<PageProps>().props;
  const { user, roles } = page;

  // Debug: show page props when VITE_DEBUG_INERTIA=true (set in your .env) to help trace blank page issues
  const debugProps = Boolean(import.meta?.env?.VITE_DEBUG_INERTIA);

  // mirror Students/Edit layout and form style
  const { data, setData, put, processing, errors } = useForm({
    name: user?.name ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
    role_id: user?.role?.id ? String(user.role.id) : '',
  });

  function route(name: string, id?: number) {
    if (name === 'users.update' && id) return `/users/${id}`;
    if (name === 'users.index') return '/users';
    return '/';
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('users.update', user.id));
  };

  // If user props are missing, show a helpful message instead of crashing the page
  if (!user) {
    return (
      <AppLayout breadcrumbs={[{ title: 'Users', href: '/users' } as BreadcrumbItem]}>
        <Head title={`Edit User`} />
        <div className="p-6">
          <Alert>
            <OctagonAlert />
            <AlertTitle>User data missing</AlertTitle>
            <AlertDescription>Please refresh the page or go back to the users list. If the problem persists, check server logs for errors.</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Users', href: '/users' } as BreadcrumbItem, { title: 'Edit', href: `/users/${user.id}/edit` } as BreadcrumbItem]}>
      <Head title={`Edit User • ${user.name}`} />
      <div className='w-8/12 p-4'>
        {debugProps && (
          <div className="mb-4">
            <h2 className="text-sm font-medium">Debug: page props</h2>
            <pre className="text-xs bg-black text-white p-2 overflow-auto max-h-64">{JSON.stringify(page, null, 2)}</pre>
          </div>
        )}
        <form onSubmit={handleUpdate} className='space-y-4'>
          {/* Display validation errors (form-level) */}
          {Object.keys(errors).length > 0 && (
            <Alert>
              <OctagonAlert />
              <AlertTitle>Errors</AlertTitle>
              <AlertDescription>
                {Object.values(errors).map((error: any, index: number) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div className='gap-2'>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
          </div>

          <div className='gap-2'>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type='email' value={data.email} onChange={e => setData('email', e.target.value)} />
          </div>

          <div className='gap-2'>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={data.username} onChange={e => setData('username', e.target.value)} />
          </div>

          <div className='gap-2'>
            <Label>Role</Label>
            <Select value={data.role_id} onValueChange={(val) => setData('role_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">(none)</SelectItem>
                {roles?.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex gap-2'>
            <Button type='submit' disabled={processing}>{processing ? 'Saving...' : 'Update User'}</Button>
            <Button variant='outline' type='button' onClick={() => window.location.href = route('users.index')}>Back</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
