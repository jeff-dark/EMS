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
    courses: string[];
    units_count: number;
}

interface PageProps {
    teachers: Teacher[];
    flash: {
        message?: string;
    };
}

export default function Index() {

    const page = usePage().props as unknown as PageProps & { [key:string]: any };
    const teachers = page.teachers || [];
    const flash = page.flash || {};

    const {processing, delete: destroy} = useForm();

    const handleDelete = (id: number, name: string) => {
        if(confirm(`Are you sure you want to delete teacher ${id} - ${name}?`)) {
            destroy(route('teachers.destroy', id));
        }
    };

    // Simple implementation assuming route names map directly to paths
    function route(name: string, param?: number): string {
        const routes: Record<string, (param?: number) => string> = {
            'teachers.create': () => '/teachers/create',
            'teachers.edit': (id?: number) => `/teachers/${id}/edit`,
            'teachers.destroy': (id?: number) => `/teachers/${id}`,
            'teachers.load': (id?: number) => `/teachers/${id}/load-report`,
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
                        <div className="alert">
                            <Bell />
                            <strong>Notification!</strong>
                            <span>
                                {flash.message}
                            </span>
                        </div>
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
                                <TableHead>Courses</TableHead>
                                <TableHead>Units</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.courses?.join(', ')}</TableCell>
                                    <TableCell>{teacher.units_count}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Link href={route('teachers.edit', teacher.id)}><Button className="bg-slate-500 hover:bg-slate-700">Edit</Button></Link>
                                        <Link href={route('teachers.load', teacher.id)}><Button className="bg-indigo-500 hover:bg-indigo-700">Load</Button></Link>
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
