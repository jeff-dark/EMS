import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Create New Question',
    href: '/questions/create',
  },
];



interface Exam {
  id: number;
  title: string;
}

interface PageProps {
  exam: Exam;
  errors: Record<string, string>;
  [key: string]: unknown;
}

export default function Create() {
  const { exam, errors } = usePage<PageProps>().props;

  function route(name: string, id?: number): string {
    // Simple implementation for demonstration purposes
    // In a real app, you might use a route helper or config
    if (name === 'exams.questions.store' && id !== undefined) {
      return `/exams/${id}/questions`;
    }
    return '/';
  }

  const { data, setData, post, processing, errors: formErrors } = useForm({
    prompt: '',
    points: 1,
    expected_answer: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('exams.questions.store', exam.id));
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Questions', href: `/exams/${exam.id}/questions` }, { title: 'Create New Question', href: `/exams/${exam.id}/questions/create` }]}>
      <Head title={`Create New Question ${exam.title}`} />
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
          <div className="flex gap-2">
            <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Question'}</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}