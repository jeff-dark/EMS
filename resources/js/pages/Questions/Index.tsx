import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import ActionMenu from '@/components/ui/action-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import FilterBar from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
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

interface Exam { id: number; title: string; unit_id: number; }
interface Unit { id: number; title: string; course_id: number; }
interface Course { id: number; name: string; }

interface PageProps {
  exam: Exam;
  unit: Unit;
  course: Course;
  questions: Question[];
  flash?: { message?: string };
  [key: string]: any;
}

export default function Index() {
  const { exam, unit, course, questions, flash } = usePage<PageProps>().props;
  const page: any = usePage();
  const role: string | undefined = page?.props?.auth?.role || page?.props?.authUser?.role;

  const { processing, delete: destroy } = useForm();

  const [q, setQ] = useState("");
  const [minPoints, setMinPoints] = useState<string>("");
  const [maxPoints, setMaxPoints] = useState<string>("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const min = Number(minPoints);
    const hasMin = !Number.isNaN(min) && minPoints !== "";
    const max = Number(maxPoints);
    const hasMax = !Number.isNaN(max) && maxPoints !== "";
    return questions.filter((qu) => {
      const matchesText = !term || (qu.prompt ?? '').toLowerCase().includes(term);
      const matchesMin = !hasMin || qu.points >= min;
      const matchesMax = !hasMax || qu.points <= max;
      return matchesText && matchesMin && matchesMax;
    });
  }, [questions, q, minPoints, maxPoints]);

  // Local route helper (would normally use Ziggy)
  function route(name: string, params?: { exam?: number; question?: number }): string {
    const examId = params?.exam ?? exam.id;
    const questionId = params?.question;
    const base = `/exams/${examId}/questions`;
    switch (name) {
      case 'exams.questions.index': return base;
      case 'exams.questions.create': return `${base}/create`;
      case 'exams.questions.edit': return `${base}/${questionId}/edit`;
      case 'exams.questions.destroy': return `${base}/${questionId}`;
      default: return '/';
    }
  }

  const handleDelete = (id: number, prompt: string) => {
    if (confirm(`Are you sure you want to delete question ${id} - ${prompt}?`)) {
      destroy(route('exams.questions.destroy', { question: id }));
    }
  };
  return (
    <AppLayout breadcrumbs={[
      { title: 'Courses', href: '/courses' },
      { title: course.name, href: `/courses/${course.id}/units` },
      { title: unit.title, href: `/courses/${course.id}/units/${unit.id}/exams` },
      { title: exam.title, href: `/courses/${course.id}/units/${unit.id}/exams/${exam.id}/edit` },
      { title: 'Questions', href: route('exams.questions.index') },
    ]}>
      <Head title={`Questions • ${exam.title}`} />
      <div className="m-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Questions - {exam.title}</h1>
        {role && role !== 'student' ? (
          <Link href={route('exams.questions.create')}><Button>Create Question</Button></Link>
        ) : null}
      </div>
      <FilterBar onReset={() => { setQ(""); setMinPoints(""); setMaxPoints(""); }}>
        <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search prompt" />
        <Input value={minPoints} onChange={(e)=>setMinPoints(e.target.value)} placeholder="Min points" type="number" />
        <Input value={maxPoints} onChange={(e)=>setMaxPoints(e.target.value)} placeholder="Max points" type="number" />
      </FilterBar>
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
      {filtered.length > 0 ? (
        <div className="m-4">
          <Table>
            <TableCaption>List of questions for this exam</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Prompt</TableHead>
                <TableHead className="w-24">Points</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(question => (
                <TableRow
                  key={question.id}
                >
                  <TableCell className="max-w-md truncate" title={question.prompt}>{question.prompt}</TableCell>
                  <TableCell>{question.points}</TableCell>
                  <TableCell>
                    <ActionMenu
                      items={[
                        { label: 'Edit', href: route('exams.questions.edit', { question: question.id }) },
                        { label: 'Delete', onClick: () => handleDelete(question.id, question.prompt), variant: 'destructive', disabled: processing },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="m-4 text-center text-gray-500">No questions found for this exam.</div>
      )}
      </AppLayout>
  );
}