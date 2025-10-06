import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
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

interface Exam {
    id: number;
    unit_id: number;
    title: string;
    duration_minutes: number;
    passing_score: number;
    is_published: boolean;
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

interface ExamsIndexProps {
    course: Course;
    unit: Unit;
    exams: Exam[];
    auth: any;
}

export default function Index({ auth, course, unit, exams }: ExamsIndexProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Exams', href: `/courses/${course.id}/units/${unit.id}/exams` }]}> 
            <Head title={`Exams for ${unit.title}`} />
            <div className="m-4">
                <Link href={route('courses.units.exams.create', [course.id, unit.id])}><Button>Create Exam</Button></Link>
            </div>
            <div className="m-4">
                {flash && flash.message && (
                    <Alert>
                        <Bell />
                        <AlertTitle>Notification!</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}
            </div>
            {exams.length > 0 ? (
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
                            {exams.map(exam => (
                                <TableRow
                                    key={exam.id}
                                    className="cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => window.location.href = `/courses/${course.id}/units/${unit.id}/exams/${exam.id}/edit`}
                                >
                                    <TableCell>{exam.title}</TableCell>
                                    <TableCell>{exam.duration_minutes}</TableCell>
                                    <TableCell>{exam.passing_score}</TableCell>
                                    <TableCell>{exam.is_published ? 'Published' : 'Draft'}</TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <Link href={`/courses/${course.id}/units/${unit.id}/exams/${exam.id}/edit`}>
                                            <Button className="bg-slate-500 hover:bg-slate-700 mr-2">Edit</Button>
                                        </Link>
                                        <Button
                                            className="bg-red-500 hover:bg-red-700"
                                            onClick={e => { e.stopPropagation(); /* add delete logic here */ }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="m-4 text-muted-foreground">No exams found for this unit.</div>
            )}
        </AppLayout>
    );
}
