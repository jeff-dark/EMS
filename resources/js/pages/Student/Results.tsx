import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ResultItem {
  id: number;
  submitted_at: string | null;
  is_graded: boolean;
  score?: number | null;
  exam: { id: number; title: string };
}

interface PageProps { sessions: ResultItem[]; [key: string]: unknown }

export default function StudentResults() {
  const { sessions } = usePage<PageProps>().props;
  return (
    <AppLayout breadcrumbs={[{ title: 'My Results', href: '/student/results' }]}> 
      <Head title="My Results" />
      <div className="p-4 space-y-4">
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">No submitted exams yet.</p>
        )}
        <div className="space-y-4">
          {sessions.map((s) => (
            <Card key={s.id} className="border w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{s.exam.title}</CardTitle>
                <Badge variant={s.is_graded ? 'default' : 'secondary'}>{s.is_graded ? 'Graded' : 'Pending'}</Badge>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex flex-col gap-1">
                  <div>Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}</div>
                  {s.is_graded && (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        Score: <span className="font-mono font-semibold">{(s.score ?? 0).toFixed(2)}</span>
                      </div>
                      <Button asChild variant="subtle" size="sm">
                        <a href={`/student/results/${s.id}/pdf`} target="_blank" rel="noopener noreferrer">View PDF</a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
