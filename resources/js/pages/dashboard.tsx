import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PageProps {
    counts: {
        admins: number;
        teachers: number;
        students: number;
    };
    users: User[];
}

export default function Dashboard() {
    const { counts, users } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Top cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold">{counts.admins}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Teachers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold">{counts.teachers}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold">{counts.students}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold">{counts.Courses}</span>
                        </CardContent>
                    </Card>
                </div>
                {/* Users table */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
