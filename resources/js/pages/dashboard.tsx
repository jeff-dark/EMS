import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface User { id: number; name: string; email: string; role: string; }

interface ChartRow { month: string; courses: number; units: number; exams: number; questions: number; }

interface PageProps {
    counts: { admins: number; teachers: number; students: number; courses: number; units?: number; exams?: number; questions?: number; };
    users: User[];
    chartData: ChartRow[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { counts, users, chartData } = usePage<PageProps>().props;

    const normalizedChartData = React.useMemo(() => {
        if (!chartData?.length) return [];
        const hasAny = chartData.some(r => (r.courses + r.units + r.exams + r.questions) > 0);
        if (hasAny) return chartData;
        return [{ month: 'Totals', courses: counts.courses ?? 0, units: counts.units ?? 0, exams: counts.exams ?? 0, questions: counts.questions ?? 0 }];
    }, [chartData, counts]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Top cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3 xl:grid-cols-4">
                    <Card><CardHeader><CardTitle>Admins</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.admins}</span></CardContent></Card>
                    <Card><CardHeader><CardTitle>Teachers</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.teachers}</span></CardContent></Card>
                    <Card><CardHeader><CardTitle>Students</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.students}</span></CardContent></Card>
                    <Card><CardHeader><CardTitle>Courses</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.courses}</span></CardContent></Card>
                </div>
                {/* Bar Chart */}
                <Card className="w-full">
                    <CardHeader><CardTitle>Content Growth (Last 6 Months)</CardTitle></CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                courses: { label: 'Courses', color: 'var(--color-chart-1)' },
                                units: { label: 'Units', color: 'var(--color-chart-2)' },
                                exams: { label: 'Exams', color: 'var(--color-chart-3)' },
                                questions: { label: 'Questions', color: 'var(--color-chart-4)' },
                            }}
                            className="h-[320px]"
                        >
                            <BarChart data={normalizedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="courses" fill="var(--color-courses, var(--color-chart-1))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="units" fill="var(--color-units, var(--color-chart-2))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="exams" fill="var(--color-exams, var(--color-chart-3))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="questions" fill="var(--color-questions, var(--color-chart-4))" radius={[4, 4, 0, 0]} />
                                <ChartLegend content={<ChartLegendContent />} />
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
