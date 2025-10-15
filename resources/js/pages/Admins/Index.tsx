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
        title: 'Admins',
        href: '/admins',
    },
];

interface Admin {
    id: number;
    name: string;
    email: string;
    username: string;
}

interface PageProps {
    admins: Admin[];
    flash: {
        message?: string;
    };
}

export default function Index() {

    const page = usePage().props as unknown as Partial<PageProps> & { [key:string]: any };
    const admins = page.admins || [];
    const flash = page.flash || {};

    const {processing, delete: destroy} = useForm();

    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return admins;
        return admins.filter(a => {
            const name = a.name?.toLowerCase() ?? '';
            const email = a.email?.toLowerCase() ?? '';
            const username = a.username?.toLowerCase() ?? '';
            return name.includes(term) || email.includes(term) || username.includes(term);
        });
    }, [admins, q]);

    const handleDelete = (id: number, name: string) => {
        // Implement delete functionality here
        if(confirm(`Are you sure you want to delete admin ${id} - ${name}?`)) {
            destroy(route('admins.destroy', id));
        }
    };

    // Simple implementation assuming route names map directly to paths
    function route(name: string, param?: number): string {
        const routes: Record<string, (param?: number) => string> = {
            'admins.create': () => '/admins/create',
            'admins.edit': (id?: number) => `/admins/${id}/edit`,
            'admins.destroy': (id?: number) => `/admins/${id}`,
            // Add more routes as needed
        };
        return routes[name] ? routes[name](param) : '/';
    }
    const handleResetPassword = (id: number, name: string) => {
        if (!confirm(`Reset password for ${name} to 123456789?`)) return;
        router.post(`/admins/${id}/reset-password`, {}, { preserveScroll: true });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admins" />
            <FilterBar
                right={<Link href={route('admins.create')}><Button>Create Admin</Button></Link>}
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
                        <TableCaption>A list of your recent admins.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell>{admin.name}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>{admin.username}</TableCell>
                                    <TableCell className="text-center">
                                        <ActionMenu
                                            items={[ 
                                                { label: 'Edit', href: route('admins.edit', admin.id) },
                                                { label: 'Reset Password', onClick: () => handleResetPassword(admin.id, admin.name), variant: 'default' },
                                                { label: 'Delete', onClick: () => handleDelete(admin.id, admin.name), variant: 'destructive', disabled: processing },
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
