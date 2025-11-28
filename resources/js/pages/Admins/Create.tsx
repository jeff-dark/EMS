import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create New Admin',
        href: '/admins/create',
    },
];

type PageProps = {
    flash: {
        message?: string;
    };
    // We intersect this in the usePage hook, but defining it here helps too
    auth?: { user?: { email?: string } };
    [key: string]: any;
};


export default function Index() {

    const { props } = usePage<{ auth?: { user?: { email?: string } } } & PageProps>();
        const { auth, admins = [] } = props;

        // 2. Define the allowed email
        const ALLOWED_EMAIL = 'jeffkamau8501@gmail.com';

        // 3. Security Check
        if (!(auth?.user?.email && auth.user.email === ALLOWED_EMAIL)) {
            return (
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="Create New Admin" />
                    <div className="m-4">
                        <h1 className="text-xl font-semibold">Unauthorized</h1>
                    </div>
                </AppLayout>
            );
        }

    function route(name: string): string {
        // Simple implementation for demonstration purposes
        // In a real app, you might use a route helper or config
        if (name === 'admins.store') {
            return '/admins';
        }
        return '/';
    }

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        username: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admins.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Admin" />
            <div className='w-8/12 p-4'>
                <form onSubmit={handleSubmit} className='space-y-4'>
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
                        <Input type='password' placeholder="Enter admin password" value={data.password} onChange={e => setData('password', e.target.value)} />
                    </div>
                    <Button type="submit">Create Admin</Button>
                </form>
            </div>
        </AppLayout>
    );
}


