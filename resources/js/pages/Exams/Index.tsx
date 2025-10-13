import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import ActionMenu from '@/components/ui/action-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Exams',
        href: '/exams',
    },
];

// Shape of the exams returned from the backend (Exam::with(['unit', 'unit.course']))
interface BackendExamRelationCourse { id: number; name: string }
interface BackendExamRelationUnit { id: number; title: string; course?: BackendExamRelationCourse }
interface BackendExam {
    id: number;
    unit_id: number;
    title: string;
    duration_minutes: number;
    passing_score: number;
    is_published: boolean;
    unit?: BackendExamRelationUnit;
}

interface PageProps {
    exams: BackendExam[];
    flash?: {
        message?: string;
    };
}

export default function Index() {
    const page = usePage().props as unknown as Partial<PageProps> & { [key:string]: any };
    const exams: BackendExam[] = page.exams || [];
    const flash = page.flash || {};
    const role: string | undefined = page.auth?.role || page.authUser?.role;

    const { processing, delete: destroy } = useForm();

    const [q, setQ] = useState("");
    const [status, setStatus] = useState<string>("all");

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        return (exams || []).filter(exam => {
            const matchesText = !term || [
                exam.title,
                exam.unit?.title,
                exam.unit?.course?.name,
            ].some(v => (v ?? '').toLowerCase().includes(term));
            const matchesStatus = status === 'all' || (status === 'published' ? exam.is_published : !exam.is_published);
            return matchesText && matchesStatus;
        });
    }, [exams, q, status]);

    // Build nested exam route since top-level create/edit requires context (course + unit)
    function route(name: string, params: (string | number)[] = []): string {
        const map: Record<string, (p: (string | number)[]) => string> = {
            // Nested resource routes (must mirror routes/web.php definitions)
            'courses.units.exams.edit': (p) => `/courses/${p[0]}/units/${p[1]}/exams/${p[2]}/edit`,
            'courses.units.exams.destroy': (p) => `/courses/${p[0]}/units/${p[1]}/exams/${p[2]}`,
            'courses.units.exams.create': (p) => `/courses/${p[0]}/units/${p[1]}/exams/create`,
        };
        return map[name] ? map[name](params) : '/';
    }

    const handleDelete = (exam: BackendExam) => {
        const unit = exam.unit;
        const course = unit?.course;
        if (!unit || !course) return; // Safety guard
        if (confirm(`Are you sure you want to delete the exam "${exam.title}"?`)) {
            destroy(route('courses.units.exams.destroy', [course.id, unit.id, exam.id]));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exams" />

            <div className="m-4">
                <div>
                    {flash?.message && (
                        <Alert>
                            <Bell />
                            <AlertTitle>Notification!</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            <FilterBar onReset={() => { setQ(""); setStatus('all'); }}>
                <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search title, course, unit" />
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
            </FilterBar>

            {filtered && filtered.length > 0 ? (
                <div className="m-4">
                    <Table>
                        <TableCaption>All exams across courses & units</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Duration (min)</TableHead>
                                <TableHead>Passing Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((exam) => {
                                const unit = exam.unit;
                                const course = unit?.course;
                                return (
                                    <TableRow
                                        key={exam.id}
                                        className="cursor-pointer transition hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                                        onClick={() => {
                                            if (role === 'student') {
                                                router.get(`/exams/${exam.id}/start`);
                                            } else {
                                                router.get(`/exams/${exam.id}/questions`);
                                            }
                                        }}
                                        title={role === 'student' ? 'Start exam' : 'View questions'}
                                    >
                                        <TableCell>{exam.title}</TableCell>
                                        <TableCell>{course?.name ?? '—'}</TableCell>
                                        <TableCell>{unit?.title ?? '—'}</TableCell>
                                        <TableCell>{exam.duration_minutes}</TableCell>
                                        <TableCell>{exam.passing_score}</TableCell>
                                        <TableCell>{exam.is_published ? 'Published' : 'Draft'}</TableCell>
                                        <TableCell className="text-center">
                                            {role !== 'student' && course && unit && (
                                                <ActionMenu
                                                    items={[
                                                        { label: 'Edit', href: route('courses.units.exams.edit', [course.id, unit.id, exam.id]) },
                                                        { label: 'Delete', onClick: () => handleDelete(exam), variant: 'destructive', disabled: processing },
                                                    ]}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="m-4 text-center text-gray-500">No exams found.</div>
            )}
        </AppLayout>
    );
}
