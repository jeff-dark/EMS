import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';


interface Student {
    id: number;
    name: string;
    email: string;
    username: string;
}
interface Props {
    student: Student;
}

export default function Edit({ student }: Props) {
    function route(name: string, id?: number): string {
        // Simple implementation for demonstration purposes
        // In a real app, you might use a route helper or config
        if (name === 'students.store') {
            return '/students';
        }
        if (name === 'students.update' && id !== undefined) {
            return `/students/${id}`;
        }
        return '/';
    }

    const { data, setData, put, processing, errors } = useForm({
        name: student.name,
        email: student.email,
        username: student.username,
        password: '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('students.update', student.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit Student', href: `/students/${student.id}/edit` }]}>
            <Head title="Edit Student" />
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
                        <Label htmlFor="student-name">Name</Label>
                        <Input type='text' placeholder="Enter student name" value={data.name} onChange={e => setData('name', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="student-email">Email</Label>
                        <Input type='email' placeholder="Enter student email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="student-username">Username</Label>
                        <Input type='text' placeholder="Enter student username" value={data.username} onChange={e => setData('username', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="student-password">Password</Label>
                        <Input type='password' placeholder="Enter new student password" value={data.password} onChange={e => setData('password', e.target.value)} />
                    </div>
                    <Button type="submit">Update Student</Button>
                </form>
            </div>
        </AppLayout>
    );
}


