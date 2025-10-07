import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import React from 'react';

interface Exam { id: number; title: string; unit_id: number; }
interface Unit { id: number; title: string; course_id: number; }
interface Course { id: number; name: string; }

interface PageProps {
  exam: Exam;
  unit: Unit;
  course: Course;
  errors: Record<string, string>;
  [key: string]: unknown;
}

export default function Create() {
  const { exam, unit, course, errors } = usePage<PageProps>().props;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Courses', href: '/courses' },
    { title: course.name, href: `/courses/${course.id}/units` },
    { title: unit.title, href: `/courses/${course.id}/units/${unit.id}/exams` },
    { title: exam.title, href: `/courses/${course.id}/units/${unit.id}/exams/${exam.id}/edit` },
    { title: 'Questions', href: `/exams/${exam.id}/questions` },
    { title: 'Create', href: `/exams/${exam.id}/questions/create` },
  ];

  function route(name: string): string {
    if (name === 'exams.questions.store') return `/exams/${exam.id}/questions`;
    if (name === 'exams.questions.index') return `/exams/${exam.id}/questions`;
    return '/';
  }

  const { data, setData, post, processing, errors: formErrors } = useForm({
    prompt: '',
    points: 1,
    expected_answer: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('exams.questions.store'));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Create Question • ${exam.title}`} />
      <div className="w-8/12 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <textarea id="prompt" className="w-full border rounded p-2 text-sm" rows={5} value={data.prompt} onChange={e => setData('prompt', e.target.value)} required />
            {formErrors.prompt && <p className="text-red-600 text-xs mt-1">{formErrors.prompt}</p>}
          </div>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" value={data.points} min={0} onChange={e => setData('points', Number(e.target.value))} />
              {formErrors.points && <p className="text-red-600 text-xs mt-1">{formErrors.points}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="expected_answer">Expected Answer (optional)</Label>
            <textarea id="expected_answer" className="w-full border rounded p-2 text-sm" rows={3} value={data.expected_answer} onChange={e => setData('expected_answer', e.target.value)} />
            {formErrors.expected_answer && <p className="text-red-600 text-xs mt-1">{formErrors.expected_answer}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Question'}</Button>
            <Button variant="outline" type="button" onClick={() => window.location.href = route('exams.questions.index')}>Cancel</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}