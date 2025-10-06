
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
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

const course: Course = { id: 1, name: 'Sample Course' }; // Replace with actual data
const unit: Unit = { id: 1, title: 'Sample Unit', course_id: 1 }; // Replace with actual data

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Courses', href: '/courses' },
    { title: course.name, href: `/courses/${course.id}/units` },
    { title: unit.title, href: `/courses/${course.id}/units/${unit.id}/exams` },
];

interface PageProps {
    exams: Exam[];
    flash: {
        message?: string;
    };
}

export default function Index() {
    const { exams, flash } = usePage().props as PageProps;

    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete exam ${id} - ${title}?`)) {
            destroy(route('courses.units.exams.destroy', [course.id, unit.id, id]));
        }
    };

    // Simple implementation assuming route names map directly to paths
    function route(name: string, params?: number[]): string {
        const routes: Record<string, (params?: number[]) => string> = {
            'courses.units.exams.create': (p?: number[]) => `/courses/${p ? p[0] : ''}/units/${p ? p[1] : ''}/exams/create`,
            'courses.units.exams.edit': (p?: number[]) => `/courses/${p ? p[0] : ''}/units/${p ? p[1] : ''}/exams/${p ? p[2] : ''}/edit`,
            'courses.units.exams.destroy': (p?: number[]) => `/courses/${p ? p[0] : ''}/units/${p ? p[1] : ''}/exams/${p ? p[2] : ''}`,
            // Add more routes as needed
        };
        return routes[name] ? routes[name](params) : '/';
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exams" />
            <div className="m-4">
                <Link href={route('courses.units.exams.create')}><Button>Create Exam</Button></Link>
            </div>
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
                                        <Button disabled={processing} onClick={() => handleDelete(exam.id, exam.title)} className="bg-red-500 hover:bg-red-700">Delete</Button>
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