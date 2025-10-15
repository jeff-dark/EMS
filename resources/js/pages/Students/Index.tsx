import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import ActionMenu from '@/components/ui/action-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
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

    const page = usePage().props as unknown as Partial<PageProps> & { [key:string]: any };
    const students = page.students || [];
    const flash = page.flash || {};

    const {processing, delete: destroy} = useForm();

    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return students;
        return students.filter(s => {
            const name = s.name?.toLowerCase() ?? '';
            const email = s.email?.toLowerCase() ?? '';
            const username = s.username?.toLowerCase() ?? '';
            return name.includes(term) || email.includes(term) || username.includes(term);
        });
    }, [students, q]);

    const handleDelete = (id: number, name: string) => {
        // Implement delete functionality here
        if(confirm(`Are you sure you want to delete student ${id} - ${name}?`)) {
            destroy(route('students.destroy', id));
        }
    };

    const handleResetPassword = (id: number, name: string) => {
        if (!confirm(`Reset password for ${name} to 123456789?`)) return;
        router.post(`/students/${id}/reset-password`, {}, { preserveScroll: true });
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
            <FilterBar
                right={<Link href={route('students.create')}><Button>Create Student</Button></Link>}
                onReset={() => setQ("")}
            >
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, email, username"
                />
            </FilterBar>
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

            {filtered.length > 0 && (
                <div className="m-4">
                    <Table>
                        <TableCaption>A list of your recent students.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.username}</TableCell>
                                    <TableCell className="text-center">
                                        <ActionMenu
                                            items={[ 
                                                { label: 'Edit', href: route('students.edit', student.id) },
                                                { label: 'Reset Password', onClick: () => handleResetPassword(student.id, student.name), variant: 'default' },
                                                { label: 'Delete', onClick: () => handleDelete(student.id, student.name), variant: 'destructive', disabled: processing },
                                            ]}
                                        />
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
