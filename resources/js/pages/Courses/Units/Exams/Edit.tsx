import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';

interface Exam {
    id: number;
    unit_id: number;
    title: string;
    duration_minutes: number;
    passing_score: number;
    is_published: boolean;
}
interface Unit {
    id: number;
    title: string;
    course_id: number;
}
interface Course {
    id: number;
    name: string;
}

const course: Course = { id: 1, name: 'Sample Course' }; // Replace with actual data
const unit: Unit = { id: 1, title: 'Sample Unit', course_id: 1 }; // Replace with actual data

interface Props {
    exam: Exam;
}

export default function Edit({ exam }: Props) {
    function route(name: string, params?: (number | string)[]): string {
        // Simple implementation for demonstration purposes
        // In a real app, you might use a route helper or config
        if (name === 'courses.units.exams.update' && params && params.length === 3) {
            return `/courses/${params[0]}/units/${params[1]}/exams/${params[2]}`;
        }
        return '/';
    }

    const { data, setData, put, processing, errors } = useForm({
        title: exam.title,
        duration_minutes: exam.duration_minutes,
        passing_score: exam.passing_score,
        is_published: exam.is_published,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('courses.units.exams.update', [course.id, unit.id, exam.id]));
    };
    if (!exam || !unit || !course) {
        return (
            <AppLayout>
                <Head title="Exam Not Found" />
                <div className="w-8/12 p-4 text-center text-red-500">
                    Error: Required exam data not found. Please check your route/controller.
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit Exam', href: `/courses/${course.id}/units/${unit.id}/exams/${exam.id}/edit` }]}>
            <Head title={`Edit Exam: ${exam.title}`} />
            <div className='w-8/12 p-4'>
                <form onSubmit={handleUpdate} className='space-y-4'>
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
                    <Button type="submit" disabled={processing}>Update Exam</Button>
                </form>
            </div>
        </AppLayout>
    );
}