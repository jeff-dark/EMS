import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Questions',
    href: '/questions',
  },
];

interface Question {
  id: number;
  prompt: string;
  points: number;
  answer_key?: { id: number; answer: string }[];
}

interface Exam {
  id: number;
  title: string;
}

interface PageProps {
  exam: Exam;
  questions: Question[];
}

export default function Index() {

  const { questions, flash } = usePage().props as PageProps;

  const { processing, delete: destroy } = useForm();

  const handleDelete = (id: number, prompt: string) => {
    // Implement delete functionality here
    if (confirm(`Are you sure you want to delete question ${id} - ${prompt}?`)) {
      destroy(route('questions.destroy', id));
    }
  };

  // Simple implementation assuming route names map directly to paths
  function route(name: string, param?: number): string {
    const routes: Record<string, (param?: number) => string> = {
      'questions.create': () => '/questions/create',
      'questions.edit': (id?: number) => `/questions/${id}/edit`,
      'questions.destroy': (id?: number) => `/questions/${id}`,
      // Add more routes as needed
    };
    return routes[name] ? routes[name](param) : '/';
  }
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Questions" />
      <div className="mb-4">
        <Link href={route('questions.create')} className="text-blue-600 hover:underline">New Question</Link>
      </div>
      <div className="mb-4">
        <div>
          {flash?.message && (
          <Alert>
            <Bell />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {flash.message}
              </AlertDescription>
          </Alert>
        )}
        </div>
      </div>

      {questions.length === 0 && (
        <div className="m-4">
          <Table>
            <TableCaption>I list of Questions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Prompt</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Expected Answer</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-md truncate" title={question.prompt}>{question.prompt}</TableCell>
                  <TableCell className="text-center">{question.points}</TableCell>
                  <TableCell className="text-xs">{question.answer_key?.[0]?.answer || <span className="text-gray-400">—</span>}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={route('questions.edit', question.id)} className="text-blue-600 hover:underline">Edit</Link>
                    <Button variant="destructive" onClick={() => handleDelete(question.id, question.prompt)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      </AppLayout>
  );
}