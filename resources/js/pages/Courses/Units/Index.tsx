import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ActionMenu from "@/components/ui/action-menu";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import { Bell } from "lucide-react";
import FilterBar from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Unit {
    id: number;
    title: string;
    summary: string;
    order: number;
}

interface Course {
    id: number;
    name: string;
    description: string;
}

interface PageProps {
    course: Course;
    units: Unit[];
    flash: { message?: string };
    [key: string]: any;
}

export default function Index() {
    const { course, units, flash } = usePage<PageProps>().props;
    const page: any = usePage();
    const role: string | undefined = page?.props?.auth?.role || page?.props?.authUser?.role;
    const { processing, delete: destroy } = useForm();

    const [q, setQ] = useState("");
    const [orderSort, setOrderSort] = useState<string>("none");

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        let data = units.filter(u => {
            if (!term) return true;
            const title = u.title?.toLowerCase() ?? '';
            const summary = u.summary?.toLowerCase() ?? '';
            return title.includes(term) || summary.includes(term);
        });
        if (orderSort === 'asc') data = [...data].sort((a,b)=>a.order-b.order);
        if (orderSort === 'desc') data = [...data].sort((a,b)=>b.order-a.order);
        return data;
    }, [units, q, orderSort]);

    function route(name: string, param?: number): string {
        const routes: Record<string, (param?: number) => string> = {
            "units.create": (id?: number) => `/courses/${id}/units/create`,
            "units.edit": (id?: number) => `/courses/${course.id}/units/${id}/edit`,
            "units.destroy": (id?: number) => `/courses/${course.id}/units/${id}`,
        };
        return routes[name] ? routes[name](param) : "/";
    }

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete unit "${title}"?`)) {
            destroy(route("units.destroy", id));
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: "Courses", href: "/courses" },
            { title: course.name, href: `/courses/${course.id}/units` }
        ]}>
            <Head title={`Units for ${course.name}`} />
            <FilterBar
                right={role === 'admin' ? (<Link href={route("units.create", course.id)}><Button>Create Unit</Button></Link>) : undefined}
                onReset={() => { setQ(""); setOrderSort("none"); }}
            >
                <Input
                    value={q}
                    onChange={(e)=>setQ(e.target.value)}
                    placeholder="Search title or summary"
                />
                <Select value={orderSort} onValueChange={setOrderSort}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Sort: None</SelectItem>
                        <SelectItem value="asc">Order: Low → High</SelectItem>
                        <SelectItem value="desc">Order: High → Low</SelectItem>
                    </SelectContent>
                </Select>
            </FilterBar>
            <div className="m-4">
                {flash.message && (
                    <Alert>
                        <Bell />
                        <AlertTitle>Notification!</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}
            </div>
            {filtered.length > 0 ? (
                <div className="m-4">
                    <Table>
                        <TableCaption>List of units for this course</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Summary</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(unit => (
                                <TableRow
                                    key={unit.id}
                                    className="cursor-pointer transition hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                                    onClick={() => router.get(`/courses/${course.id}/units/${unit.id}/exams`)}
                                >
                                    <TableCell>{unit.order}</TableCell>
                                    <TableCell>{unit.title}</TableCell>
                                    <TableCell>{unit.summary}</TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            items={[
                                                { label: 'Edit', href: route("units.edit", unit.id) },
                                                { label: 'Delete', onClick: () => handleDelete(unit.id, unit.title), variant: 'destructive', disabled: processing },
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="m-4 text-muted-foreground">No units found for this course.</div>
            )}
        </AppLayout>
    );
}
