import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface User { id: number; name: string; email: string; role: string; }

interface PageProps {
    counts: { admins: number; teachers: number; students: number; courses: number; units?: number; exams?: number; questions?: number; };
    users: User[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { counts, users } = usePage<PageProps>().props;

    // Build a single row dataset from aggregate counts for direct analysis display
    const analysisData = [
        {
            label: 'Totals',
            courses: counts.courses ?? 0,
            units: counts.units ?? 0,
            exams: counts.exams ?? 0,
            questions: counts.questions ?? 0,
        }
    ];

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
                {/* Simple Analysis Bar & User Distribution Pie */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader><CardTitle>Content Analysis</CardTitle></CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    courses: { label: 'Courses', color: 'var(--color-chart-1)' },
                                    units: { label: 'Units', color: 'var(--color-chart-2)' },
                                    exams: { label: 'Exams', color: 'var(--color-chart-3)' },
                                    questions: { label: 'Questions', color: 'var(--color-chart-4)' },
                                }}
                                className="h-[340px]"
                            >
                                <BarChart data={analysisData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap={48}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="courses" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="units" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="exams" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="questions" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>User Distribution</CardTitle></CardHeader>
                        <CardContent className="flex h-[340px] flex-col items-center justify-center">
                            {(() => {
                                const data = [
                                    { name: 'Admins', value: counts.admins, key: 'admins', color: 'var(--color-chart-1)' },
                                    { name: 'Teachers', value: counts.teachers, key: 'teachers', color: 'var(--color-chart-2)' },
                                    { name: 'Students', value: counts.students, key: 'students', color: 'var(--color-chart-3)' },
                                ];
                                const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
                                return (
                                    <div className="flex w-full flex-col items-center gap-4">
                                        <PieChart width={250} height={200}>
                                            <Pie
                                                data={data}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                stroke="none"
                                            >
                                                {data.map((entry) => (
                                                    <Cell key={entry.key} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                        <ul className="w-full text-xs space-y-2">
                                            {data.map(d => (
                                                <li key={d.key} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                                                        <span>{d.name}</span>
                                                    </div>
                                                    <div className="font-mono tabular-nums flex items-center gap-2">
                                                        <span>{d.value}</span>
                                                        <span className="text-muted-foreground">{((d.value/total)*100).toFixed(1)}%</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })()}
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
