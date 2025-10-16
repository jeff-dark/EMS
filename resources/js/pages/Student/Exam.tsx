import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
}

export default function StudentExam() {
  const { exam, session, questions } = usePage().props as unknown as PageProps;
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [saving, setSaving] = React.useState<boolean>(false);

  const activeQuestion = questions[activeIndex];

  const saveAnswer = async (questionId: number, answerText: string) => {
    setSaving(true);
    try {
      await router.post(
        `/sessions/${session.id}/answer`,
        { question_id: questionId, answer_text: answerText },
        { preserveScroll: true, preserveState: true, onError: () => {}, onFinish: () => setSaving(false) }
      );
    } catch (e) {
      setSaving(false);
    }
  };

  const handleChange = (qid: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSave = () => {
    if (!activeQuestion) return;
    const value = answers[activeQuestion.id] ?? '';
    void saveAnswer(activeQuestion.id, value);
  };

  const handlePrev = () => setActiveIndex((i) => Math.max(i - 1, 0));
  const handleNext = () => setActiveIndex((i) => Math.min(i + 1, questions.length - 1));

  const handleSubmit = () => {
    if (!confirm('Submit your exam? You will not be able to change answers after submission.')) return;
    // First persist all answers in one request, then submit the session
    const payload = {
      answers: Object.entries(answers).map(([question_id, answer_text]) => ({ question_id: Number(question_id), answer_text })),
    };
    router.post(`/sessions/${session.id}/answers/bulk`, payload, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => {
        router.post(`/sessions/${session.id}/submit`);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Exams', href: '/exams' }, { title: exam.title, href: `/exams/${exam.id}/start` }]}> 
      <Head title={`Exam • ${exam.title}`} />
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_320px]">
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>
              Question {activeIndex + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeQuestion ? (
              <>
                <div className="whitespace-pre-wrap text-sm leading-6">{activeQuestion.prompt}</div>
                <Textarea
                  rows={8}
                  value={answers[activeQuestion.id] ?? ''}
                  onChange={(e) => handleChange(activeQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                />
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={handlePrev} disabled={activeIndex === 0}>Previous</Button>
                  <Button variant="secondary" onClick={handleNext} disabled={activeIndex === questions.length - 1}>Next</Button>
                  <Button onClick={handleSave} disabled={saving}>Save</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No question selected.</p>
            )}
          </CardContent>
        </Card>

        <div className="order-1 md:order-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{exam.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Duration: {exam.duration_minutes} minutes</div>
              <div className="text-xs text-muted-foreground">Session ID: {session.id}</div>
              <div className="pt-2">
                <Button className="w-full" variant="destructive" onClick={handleSubmit}>Submit Exam</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => (
                  <Button
                    key={q.id}
                    variant={idx === activeIndex ? 'default' : 'secondary'}
                    onClick={() => setActiveIndex(idx)}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
