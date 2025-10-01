import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';


interface Teacher {
    id: number;
    name: string;
    email: string;
    username: string;
}
interface Props {
    teacher: Teacher;
}

export default function Edit({ teacher }: Props) {
    function route(name: string, id?: number): string {
        // Simple implementation for demonstration purposes
        // In a real app, you might use a route helper or config
        if (name === 'teachers.store') {
            return '/teachers';
        }
        if (name === 'teachers.update' && id !== undefined) {
            return `/teachers/${id}`;
        }
        return '/';
    }

    const { data, setData, put, processing, errors } = useForm({
        name: teacher.name,
        email: teacher.email,
        username: teacher.username,
        password: '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('teachers.update', teacher.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit Teacher', href: `/teachers/${teacher.id}/edit` }]}>
            <Head title="Edit Teacher" />
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
                        <Label htmlFor="teacher-name">Name</Label>
                        <Input type='text' placeholder="Enter teacher name" value={data.name} onChange={e => setData('name', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="teacher-email">Email</Label>
                        <Input type='email' placeholder="Enter teacher email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="teacher-username">Username</Label>
                        <Input type='text' placeholder="Enter teacher username" value={data.username} onChange={e => setData('username', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="teacher-password">Password</Label>
                        <Input type='password' placeholder="Enter new teacher password" value={data.password} onChange={e => setData('password', e.target.value)} />
                    </div>
                    <Button type="submit">Update Teacher</Button>
                </form>
            </div>
        </AppLayout>
    );
}


