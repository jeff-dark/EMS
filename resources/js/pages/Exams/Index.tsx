import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
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
    const { exams, flash } = usePage<PageProps>().props;

    const { processing, delete: destroy } = useForm();

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

            {exams && exams.length > 0 ? (
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
                            {exams.map((exam) => {
                                const unit = exam.unit;
                                const course = unit?.course;
                                return (
                                    <TableRow
                                        key={exam.id}
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => router.get(`/exams/${exam.id}/questions`)}
                                        title="View questions"
                                    >
                                        <TableCell className="font-medium text-blue-700 underline-offset-2 hover:underline">
                                            <span>{exam.title}</span>
                                        </TableCell>
                                        <TableCell>{course?.name ?? '—'}</TableCell>
                                        <TableCell>{unit?.title ?? '—'}</TableCell>
                                        <TableCell>{exam.duration_minutes}</TableCell>
                                        <TableCell>{exam.passing_score}</TableCell>
                                        <TableCell>{exam.is_published ? 'Published' : 'Draft'}</TableCell>
                                        <TableCell className="text-center space-x-2">
                                            {course && unit && (
                                                <Link
                                                    href={route('courses.units.exams.edit', [course.id, unit.id, exam.id])}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button className="bg-slate-500 hover:bg-slate-700">Edit</Button>
                                                </Link>
                                            )}
                                            {course && unit && (
                                                <Button
                                                    disabled={processing}
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(exam); }}
                                                    className="bg-red-500 hover:bg-red-700"
                                                >
                                                    Delete
                                                </Button>
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
