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
        title: 'Instructors',
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

    const [q, setQ] = useState("");
    const [courseQ, setCourseQ] = useState("");
    const [minUnits, setMinUnits] = useState<string>("");

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        const cterm = courseQ.trim().toLowerCase();
        const mu = Number(minUnits);
        const hasMu = !Number.isNaN(mu) && minUnits !== "";
        return teachers.filter(t => {
            const name = t.name?.toLowerCase() ?? '';
            const email = t.email?.toLowerCase() ?? '';
            const coursesStr = (t.courses ?? []).join(', ').toLowerCase();
            const matchesUser = !term || name.includes(term) || email.includes(term);
            const matchesCourse = !cterm || coursesStr.includes(cterm);
            const matchesUnits = !hasMu || (t.units_count ?? 0) >= mu;
            return matchesUser && matchesCourse && matchesUnits;
        });
    }, [teachers, q, courseQ, minUnits]);

    const handleDelete = (id: number, name: string) => {
        if(confirm(`Are you sure you want to delete instructor ${id} - ${name}?`)) {
            destroy(route('teachers.destroy', id));
        }
    };

    const handleResetPassword = (id: number, name: string) => {
        if (!confirm(`Reset password for ${name} to 123456789?`)) return;
        router.post(`/teachers/${id}/reset-password`, {}, { preserveScroll: true });
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
            <Head title="Instructors" />
                <FilterBar
                right={<Link href={route('teachers.create')}><Button>Create Instructor</Button></Link>}
                onReset={() => { setQ(""); setCourseQ(""); setMinUnits(""); }}
            >
                <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name or email" />
                <Input value={courseQ} onChange={(e)=>setCourseQ(e.target.value)} placeholder="Filter by course name" />
                <Input value={minUnits} onChange={(e)=>setMinUnits(e.target.value)} placeholder="Min units" type="number" />
            </FilterBar>
            {/* Flash is shown globally in the layout (AppSidebarLayout) */}

            {filtered.length > 0 && (
                <div className="m-4">
                    <Table>
                        <TableCaption>A list of your recent instructors.</TableCaption>
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
                            {filtered.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.courses?.join(', ')}</TableCell>
                                    <TableCell>{teacher.units_count}</TableCell>
                                    <TableCell className="text-center">
                                        <ActionMenu
                                            items={[ 
                                                { label: 'Edit', href: route('teachers.edit', teacher.id) },
                                                // { label: 'Load', href: route('teachers.load', teacher.id) },
                                                { label: 'Reset Password', onClick: () => handleResetPassword(teacher.id, teacher.name), variant: 'default' },
                                                { label: 'Delete', onClick: () => handleDelete(teacher.id, teacher.name), variant: 'destructive', disabled: processing },
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
