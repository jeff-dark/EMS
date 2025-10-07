import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

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
        units?: number;
        exams?: number;
        questions?: number;
    };
    users: User[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { counts, users } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Top cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3 xl:grid-cols-4">
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
                {/* Bar Chart */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Content Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                courses: { label: 'Courses', color: 'hsl(var(--chart-1))' },
                                units: { label: 'Units', color: 'hsl(var(--chart-2))' },
                                exams: { label: 'Exams', color: 'hsl(var(--chart-3))' },
                                questions: { label: 'Questions', color: 'hsl(var(--chart-4))' },
                            }}
                            className="h-[300px]"
                        >
                            <BarChart
                                data={[
                                    {
                                        name: 'Totals',
                                        courses: counts.courses ?? 0,
                                        units: counts.units ?? 0,
                                        exams: counts.exams ?? 0,
                                        questions: counts.questions ?? 0,
                                    },
                                ]}
                                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="courses" fill="var(--color-courses)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="units" fill="var(--color-units)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="exams" fill="var(--color-exams)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="questions" fill="var(--color-questions)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
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
