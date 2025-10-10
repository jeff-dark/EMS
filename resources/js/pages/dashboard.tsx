import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface User { id: number; name: string; email: string; role: string; }

interface StudentExamStats { total: number; available: number; upcoming: number; completed: number; }
interface StudentCourse { id: number; name: string; description?: string | null; }
interface StudentUnit { id: number; course_id: number; course_name?: string; title: string; order: number; }
interface ExamDistributionItem { status: string; value: number; }
interface StudentData {
    examStats: StudentExamStats;
    courses: StudentCourse[];
    units: StudentUnit[];
    examDistribution: ExamDistributionItem[];
}
interface TeacherCards { myUnits: number; myStudents: number; activeExamsToday: number; totalExams: number; }
interface TeacherCharts {
    studentsPerUnit: { unit: string; students: number }[];
    examsPerUnit: { unit: string; exams: number }[];
}
interface TeacherStudent { id: number; name: string; email: string; units: { id: number; title: string }[] }
interface TeacherData {
    cards: TeacherCards;
    charts: TeacherCharts;
    students: TeacherStudent[];
}
interface PageProps {
    counts: { admins: number; teachers: number; students: number; courses: number; units?: number; exams?: number; questions?: number; };
    users: User[];
    authUser?: { id: number; name: string; role: string };
    studentData?: StudentData | null;
    teacherData?: TeacherData | null;
    adminInteractive?: { metric: string; value: number }[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { counts, users, authUser, studentData, teacherData, adminInteractive } = usePage<PageProps>().props;
    const role = authUser?.role;

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

    // Student-specific view
    if (role === 'student' && studentData) {
        const { examStats, examDistribution, courses, units } = studentData;
        const distributionTotal = examDistribution.reduce((acc, d) => acc + d.value, 0) || 1;
        const areaData = [{ name: 'Exams', Available: examStats.available, Upcoming: examStats.upcoming, Completed: examStats.completed }];

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-4">
                    {/* Stat cards */}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card><CardHeader><CardTitle>Total Exams</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{examStats.total}</span></CardContent></Card>
                        <Card><CardHeader><CardTitle>Available Exams</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{examStats.available}</span></CardContent></Card>
                        <Card><CardHeader><CardTitle>Upcoming Exams</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{examStats.upcoming}</span></CardContent></Card>
                        <Card><CardHeader><CardTitle>Completed Exams</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{examStats.completed}</span></CardContent></Card>
                    </div>

                    {/* Analysis charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Exam Status Distribution</CardTitle></CardHeader>
                            <CardContent className="flex h-[340px] flex-col items-center justify-center">
                                <PieChart width={260} height={220}>
                                    <Pie
                                        data={examDistribution}
                                        dataKey="value"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {examDistribution.map((entry, idx) => (
                                            <Cell key={entry.status} fill={`var(--color-chart-${idx+1})`} />
                                        ))}
                                    </Pie>
                                </PieChart>
                                <ul className="w-full text-xs space-y-2 mt-4">
                                    {examDistribution.map((d, idx) => (
                                        <li key={d.status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="h-3 w-3 rounded-sm" style={{ background: `var(--color-chart-${idx+1})` }} />
                                                <span>{d.status}</span>
                                            </div>
                                            <div className="font-mono tabular-nums flex items-center gap-2">
                                                <span>{d.value}</span>
                                                <span className="text-muted-foreground">{((d.value/distributionTotal)*100).toFixed(1)}%</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Exam Overview</CardTitle></CardHeader>
                            <CardContent className="h-[340px]">
                                <ChartContainer
                                    config={{
                                        Available: { label: 'Available', color: 'var(--color-chart-1)' },
                                        Upcoming: { label: 'Upcoming', color: 'var(--color-chart-2)' },
                                        Completed: { label: 'Completed', color: 'var(--color-chart-3)' },
                                    }}
                                    className="h-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                            <Area type="monotone" dataKey="Available" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.25} />
                                            <Area type="monotone" dataKey="Upcoming" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.25} />
                                            <Area type="monotone" dataKey="Completed" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.25} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Courses & Units lists */}
                    <div className="grid gap-4 md:grid-cols-2 flex-1">
                        <Card className="flex flex-col">
                            <CardHeader><CardTitle>Your Courses</CardTitle></CardHeader>
                            <CardContent className="flex-1 overflow-auto">
                                {courses.length === 0 && <p className="text-sm text-muted-foreground">No courses assigned.</p>}
                                <ul className="space-y-3">
                                    {courses.map(c => (
                                        <li key={c.id} className="rounded border p-3 bg-muted/40"> 
                                            <p className="font-medium">{c.name}</p>
                                            {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{c.description}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="flex flex-col">
                            <CardHeader><CardTitle>Your Units</CardTitle></CardHeader>
                            <CardContent className="flex-1 overflow-auto">
                                {units.length === 0 && <p className="text-sm text-muted-foreground">No units available.</p>}
                                <ul className="space-y-3">
                                    {units.map(u => (
                                        <li key={u.id} className="rounded border p-3 bg-muted/40 flex flex-col gap-1">
                                            <div className="text-sm font-medium">{u.title}</div>
                                            <div className="text-xs text-muted-foreground">Course: {u.course_name || u.course_id} • Order {u.order}</div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Default (admin/teacher) existing view
    if (role === 'teacher' && teacherData) {
        const { cards, charts, students } = teacherData;
        // Merge datasets by unit for combined chart (students & exams per unit)
        const combinedByUnit = new Map<string, { unit: string; students: number; exams: number }>();
        charts.studentsPerUnit.forEach((s) => {
            combinedByUnit.set(s.unit, { unit: s.unit, students: s.students, exams: 0 });
        });
        charts.examsPerUnit.forEach((e) => {
            const existing = combinedByUnit.get(e.unit);
            if (existing) {
                existing.exams = e.exams;
            } else {
                combinedByUnit.set(e.unit, { unit: e.unit, students: 0, exams: e.exams });
            }
        });
        const studentsAndExamsData = Array.from(combinedByUnit.values());
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-4">
                    {/* Top cards */}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card><CardHeader><CardTitle>My Units</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{cards.myUnits}</span></CardContent></Card>
                        <Card><CardHeader><CardTitle>My Students</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{cards.myStudents}</span></CardContent></Card>
                        <Card><CardHeader><CardTitle>Active Exams (Today)</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{cards.activeExamsToday}</span></CardContent></Card>
                        <Card><CardHeader><CardTitle>Total Exams</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{cards.totalExams}</span></CardContent></Card>
                    </div>

                    {/* Analytics charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Students per Unit</CardTitle></CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{ students: { label: 'Students', color: 'var(--color-chart-1)' } }}
                                    className="h-[340px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={charts.studentsPerUnit} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                            <XAxis dataKey="unit" tickLine={false} axisLine={false} interval={0} angle={-20} height={50} tickMargin={10} />
                                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                            <Bar dataKey="students" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Students & Exams</CardTitle></CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        students: { label: 'Students', color: 'var(--color-chart-1)' },
                                        exams: { label: 'Exams', color: 'var(--color-chart-2)' },
                                    }}
                                    className="h-[340px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={studentsAndExamsData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                            <XAxis dataKey="unit" tickLine={false} axisLine={false} interval={0} angle={-20} height={50} tickMargin={10} />
                                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                            <Bar dataKey="students" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="exams" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Students table */}
                    <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Units</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.name}</TableCell>
                                        <TableCell>{s.email}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {s.units.map(u => u.title).join(', ')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Default (admin) existing view
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3 xl:grid-cols-4">
                    <Card><CardHeader><CardTitle>Admins</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.admins}</span></CardContent></Card>
                    <Card><CardHeader><CardTitle>Teachers</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.teachers}</span></CardContent></Card>
                    <Card><CardHeader><CardTitle>Students</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.students}</span></CardContent></Card>
                    <Card><CardHeader><CardTitle>Courses</CardTitle></CardHeader><CardContent><span className="text-3xl font-bold">{counts.courses}</span></CardContent></Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
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
                {/* Admin interactive bar chart (full width) moved below the two charts */}
                {role === 'admin' && adminInteractive && (
                    <Card className="w-full">
                        <CardHeader><CardTitle>Platform Analytics</CardTitle></CardHeader>
                        <CardContent className="h-[480px] p-0">
                            <ChartContainer
                                config={{
                                    value: { label: 'Total', color: 'var(--color-chart-1)' },
                                }}
                                className="h-full w-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={adminInteractive}
                                        margin={{ top: 10, right: 0, left: 0, bottom: 40 }}
                                        barCategoryGap={0}
                                        barSize={80}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis dataKey="metric" tickLine={false} axisLine={false} interval={0} height={60} tickMargin={12} />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                                        <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Bar dataKey="value" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                )}
                {/* Users table (admin-only) */}
                {role === 'admin' && (
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
                )}
            </div>
        </AppLayout>
    );
}
