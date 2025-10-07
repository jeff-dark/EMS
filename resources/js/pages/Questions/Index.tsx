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
  flash?: { message?: string };
  [key: string]: any;
}

export default function Index() {
  const { exam, questions, flash } = usePage<PageProps>().props;

  const { delete: destroy } = useForm();

  // Local route helper (would normally use Ziggy)
  function route(name: string, params: { exam?: number; question?: number } = {}): string {
    const examId = params.exam ?? exam.id;
    const questionId = params.question;
    switch (name) {
      case 'exams.questions.create':
        return `/exams/${examId}/questions/create`;
      case 'exams.questions.edit':
        return `/exams/${examId}/questions/${questionId}/edit`;
      case 'exams.questions.destroy':
        return `/exams/${examId}/questions/${questionId}`;
      case 'exams.questions.index':
        return `/exams/${examId}/questions`;
      default:
        return '/';
    }
  }

  const handleDelete = (id: number, prompt: string) => {
    if (confirm(`Are you sure you want to delete question ${id} - ${prompt}?`)) {
      destroy(route('exams.questions.destroy', { exam: exam.id, question: id }));
    }
  };
  return (
    <AppLayout breadcrumbs={[{ title: 'Exam Questions', href: route('exams.questions.index') }]}>
      <Head title={`Questions | ${exam.title}`} />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Questions for: {exam.title}</h1>
        <Link href={route('exams.questions.create')}><Button>New Question</Button></Link>
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
      {questions.length > 0 ? (
        <div className="m-4 border rounded-md overflow-hidden">
          <Table>
            <TableCaption>Question list.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Prompt</TableHead>
                <TableHead className="w-24 text-center">Points</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-md truncate" title={question.prompt}>{question.prompt}</TableCell>
                  <TableCell className="text-center">{question.points}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={route('exams.questions.edit', { question: question.id })} className="text-blue-600 hover:underline">Edit</Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(question.id, question.prompt)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="m-4 p-6 text-sm text-muted-foreground border rounded-md bg-background">
          <p>No questions have been added to this exam yet.</p>
          <p className="mt-2"><Link className="text-blue-600 hover:underline" href={route('exams.questions.create')}>Create the first question</Link></p>
        </div>
      )}
      </AppLayout>
  );
}