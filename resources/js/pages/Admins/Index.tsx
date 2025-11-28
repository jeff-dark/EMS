import { Button } from '@/components/ui/button';
import ActionMenu from '@/components/ui/action-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
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

type PageProps = {
    admins: Admin[];
    flash: {
        message?: string;
    };
    // We intersect this in the usePage hook, but defining it here helps too
    auth?: { user?: { email?: string } };
    [key: string]: any;
};

export default function Index() {
    // 1. Get the authenticated user from global Inertia props with strict typing
    const { props } = usePage<{ auth?: { user?: { email?: string } } } & PageProps>();
    const { auth, admins = [] } = props;

    // 2. Define the allowed email
    const ALLOWED_EMAIL = 'jeffkamau8501@gmail.com';

    // 3. Security Check
    if (!(auth?.user?.email && auth.user.email === ALLOWED_EMAIL)) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admins" />
                <div className="m-4">
                    <h1 className="text-xl font-semibold">Unauthorized</h1>
                </div>
            </AppLayout>
        );
    }

    const { delete: destroy } = useForm();
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

    // Helper for routes (handles both global Ziggy and manual fallback)
    function route(name: string, param?: number): string {
        // @ts-ignore
        if (typeof window.route === 'function') {
            // @ts-ignore
            return window.route(name, param);
        }
        
        const routes: Record<string, (param?: number) => string> = {
            'admins.create': () => '/admins/create',
            'admins.edit': (id?: number) => `/admins/${id}/edit`,
            'admins.destroy': (id?: number) => `/admins/${id}`,
        };
        return routes[name] ? routes[name](param) : '/';
    }

    const handleDelete = (id: number, name: string) => {
        if(confirm(`Are you sure you want to delete admin ${id} - ${name}?`)) {
            destroy(route('admins.destroy', id));
        }
    };

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
                                                // Uncomment below to enable delete
                                                // { label: 'Delete', onClick: () => handleDelete(admin.id, admin.name), variant: 'destructive' },
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}       
                        </TableBody>
                    </Table>
                </div>
            )}
             {filtered.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No admins found matching "{q}"
                </div>
            )}
        </AppLayout>
    );
}