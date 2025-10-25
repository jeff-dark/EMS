import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [overallComment, setOverallComment] = React.useState('');

  const handleChange = (id: number, field: 'points_awarded' | 'comments', value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: field === 'points_awarded' ? Number(value) : value } : r));
  };

  const total = rows.reduce((acc, r) => acc + (Number.isFinite(r.points_awarded as any) ? Number(r.points_awarded) : 0), 0);

  const handleSubmit = () => {
    setSaving(true);
    router.post(grading.grade(session.id).url, { answers: rows.map(r => ({ id: r.id, points_awarded: r.points_awarded })), teacher_comment: overallComment }, {
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
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {rows.map((r, idx) => (
                <div key={r.id} className="rounded-lg border p-4 bg-muted/30">
                  <div className="text-sm font-medium mb-2">Question {idx + 1}</div>
                  <div className="whitespace-pre-wrap text-sm mb-2">{r.question?.prompt}</div>
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap mb-3">Student Answer: {r.answer_text ?? '—'}</div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-32" htmlFor={`points-${r.id}`}>Points awarded</label>
                    <Input id={`points-${r.id}`} type="number" min={0} step={0.01} value={r.points_awarded ?? ''} onChange={e => handleChange(r.id, 'points_awarded', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <div className="text-sm mb-2">Total Score: <span className="font-mono font-semibold">{total.toFixed(2)}</span></div>
              <label className="text-sm font-medium" htmlFor="overall-comment">Overall comment</label>
              <Textarea id="overall-comment" rows={4} placeholder="Write feedback for the whole exam..." value={overallComment} onChange={e => setOverallComment(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Button asChild variant="subtle">
                <a href={`/grading/session/${session.id}/preview-pdf`} target="_blank" rel="noopener noreferrer">Preview Result PDF</a>
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>Save Grading</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
