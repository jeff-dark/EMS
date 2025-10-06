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
        title: 'Exams',
        href: '/exams',
    },
];

interface Exam {
    id: number;
    title: string;
    date: string;
    course: string;
    unit: string;
    duration: string;
}

interface PageProps {
    exams: Exam[];
    flash: {
        message?: string;
    };
}

export default function Index() {

    const { exams, flash } = usePage().props as PageProps;

    const {processing, delete: destroy} = useForm();

    const handleDelete = (id: number, title: string) => {
        // Implement delete functionality here
        if(confirm(`Are you sure you want to delete exam ${id} - ${title}?`)) {
            destroy(route('exams.destroy', id));
        }
    };

    // Simple implementation assuming route names map directly to paths
    function route(name: string, param?: number): string {
        const routes: Record<string, (param?: number) => string> = {
            'exams.create': () => '/exams/create',
            'exams.edit': (id?: number) => `/exams/${id}/edit`,
            'exams.destroy': (id?: number) => `/exams/${id}`,
            // Add more routes as needed
        };
        return routes[name] ? routes[name](param) : '/';
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exams" />
            <div className='m-4'>
                <Link href={route('exams.create')}><Button>Create Exam</Button></Link>
            </div>
            <div className="m-4">
                <div>
                    {flash.message && (
                        <Alert>
                            <Bell />
                            <AlertTitle>Notification!</AlertTitle>
                            <AlertDescription>
                                {flash.message}
                            </AlertDescription>
                        </Alert>
                    )
                    }
                </div>
            </div>

            {exams.length > 0 && (
                <div className="m-4">
                    <Table>
                        <TableCaption>A list of your recent exams.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell>{exam.title}</TableCell>
                                    <TableCell>{exam.date}</TableCell>
                                    <TableCell>{exam.course}</TableCell>
                                    <TableCell>{exam.unit}</TableCell>
                                    <TableCell>{exam.duration}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Link href={route('exams.edit', exam.id)}><Button className="bg-slate-500 hover:bg-slate-700">Edit</Button></Link>
                                        <Button disabled={processing} onClick={() => handleDelete(exam.id, exam.title)} className="bg-red-500 hover:bg-red-700">Delete</Button>
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
