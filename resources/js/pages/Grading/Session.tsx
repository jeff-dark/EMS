import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import grading from '@/routes/grading';

interface AnswerRow { id: number; answer_text?: string | null; points_awarded?: number | null; comments?: string | null; question: { id: number; prompt: string; points?: number | null } }
interface SessionData { id: number; user: { id: number; name: string }; exam: { id: number; title: string }; student_answers?: AnswerRow[]; studentAnswers?: AnswerRow[] }
interface PageProps { session: SessionData; [key: string]: unknown }

export default function GradingSession() {
  const { session } = usePage<PageProps>().props;
  // normalize answers field name from Laravel
  const answers = (session as any).student_answers ?? (session as any).studentAnswers ?? [];
  const [rows, setRows] = React.useState<AnswerRow[]>(answers);
  const [saving, setSaving] = React.useState(false);

  const handleChange = (id: number, field: 'points_awarded' | 'comments', value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: field === 'points_awarded' ? Number(value) : value } : r));
  };

  const total = rows.reduce((acc, r) => acc + (Number.isFinite(r.points_awarded as any) ? Number(r.points_awarded) : 0), 0);

  const handleSubmit = () => {
    setSaving(true);
    router.post(grading.grade(session.id).url, { answers: rows.map(r => ({ id: r.id, points_awarded: r.points_awarded, comments: r.comments })) }, {
      onFinish: () => setSaving(false)
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Grading', href: grading.index().url }, { title: session.exam.title, href: grading.session(session.id).url }]}> 
      <Head title={`Grade • ${session.exam.title}`} />
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Grade: {session.exam.title} — {session.user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Question</TableHead>
                    <TableHead>Student Answer</TableHead>
                    <TableHead className="w-28">Points</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-pre-wrap text-sm">{r.question?.prompt}</TableCell>
                      <TableCell className="whitespace-pre-wrap text-xs text-muted-foreground max-w-[400px]">{r.answer_text ?? '—'}</TableCell>
                      <TableCell>
                        <Input type="number" min={0} step={0.01} value={r.points_awarded ?? ''} onChange={e => handleChange(r.id, 'points_awarded', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Textarea rows={2} value={r.comments ?? ''} onChange={e => handleChange(r.id, 'comments', e.target.value)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm">Total Score: <span className="font-mono font-semibold">{total.toFixed(2)}</span></div>
              <Button onClick={handleSubmit} disabled={saving}>Save Grading</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
