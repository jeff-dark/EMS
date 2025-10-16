import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import grading from '@/routes/grading';

interface SessionItem {
  id: number;
  submitted_at: string;
  score?: number | null;
  is_graded: boolean;
  exam: { id: number; title: string; unit?: { id: number; title: string } };
  user: { id: number; name: string; email: string };
}

interface PageProps { sessions: SessionItem[]; [key: string]: unknown }

export default function GradingIndex() {
  const { sessions } = usePage<PageProps>().props;
  return (
    <AppLayout breadcrumbs={[{ title: 'Grading', href: grading.index().url }]}> 
      <Head title="Submitted Exams" />
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Submitted Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No submitted exams awaiting grading.</TableCell>
                    </TableRow>
                  )}
                  {sessions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.user.name}</TableCell>
                      <TableCell>{s.exam.title}</TableCell>
                      <TableCell>{s.exam.unit?.title ?? '-'}</TableCell>
                      <TableCell>{new Date(s.submitted_at).toLocaleString()}</TableCell>
                      <TableCell>{s.is_graded ? 'Graded' : 'Pending'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={grading.session(s.id).url} className="text-primary hover:underline">Grade</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
