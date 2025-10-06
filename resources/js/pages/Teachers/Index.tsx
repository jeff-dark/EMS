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
        title: 'Teachers',
        href: '/teachers',
    },
];

interface Teacher {
    id: number;
    name: string;
    email: string;
    username: string;
}

interface PageProps {
    teachers: Teacher[];
    flash: {
        message?: string;
    };
}

export default function Index() {

    const { teachers, flash } = usePage().props as PageProps;

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
            'teachers.create': () => '/teachers/create',
            'teachers.edit': (id?: number) => `/teachers/${id}/edit`,
            'teachers.destroy': (id?: number) => `/teachers/${id}`,
            // Add more routes as needed
        };
        return routes[name] ? routes[name](param) : '/';
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teachers" />
            <div className='m-4'>
                <Link href={route('teachers.create')}><Button>Create Teacher</Button></Link>
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

            {teachers.length > 0 && (
                <div className="m-4">
                    <Table>
                        <TableCaption>A list of your recent teachers.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.username}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Link href={route('teachers.edit', teacher.id)}><Button className="bg-slate-500 hover:bg-slate-700">Edit</Button></Link>
                                        <Button disabled={processing} onClick={() => handleDelete(teacher.id, teacher.name)} className="bg-red-500 hover:bg-red-700">Delete</Button>
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
