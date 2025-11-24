import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import FilterBar from '@/components/ui/filter-bar';
import { useMemo, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Note: We'll compute the breadcrumb dynamically below to show "My Courses" for teachers
const baseBreadcrumb: BreadcrumbItem = { title: 'Courses', href: '/courses' };

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

    const page = usePage().props as unknown as Partial<PageProps> & { [key:string]: any };
    const role: string | undefined = (page as any)?.auth?.role || (page as any)?.authUser?.role;
    const courses = page.courses || [];
    const flash = page.flash || {};

    const {processing, delete: destroy} = useForm();

    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return courses;
        return courses.filter(c => {
            const name = c.name?.toLowerCase() ?? '';
            const description = c.description?.toLowerCase() ?? '';
            return name.includes(term) || description.includes(term);
        });
    }, [courses, q]);

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
            'units.index': (id?: number) => `/courses/${id}/units`, // <-- Add this line
            // Add more routes as needed
        };
        return routes[name] ? routes[name](param) : '/';
    }
    const isTeacher = role === 'teacher';
    const isAdmin = role === 'admin';
    const breadcrumb: BreadcrumbItem[] = [
        { title: isTeacher ? 'My Courses' : 'Courses', href: '/courses' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumb}>
            <Head title={isTeacher ? 'My Courses' : 'Courses'} />
            <FilterBar
                right={isAdmin ? (<Link href={route('courses.create')}><Button>Create course</Button></Link>) : undefined}
                onReset={() => setQ("")}
            >
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name or description"
                />
            </FilterBar>
            {/* Flash is shown globally in the layout (AppSidebarLayout) */}

            {filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-4">
                    {filtered.map((course) => (
                        <Card
                            key={course.id}
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => window.location.href = route('units.index', course.id)}
                        >
                            <CardHeader>
                                <CardTitle>{course.name}</CardTitle>
                                <CardDescription>{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">Course ID: {course.id}</div>
                            </CardContent>
                            {isAdmin && (
                                <CardFooter className="justify-end flex space-x-2">
                                    <Link href={route('courses.edit', course.id)}>
                                        <Button className="bg-slate-500 hover:bg-slate-700">Edit</Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={e => { e.stopPropagation(); handleDelete(course.id, course.name); }}
                                        className="bg-red-500 hover:bg-red-700"
                                    >
                                        Delete
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
