import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ActionMenu from "@/components/ui/action-menu";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import { Bell } from "lucide-react";
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
    const { processing, delete: destroy } = useForm();

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
            <div className="m-4">
                <Link href={route("units.create", course.id)}>
                    <Button>Create Unit</Button>
                </Link>
            </div>
            <div className="m-4">
                {flash.message && (
                    <Alert>
                        <Bell />
                        <AlertTitle>Notification!</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}
            </div>
            {units.length > 0 ? (
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
                            {units.map(unit => (
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
