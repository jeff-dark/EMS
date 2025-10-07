import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';

interface AnswerKey { id: number; answer: string; }
interface Question { id: number; prompt: string; points: number; answer_key?: AnswerKey[]; }
interface Exam { id: number; title: string; }
interface PageProps { exam: Exam; question: Question; answerKey?: AnswerKey[]; errors: Record<string, string>; }

export default function Edit({ exam, question, answerKey = [], errors }: PageProps) {
  function route(name: string, id?: number): string {
    // Simple implementation for demonstration purposes
    // In a real app, you might use a route helper or config
    if (name === 'exams.questions.update' && id !== undefined) {
      return `/exams/${exam.id}/questions/${id}`;
    }
    return '/';
  }

  const [prompt, setPrompt] = React.useState(question.prompt);
  const [points, setPoints] = React.useState(question.points);
  const [expectedAnswer, setExpectedAnswer] = React.useState(answerKey.length > 0 ? answerKey[0].answer : '');

  const { data, setData, put, processing: submitting } = useForm({
    prompt: question.prompt,
    points: question.points,
    expected_answer: expectedAnswer,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('exams.questions.update', question.id));
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Questions', href: `/exams/${exam.id}/questions` }, { title: 'Edit Question', href: `/exams/${exam.id}/questions/${question.id}/edit` }]}>
      <Head title={`Edit Question ${exam.title}`} />
      <div className="p-6 max-w-2xl space-y-6">
        <h1 className="text-xl font-semibold">Edit Question {exam.title}</h1>
        <form onSubmit={submit} className="space-y-4">
          {/* Display validation errors */}
          {Object.keys(errors).length > 0 && (
            <Alert>
              <OctagonAlert />
              <AlertTitle>Errors</AlertTitle>
              <AlertDescription>
                {Object.values(errors).map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div className='gap-2'>
            <Label htmlFor="prompt">Prompt</Label>
            <textarea id="prompt" className="w-full border rounded p-2 text-sm" rows={5} value={prompt} onChange={e => { setPrompt(e.target.value); setData('prompt', e.target.value); }} />
          </div>
          <div className='gap-2'>
            <Label htmlFor="points">Points</Label>
            <Input id="points" type="number" value={points} onChange={e => { setPoints(Number(e.target.value)); setData('points', Number(e.target.value)); }} />
          </div>
          <div className='flex gap-2'>
            <Button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Question'}</Button>
            <Button variant="outline" type="button" onClick={() => router.get(`/exams/${exam.id}/questions`)}>Back</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}