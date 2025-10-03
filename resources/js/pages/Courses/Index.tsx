import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
        title: 'Courses',
        href: '/courses',
    },
];

interface Courses {
    id: number;
    name: string;
    description: string;
}

interface PageProps {
    courses: Courses[];
    flash: {
        message?: string;
    };
}

export default function Index() {

    const { courses, flash } = usePage().props as PageProps;

    const {processing, delete: destroy} = useForm();

    const handleDelete = (id: number, name: string) => {
        // Implement delete functionality here
        if(confirm(`Are you sure you want to delete course ${id} - ${name}?`)) {
            destroy(route('courses.destroy', id));
        }
    };

    // Simple implementation assuming route names map directly to paths
    function route(name: string, param?: number): string {
        const routes: Record<string, (param?: number) => string> = {
            'courses.create': () => '/courses/create',
            'courses.edit': (id?: number) => `/courses/${id}/edit`,
            'courses.destroy': (id?: number) => `/courses/${id}`,
            // Add more routes as needed
        };
        return routes[name] ? routes[name](param) : '/';
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="courses" />
            <div className='m-4'>
                <Link href={route('courses.create')}><Button>Create course</Button></Link>
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
                    )}
                </div>
            </div>

            {courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-4">
                    {courses.map((course) => (
                        <Card key={course.id}>
                            <CardHeader>
                                <CardTitle>{course.name}</CardTitle>
                                <CardDescription>{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">Course ID: {course.id}</div>
                            </CardContent>
                            <CardFooter className="justify-end flex">
                                <Link href={route('courses.edit', course.id)}><Button className="bg-slate-500 hover:bg-slate-700 mr-2">Edit</Button></Link>
                                <Button disabled={processing} onClick={() => handleDelete(course.id, course.name)} className="bg-red-500 hover:bg-red-700">Delete</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
