import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';

interface AnswerKey { id: number; answer: string; }
interface Question { id: number; prompt: string; points: number; answer_key?: AnswerKey[]; }
interface Exam { id: number; title: string; unit_id: number; }
interface Unit { id: number; title: string; course_id: number; }
interface Course { id: number; name: string; }
interface PageProps { exam: Exam; unit: Unit; course: Course; question: Question; answerKey?: AnswerKey[]; errors: Record<string, string>; [key: string]: any; }

export default function Edit(props: PageProps) {
  const { exam, unit, course, question, answerKey = [], errors } = usePage<PageProps>().props;

  function route(name: string): string {
    if (name === 'exams.questions.update') return `/exams/${exam.id}/questions/${question.id}`;
    if (name === 'exams.questions.index') return `/exams/${exam.id}/questions`;
    return '/';
  }

  const [prompt, setPrompt] = React.useState(question.prompt);
  const [points, setPoints] = React.useState(question.points);
  const [expectedAnswer, setExpectedAnswer] = React.useState(answerKey.length > 0 ? answerKey[0].answer : '');

  const { data, setData, put, processing: submitting, errors: formErrors } = useForm({
    prompt: question.prompt,
    points: question.points,
    expected_answer: expectedAnswer,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('exams.questions.update'));
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Courses', href: '/courses' },
      { title: course.name, href: `/courses/${course.id}/units` },
      { title: unit.title, href: `/courses/${course.id}/units/${unit.id}/exams` },
      { title: exam.title, href: `/courses/${course.id}/units/${unit.id}/exams/${exam.id}/edit` },
      { title: 'Questions', href: route('exams.questions.index') },
      { title: 'Edit', href: `/exams/${exam.id}/questions/${question.id}/edit` },
    ]}>
      <Head title={`Edit Question • ${exam.title}`} />
      <div className="p-6 max-w-2xl space-y-6">
        <h1 className="text-xl font-semibold">Edit Question - {exam.title}</h1>
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
            {formErrors?.prompt && <p className="text-xs text-red-600 mt-1">{formErrors.prompt}</p>}
          </div>
          <div className='gap-2'>
            <Label htmlFor="points">Points</Label>
            <Input id="points" type="number" value={points} onChange={e => { setPoints(Number(e.target.value)); setData('points', Number(e.target.value)); }} />
            {formErrors?.points && <p className="text-xs text-red-600 mt-1">{formErrors.points}</p>}
          </div>
          <div className='gap-2'>
            <Label htmlFor="expected_answer">Expected Answer (optional)</Label>
            <textarea id="expected_answer" className="w-full border rounded p-2 text-sm" rows={3} value={expectedAnswer} onChange={e => { setExpectedAnswer(e.target.value); setData('expected_answer', e.target.value); }} />
            {formErrors?.expected_answer && <p className="text-xs text-red-600 mt-1">{formErrors.expected_answer}</p>}
          </div>
          <div className='flex gap-2'>
            <Button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Question'}</Button>
            <Button variant="outline" type="button" onClick={() => window.location.href = route('exams.questions.index')}>Back</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}