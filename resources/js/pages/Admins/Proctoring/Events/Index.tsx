import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface Exam { id: number; title: string }
interface EventRow {
  id: number;
  exam_session_id: number;
  user: { id: number; name: string; email: string };
  session: { exam: { id: number; title: string } };
  type: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

interface PageProps {
  events: {
    data: EventRow[];
    links: any[];
    meta?: any;
  };
  filters: {
    exam_id?: number | null;
    session_id?: number | null;
    user_id?: number | null;
    type?: string | null;
    from?: string | null;
    to?: string | null;
  };
  exams: Exam[];
  summaryByType: { type: string; count: number }[];
  summaryBySession: { exam_session_id: number; count: number }[];
}

export default function ProctorEventsIndex() {
  const { events, filters, exams, summaryByType, summaryBySession } = usePage().props as unknown as PageProps;
  const [local, setLocal] = React.useState(filters);

  const submitFilters = () => {
    router.get('/admin/proctor/events', local, { preserveState: true, preserveScroll: true });
  };

  return (
  <AppLayout breadcrumbs={[{ title: 'Admin', href: '/admins' }, { title: 'Proctoring', href: '/admin/proctor/events' }]}>
      <Head title="Proctoring Events" />

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Exam</label>
              <select className="w-full border rounded p-2" value={local.exam_id ?? ''} onChange={(e) => setLocal({ ...local, exam_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">All</option>
                {exams.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Session ID</label>
              <Input value={local.session_id ?? ''} onChange={(e) => setLocal({ ...local, session_id: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">User ID</label>
              <Input value={local.user_id ?? ''} onChange={(e) => setLocal({ ...local, user_id: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <Input value={local.type ?? ''} onChange={(e) => setLocal({ ...local, type: e.target.value || null })} placeholder="exited_fullscreen" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Input type="date" value={local.from ?? ''} onChange={(e) => setLocal({ ...local, from: e.target.value || null })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Input type="date" value={local.to ?? ''} onChange={(e) => setLocal({ ...local, to: e.target.value || null })} />
            </div>
            <div className="md:col-span-6">
              <Button onClick={submitFilters}>Apply</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Counts by Type</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {summaryByType.map(s => (
                  <li key={s.type} className="flex justify-between"><span>{s.type}</span><span className="font-mono">{s.count}</span></li>
                ))}
                {summaryByType.length === 0 && <div className="text-xs text-muted-foreground">No data</div>}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Top Sessions by Violations</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {summaryBySession.map(s => (
                  <li key={s.exam_session_id} className="flex justify-between">
                    <span>Session #{s.exam_session_id}</span>
                    <span className="font-mono">{s.count}</span>
                  </li>
                ))}
                {summaryBySession.length === 0 && <div className="text-xs text-muted-foreground">No data</div>}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Events</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="py-2">Time</th>
                    <th>Session</th>
                    <th>Exam</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data.map(ev => (
                    <tr key={ev.id} className="border-t">
                      <td className="py-2 whitespace-nowrap">{new Date(ev.created_at).toLocaleString()}</td>
                      <td>#{ev.exam_session_id}</td>
                      <td>{ev.session?.exam?.title ?? '-'}</td>
                      <td>{ev.user?.name ?? '-'}<div className="text-xs text-muted-foreground">{ev.user?.email}</div></td>
                      <td><span className="font-mono">{ev.type}</span></td>
                      <td className="max-w-[320px] truncate" title={JSON.stringify(ev.details)}>{ev.details ? JSON.stringify(ev.details) : '-'}</td>
                    </tr>
                  ))}
                  {events.data.length === 0 && (
                    <tr><td className="py-4 text-xs text-muted-foreground" colSpan={6}>No events</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
