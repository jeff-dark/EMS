import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import FilterBar from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePage } from '@inertiajs/react';


type Log = {
  id: number;
  created_at: string;
  user?: { id: number; name: string } | null;
  user_id?: number | null;
  action_type: string;
  action: string;
  status: string;
  target_type?: string | null;
  target_id?: string | null;
  ip_address?: string | null;
  method?: string | null;
  url?: string | null;
};

type PageProps = {
  logs: {
    data: Log[];
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Logs', href: '/admin/logs' },
];

export default function LogsIndex({ logs, filters }: PageProps) {
  // 1. Get the authenticated user from global Inertia props (typed as optional)
  const { auth } = usePage<{ auth?: { user?: { email?: string } } } & PageProps>().props;

  // 2. Define the allowed email
  const ALLOWED_EMAIL = 'jeffkamau8501@gmail.com';

  const [form, setForm] = React.useState({
    from: filters.from || '',
    to: filters.to || '',
    user: filters.user || '',
    type: filters.type || '',
    status: filters.status || '',
    target_type: filters.target_type || '',
    target_id: filters.target_id || '',
    search: filters.search || '',
  });

  const toQuery = (params: Record<string, string>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
    const s = q.toString();
    return s ? `?${s}` : '';
  };

  const indexUrl = '/admin/logs' + toQuery(form);
  const exportUrl = '/admin/logs/export' + toQuery(form);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(indexUrl, {}, { preserveState: true, replace: true });
  };

if (!(auth?.user?.email && auth.user.email === ALLOWED_EMAIL)) {

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Audit Logs" />
      <div className="m-4">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
      </div>
    </AppLayout>
  );
}

return (
  <AppLayout breadcrumbs={breadcrumbs}>
    <Head title="Audit Logs" />
    <div className="m-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Audit Logs</h1>
    </div>

    <form onSubmit={submit}>
      <FilterBar
        right={<Button asChild><a href={exportUrl}>Export CSV</a></Button>}
        onReset={() => setForm({ from:'', to:'', user:'', type:'', status:'', target_type:'', target_id:'', search:'' })}
      >
        <Input type="date" value={form.from} onChange={e=>setForm({...form, from:e.target.value})} />
        <Input type="date" value={form.to} onChange={e=>setForm({...form, to:e.target.value})} />
        <Input value={form.user} onChange={e=>setForm({...form, user:e.target.value})} placeholder="User ID" />
        <Select
          value={form.type || 'any'}
          onValueChange={(v)=>setForm({...form, type: v === 'any' ? '' : v})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            {['authentication','create','update','delete','view','config','import','export'].map(t=> (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={form.status || 'any'}
          onValueChange={(v)=>setForm({...form, status: v === 'any' ? '' : v})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any status</SelectItem>
            {['success','failed','denied'].map(s=> (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={form.target_type} onChange={e=>setForm({...form, target_type:e.target.value})} placeholder="Target Type" />
        <Input value={form.target_id} onChange={e=>setForm({...form, target_id:e.target.value})} placeholder="Target ID" />
        <Input value={form.search} onChange={e=>setForm({...form, search:e.target.value})} placeholder="Search..." />
        <Button type="submit">Filter</Button>
      </FilterBar>
    </form>

    <div className="m-4">
      <Table>
        <TableCaption>Recent audit activity</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.data.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
              <TableCell>{log.user?.name ?? `#${log.user_id ?? ''}`}</TableCell>
              <TableCell>{log.action_type}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>{log.target_type ? `${log.target_type} ${log.target_id ?? ''}` : ''}</TableCell>
              <TableCell>{log.ip_address ?? ''}</TableCell>
              <TableCell>{log.method ?? ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {logs.links && logs.links.length > 0 && (
        <div className="flex gap-2 mt-3">
          {logs.links.map((l, idx) => (
            <Link key={idx} href={l.url || '#'} className={`px-3 py-1 border rounded ${l.active ? 'bg-blue-600 text-white' : ''}`} dangerouslySetInnerHTML={{__html: l.label}} />
          ))}
        </div>
      )}
    </div>
  </AppLayout>
);
}
