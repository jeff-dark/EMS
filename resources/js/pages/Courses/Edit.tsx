import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';


interface course {
    id: number;
    name: string;
    description: string;
}
interface Props {
    course: course;
}

export default function Edit({ course }: Props) {
    function route(name: string, id?: number): string {
        // Simple implementation for demonstration purposes
        // In a real app, you might use a route helper or config
        if (name === 'courses.store') {
            return '/courses';
        }
        if (name === 'courses.update' && id !== undefined) {
            return `/courses/${id}`;
        }
        return '/';
    }

    const { data, setData, put, processing, errors } = useForm({
        name: course.name,
        description: course.description,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('courses.update', course.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit course', href: `/courses/${course.id}/edit` }]}>
            <Head title="Edit course" />
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
                        <Label htmlFor="course-name">Name</Label>
                        <Input type='text' placeholder="Enter course name" value={data.name} onChange={e => setData('name', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="course-description">Email</Label>
                        <Input type='description' placeholder="Enter course description" value={data.description} onChange={e => setData('description', e.target.value)} />
                    </div>
                    <Button type="submit">Update course</Button>
                </form>
            </div>
        </AppLayout>
    );
}


