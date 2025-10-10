import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import ActionMenu from '@/components/ui/action-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admins" />
            <div className='m-4'>
                <Link href={route('admins.create')}><Button>Create Admin</Button></Link>
            </div>
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

            {admins.length > 0 && (
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
                            {admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell>{admin.name}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>{admin.username}</TableCell>
                                    <TableCell className="text-center">
                                        <ActionMenu
                                            items={[
                                                { label: 'Edit', href: route('admins.edit', admin.id) },
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
