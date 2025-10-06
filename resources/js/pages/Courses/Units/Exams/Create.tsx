import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';

interface Unit {
    id: number;
    title: string;
}

interface Course {
    id: number;
    name: string;
}

interface PageProps extends InertiaPageProps {
    course: Course;
    unit: Unit;
}

export default function Index() {
    const { course, unit } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Create Exam',
            href: `/courses/${course.id}/units/${unit.id}/exams/create`,
        },
    ];

    function route(name: string, params: (string | number)[]): string {
        // Simple implementation for demonstration purposes
        // In a real app, you might use a route helper or config
        if (name === 'courses.units.exams.store' && params.length === 2) {
            return `/courses/${params[0]}/units/${params[1]}/exams`;
        }
        return '/';
    }

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        duration_minutes: 60,
        passing_score: 70,
        is_published: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('courses.units.exams.store', [course.id, unit.id]));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Exam for ${unit.title}`} />
            <div className='w-8/12 p-4'>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Display validation errors */}
                    {errors && Object.keys(errors).length > 0 && (
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
                        <Label htmlFor="exam-title">Title</Label>
                        <Input type='text' placeholder="Enter exam title" value={data.title} onChange={e => setData('title', e.target.value)} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="exam-duration">Duration (minutes)</Label>
                        <Input type='number' min={1} placeholder="Enter duration in minutes" value={data.duration_minutes} onChange={e => setData('duration_minutes', Number(e.target.value))} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="exam-passing-score">Passing Score</Label>
                        <Input type='number' min={0} max={100} step={0.01} placeholder="Enter passing score" value={data.passing_score} onChange={e => setData('passing_score', Number(e.target.value))} />
                    </div>
                    <div className='gap-2'>
                        <Label htmlFor="exam-published">Published</Label>
                        <input type='checkbox' checked={data.is_published} onChange={e => setData('is_published', e.target.checked)} />
                    </div>
                    <Button type="submit" disabled={processing}>Create Exam</Button>
                </form>
            </div>
        </AppLayout>
    );
}