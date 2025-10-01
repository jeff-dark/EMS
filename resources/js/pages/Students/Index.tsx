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
        title: 'Students',
        href: '/students',
    },
];

interface Student {
    id: number;
    name: string;
    email: string;
    username: string;
}

interface PageProps {
    students: Student[];
    flash: {
        message?: string;
    };
}

export default function Index() {

    const { students, flash } = usePage().props as PageProps;

    const {processing, delete: destroy} = useForm();

    const handleDelete = (id: number, name: string) => {
        // Implement delete functionality here
        if(confirm(`Are you sure you want to delete student ${id} - ${name}?`)) {
            destroy(route('students.destroy', id));
        }
    };

    // Simple implementation assuming route names map directly to paths
    function route(name: string, param?: number): string {
        const routes: Record<string, (param?: number) => string> = {
            'students.create': () => '/students/create',
            'students.edit': (id?: number) => `/students/${id}/edit`,
            'students.destroy': (id?: number) => `/students/${id}`,
            // Add more routes as needed
        };
        return routes[name] ? routes[name](param) : '/';
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <div className='m-4'>
                <Link href={route('students.create')}><Button>Create Student</Button></Link>
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

            {students.length > 0 && (
                <div className="m-4">
                    <Table>
                        <TableCaption>A list of your recent students.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.id}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.username}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Link href={route('students.edit', student.id)}><Button className="bg-slate-500 hover:bg-slate-700">Edit</Button></Link>
                                        <Button disabled={processing} onClick={() => handleDelete(student.id, student.name)} className="bg-red-500 hover:bg-red-700">Delete</Button>
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
