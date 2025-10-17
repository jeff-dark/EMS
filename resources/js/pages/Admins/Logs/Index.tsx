import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

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
    <div className="p-6">
      <Head title="Audit Logs" />
      <h1 className="text-2xl font-semibold mb-4">Audit Logs</h1>
      <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        <input type="date" value={form.from} onChange={e=>setForm({...form, from:e.target.value})} className="border p-2 rounded" placeholder="From" />
        <input type="date" value={form.to} onChange={e=>setForm({...form, to:e.target.value})} className="border p-2 rounded" placeholder="To" />
        <input value={form.user} onChange={e=>setForm({...form, user:e.target.value})} className="border p-2 rounded" placeholder="User ID" />
        <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="border p-2 rounded">
          <option value="">Any Type</option>
          {['authentication','create','update','delete','view','config','import','export'].map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="border p-2 rounded">
          <option value="">Any Status</option>
          {['success','failed','denied'].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={form.target_type} onChange={e=>setForm({...form, target_type:e.target.value})} className="border p-2 rounded" placeholder="Target Type" />
        <input value={form.target_id} onChange={e=>setForm({...form, target_id:e.target.value})} className="border p-2 rounded" placeholder="Target ID" />
        <input value={form.search} onChange={e=>setForm({...form, search:e.target.value})} className="border p-2 rounded col-span-2" placeholder="Search..." />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
        <a href={exportUrl} className="bg-gray-700 text-white px-4 py-2 rounded text-center">Export CSV</a>
      </form>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Target</th>
              <th className="p-2 text-left">IP</th>
              <th className="p-2 text-left">Method</th>
            </tr>
          </thead>
          <tbody>
            {logs.data.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-2">{log.user?.name ?? `#${log.user_id ?? ''}`}</td>
                <td className="p-2">{log.action_type}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">{log.status}</td>
                <td className="p-2">{log.target_type ? `${log.target_type} ${log.target_id ?? ''}` : ''}</td>
                <td className="p-2">{log.ip_address ?? ''}</td>
                <td className="p-2">{log.method ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-3">
        {logs.links.map((l, idx) => (
          <Link key={idx} href={l.url || '#'} className={`px-3 py-1 border rounded ${l.active ? 'bg-blue-600 text-white' : ''}`} dangerouslySetInnerHTML={{__html: l.label}} />
        ))}
      </div>
    </div>
  );
}
