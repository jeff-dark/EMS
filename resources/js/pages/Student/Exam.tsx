import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import ExamLayout from '@/layouts/exam-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProctoring } from '@/hooks/useProctoring';

interface Exam {
  id: number;
  title: string;
  duration_minutes: number;
}

interface Question {
  id: number;
  prompt: string;
  points?: number;
  order?: number;
}

interface Session {
  id: number;
  exam_id: number;
  user_id: number;
  started_at?: string;
  submitted_at?: string | null;
}

interface PageProps {
  exam: Exam;
  session: Session;
  questions: Question[];
  proctoring?: {
    enabled: boolean;
    fullscreen_required: boolean;
    block_contextmenu: boolean;
    block_clipboard: boolean;
    block_shortcuts: boolean;
    warn_on_violation: boolean;
    violation_threshold: number;
    counting_types: string[];
    disable_devtool: boolean;
    nosleep: boolean;
    env: string;
  };
}

export default function StudentExam() {
  const { exam, session, questions, proctoring } = usePage().props as unknown as PageProps;
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [saving, setSaving] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  // Initialize client-side proctoring with config-driven behavior
  const p = proctoring ?? ({} as NonNullable<PageProps['proctoring']>);
  useProctoring({
    sessionId: session.id,
    enableFullscreen: p.fullscreen_required ?? true,
    blockContextMenu: p.block_contextmenu ?? true,
    blockClipboard: p.block_clipboard ?? true,
    blockShortcuts: p.block_shortcuts ?? true,
    warnOnViolation: p.warn_on_violation ?? true,
    violationThreshold: p.violation_threshold ?? 2,
    countingTypes: p.counting_types ?? ['exited_fullscreen','tab_hidden'],
    enableDisableDevtool: (p.disable_devtool ?? true) && p.env === 'production',
    enableNoSleep: p.nosleep ?? true,
  });

  // Navigation guards:
  // - Use useProctoring's beforeunload for refresh/close
  // - Intercept browser back/forward (popstate) and anchor clicks to confirm
  React.useEffect(() => {
    // Push a history state so initial Back triggers popstate we can intercept
    const pushStateOnce = () => {
      try { history.pushState(null, '', window.location.href); } catch {}
    };
    pushStateOnce();

    const onPopState = () => {
      if (submitting) return; // allow during submit
      const proceed = window.confirm('You are in an active exam. Leaving this page may cause loss of answers. Continue?');
      if (!proceed) {
        // Re-push current state to neutralize back navigation
        try { history.pushState(null, '', window.location.href); } catch {}
      }
    };

    const onDocumentClick = (e: MouseEvent) => {
      if (submitting) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a');
      if (anchor && (anchor as HTMLAnchorElement).href) {
        const allow = (anchor as HTMLElement).dataset.allowLeave === 'true';
        if (!allow) {
          const proceed = window.confirm('You are in an active exam. Leaving this page may cause loss of answers. Continue?');
          if (!proceed) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', onDocumentClick, true);
    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, [submitting]);

  const handleChange = (qid: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = () => {
    if (!confirm('Submit your exam? You will not be able to change answers after submission.')) return;
    // First persist all answers in one request, then submit the session
    setSubmitting(true);
    const payload = {
      answers: Object.entries(answers).map(([question_id, answer_text]) => ({ question_id: Number(question_id), answer_text })),
    };
    router.post(`/sessions/${session.id}/answers/bulk`, payload, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => {
        router.post(`/sessions/${session.id}/submit`, {}, { preserveScroll: true, preserveState: false });
      }
    });
  };

  return (
    <ExamLayout>
      <Head title={`Exam • ${exam.title}`} />
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_360px]">
        {/* Whole exam card with all questions */}
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 && (
              <p className="text-sm text-muted-foreground">No questions available for this exam.</p>
            )}
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="text-sm font-medium mb-2">Question {idx + 1}</div>
                <div className="whitespace-pre-wrap text-sm leading-6 mb-3">{q.prompt}</div>
                <Textarea
                  rows={6}
                  value={answers[q.id] ?? ''}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit exam card only */}
        <div className="order-1 md:order-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Exam</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">Exam: {exam.title}</div>
              <div className="text-sm">Duration: {exam.duration_minutes} minutes</div>
              <div className="text-xs text-muted-foreground">Session ID: {session.id}</div>
              <div className="pt-2">
                <Button className="w-full" variant="destructive" onClick={handleSubmit} disabled={submitting || saving}>
                  {submitting ? 'Submitting…' : 'Submit Exam'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExamLayout>
  );
}
