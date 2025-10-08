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
    courses: any[];
    studentCourses: string[];
}

export default function Edit({ student, courses = [], studentCourses = [] }: Props) {
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

    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        email: string;
        username: string;
        password: string;
        courses: string[];
    }>({
        name: student.name,
        email: student.email,
        username: student.username,
        password: '',
        courses: studentCourses || [],
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
                    <div className='gap-2'>
                        <Label>Courses (max 2)</Label>
                        <div className="flex flex-col gap-2">
                            {courses.map((course: any) => (
                                <label key={course.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={course.id}
                                        checked={data.courses.includes(course.id)}
                                        onChange={e => {
                                            let selected = [...data.courses];
                                            if (e.target.checked) {
                                                if (selected.length < 2) {
                                                    selected.push(course.id);
                                                }
                                            } else {
                                                selected = selected.filter(id => id !== course.id);
                                            }
                                            setData('courses', selected);
                                        }}
                                    />
                                    {course.name}
                                </label>
                            ))}
                        </div>
                        {data.courses.length > 2 && (
                            <div className="text-red-500 text-sm">You can select up to 2 courses only.</div>
                        )}
                    </div>
                    <Button type="submit">Update Student</Button>
                </form>
            </div>
        </AppLayout>
    );
}


