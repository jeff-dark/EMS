import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import FilterBar from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Audit Logs" />
      <div className="m-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Audit Logs</h1>
      </div>

      <form onSubmit={submit}>
        <FilterBar
          right={<a href={exportUrl}><Button>Export CSV</Button></a>}
          onReset={() => setForm({ from:'', to:'', user:'', type:'', status:'', target_type:'', target_id:'', search:'' })}
        >
          <Input type="date" value={form.from} onChange={e=>setForm({...form, from:e.target.value})} placeholder="From" />
          <Input type="date" value={form.to} onChange={e=>setForm({...form, to:e.target.value})} placeholder="To" />
          <Input value={form.user} onChange={e=>setForm({...form, user:e.target.value})} placeholder="User ID" />
          <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="border rounded px-3 py-2">
            <option value="">Any Type</option>
            {['authentication','create','update','delete','view','config','import','export'].map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="border rounded px-3 py-2">
            <option value="">Any Status</option>
            {['success','failed','denied'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
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
