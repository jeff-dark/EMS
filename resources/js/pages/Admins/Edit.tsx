import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';


interface Admin {
    id: number;
    name: string;
    email: string;
    username: string;
}
interface Props {
    admin: Admin;
}

export default function Edit({ admin }: Props) {
    function route(name: string, id?: number): string {
        // Simple implementation for demonstration purposes
        // In a real app, you might use a route helper or config
        if (name === 'admins.store') {
            return '/admins';
        }
        if (name === 'admins.update' && id !== undefined) {
            return `/admins/${id}`;
        }
        return '/';
    }

    const { data, setData, put, processing, errors } = useForm({
        name: admin.name,
        email: admin.email,
        username: admin.username,
        password: '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admins.update', admin.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit Admin', href: `/admins/${admin.id}/edit` }]}>
            <Head title="Edit Admin" />
            <div className='w-8/12 p-4'>
                <form onSubmit={handleUpdate} className='space-y-4'>
                    {/* Display validation errors */}
                    {Object.keys(errors).length > 0 && (
                        <Alert>
                            <OctagonAlert />
                            <AlertTitle>Errors</AlertTitle>
                            <AlertDescription>
                                {Object.values(errors).map((error, index) => (
                                    <div key={index}>{error}</div>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}


                    <div className='gap-2'>
                        <Label htmlFor="admin-name">Name</Label>
                        <Input type='text' placeholder="Enter admin name" value={data.name} onChange={e => setData('name', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="admin-email">Email</Label>
                        <Input type='email' placeholder="Enter admin email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="admin-username">Username</Label>
                        <Input type='text' placeholder="Enter admin username" value={data.username} onChange={e => setData('username', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="admin-password">Password</Label>
                        <Input type='password' placeholder="Enter new admin password" value={data.password} onChange={e => setData('password', e.target.value)} />
                    </div>
                    <Button type="submit">Update Admin</Button>
                </form>
            </div>
        </AppLayout>
    );
}


