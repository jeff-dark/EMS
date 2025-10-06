import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';


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
        courses: number;
    };
    users: User[];
    [key: string]: unknown;
}

interface UsersIndexProps extends PageProps {
    users: User[];
    currentFilter: string; // 'all', 'student', 'admin', 'teacher'
}

export default function Index({ auth, users, currentFilter }: UsersIndexProps) {

    // Define the available role filters
    const filters = [
        { label: 'All', value: 'all' },
        { label: 'Students', value: 'student' },
        { label: 'Teachers', value: 'teacher' },
        { label: 'Admins', value: 'admin' },
    ];

    const getButtonStyle = (value: string) => {
        const base = "px-4 py-2 text-sm font-medium border rounded-md transition ease-in-out duration-150 ";

        if (currentFilter === value) {
            // Active style (like the blue in your screenshot, adjusted for a generic dark mode look)
            return base + "bg-gray-800 text-white border-gray-700 shadow-inner";
        } else {
            // Inactive style
            return base + "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600";
        }
    };


    export default function Dashboard() {
        const { counts, users } = usePage<PageProps>().props;

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                user={auth.user}
                header={
                    <h2 className="font-semibold text-xl text-white leading-tight">
                        Dashboard / User Management
                    </h2>
                }
        >
                <Head title="Dashboard" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                        {/* Success Flash Message */}
                        {flash.message && (
                            <div className="mb-4 p-4 bg-green-700 text-white rounded-lg">
                                {flash.message as string}
                            </div>
                        )}

                        <div className="bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-gray-400 mb-4">Search and manage all users in the system</p>

                            {/* Filter and Search Section */}
                            <div className="flex justify-between items-center mb-6">

                                {/* Search Bar */}
                                <div className="flex-grow mr-4">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="w-full border-gray-700 bg-gray-900 text-gray-300 rounded-md shadow-sm"
                                    />
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex space-x-2">
                                    {filters.map(filter => (
                                        <Link
                                            key={filter.value}
                                            href={route('dashboard', { role: filter.value === 'all' ? null : filter.value })}
                                            replace
                                            className={getButtonStyle(filter.value)}
                                        >
                                            {filter.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
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
                                            <span className="text-3xl font-bold">{counts.courses}</span>
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
                            {users.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No users found for the selected filter.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }
}