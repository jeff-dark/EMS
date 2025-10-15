
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ActionMenu from '@/components/ui/action-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import FilterBar from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Exam {
    id: number;
    unit_id: number;
    title: string;
    duration_minutes: number;
    passing_score: number;
    is_published: boolean;
    is_submitted?: boolean; // computed per-student
}

interface Unit {
    id: number;
    title: string;
    course_id: number;
}

interface Course {
    id: number;
    name: string;
}

import { PageProps as InertiaPageProps } from '@inertiajs/core';

interface PageProps extends InertiaPageProps {
    exams: Exam[];
    flash: {
        message?: string;
    };
    course: Course;
    unit: Unit;
}

export default function Index() {
    const { exams, flash, course, unit } = usePage<PageProps>().props;
    const page: any = usePage();
    const role: string | undefined = page?.props?.auth?.role || page?.props?.authUser?.role;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}/units` },
        { title: unit.title, href: `/courses/${course.id}/units/${unit.id}/exams` },
    ];

    const { processing, delete: destroy } = useForm();

    const [q, setQ] = useState("");
    const [status, setStatus] = useState<string>('all');
    const [submission, setSubmission] = useState<string>('all');
    const [submittedDialogOpen, setSubmittedDialogOpen] = useState(false);
    const [submittedExam, setSubmittedExam] = useState<Exam | null>(null);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        return exams.filter(ex => {
            const matchesText = !term || (ex.title ?? '').toLowerCase().includes(term);
            const matchesStatus = status === 'all' || (status === 'published' ? ex.is_published : !ex.is_published);
            const matchesSubmission = role === 'student'
                ? (submission === 'all' || (submission === 'available' ? !ex.is_submitted : !!ex.is_submitted))
                : true;
            return matchesText && matchesStatus && matchesSubmission;
        });
    }, [exams, q, status, submission, role]);

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete exam ${id} - ${title}?`)) {
            destroy(route('courses.units.exams.destroy', [course.id, unit.id, id]));
        }
    };

    // Simple implementation assuming route names map directly to paths
    function route(name: string, params?: (string | number)[]): string {
        const routes: Record<string, (params?: (string | number)[]) => string> = {
            'courses.units.exams.create': (p?: (string | number)[]) => `/courses/${p?.[0]}/units/${p?.[1]}/exams/create`,
            'courses.units.exams.edit': (p?: (string | number)[]) => `/courses/${p?.[0]}/units/${p?.[1]}/exams/${p?.[2]}/edit`,
            'courses.units.exams.destroy': (p?: (string | number)[]) => `/courses/${p?.[0]}/units/${p?.[1]}/exams/${p?.[2]}`,
            // Add more routes as needed
        };
        return routes[name] ? routes[name](params) : '/';
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exams" />
            <FilterBar
                right={<Link href={route('courses.units.exams.create', [course.id, unit.id])}><Button>Create Exam</Button></Link>}
                onReset={() => { setQ(''); setStatus('all'); setSubmission('all'); }}
            >
                <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search title" />
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                </Select>
                {role === 'student' && (
                    <Select value={submission} onValueChange={setSubmission}>
                        <SelectTrigger>
                            <SelectValue placeholder="Submission" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All exams</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </FilterBar>
            <div className="m-4">
                <div>
                    {flash && flash.message && (
                        <Alert>
                            <Bell />
                            <AlertTitle>Notification!</AlertTitle>
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
                        <TableCaption>List of exams for this unit</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Duration (min)</TableHead>
                                <TableHead>Passing Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(exam => (
                                <TableRow
                                    key={exam.id}
                                    className="cursor-pointer transition hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                                    onClick={() => {
                                        if (role === 'student') {
                                            if (exam.is_submitted) {
                                                setSubmittedExam(exam);
                                                setSubmittedDialogOpen(true);
                                                return;
                                            }
                                            window.location.href = `/exams/${exam.id}/start`;
                                        } else {
                                            window.location.href = `/exams/${exam.id}/questions`;
                                        }
                                    }}
                                >
                                    <TableCell>{exam.title}</TableCell>
                                    <TableCell>{exam.duration_minutes}</TableCell>
                                    <TableCell>{exam.passing_score}</TableCell>
                                    <TableCell>{exam.is_published ? 'Published' : 'Draft'}</TableCell>
                                    <TableCell>
                                        {role !== 'student' && (
                                            <ActionMenu
                                                items={[
                                                    { label: 'Edit', href: route('courses.units.exams.edit', [course.id, unit.id, exam.id]) },
                                                    { label: 'Delete', onClick: () => handleDelete(exam.id, exam.title), variant: 'destructive', disabled: processing },
                                                ]}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="m-4 text-center text-gray-500">No exams found for this unit.</div>
            )}

            <Dialog open={submittedDialogOpen} onOpenChange={setSubmittedDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Exam already submitted</DialogTitle>
                        <DialogDescription>
                            {submittedExam ? `You have already submitted the exam "${submittedExam.title}".` : 'You have already submitted this exam.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setSubmittedDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}   