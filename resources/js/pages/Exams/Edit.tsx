import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Adjust path if needed
import { PageProps } from '@/types'; // Adjust path if needed

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
}

interface Course {
    id: number;
    name: string;
}

interface ExamsEditProps extends PageProps {
    course: Course;
    unit: Unit;
    exam: Exam;
}

export default function Edit({ auth, course, unit, exam }: ExamsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: exam.title,
        duration_minutes: exam.duration_minutes,
        passing_score: exam.passing_score,
        is_published: exam.is_published,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Route: courses/{course}/units/{unit}/exams/{exam}
        put(route('courses.units.exams.update', [course.id, unit.id, exam.id]));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Exam: {exam.title}</h2>}
        >
            <Head title={`Edit Exam: ${exam.title}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Unit: {unit.title} / Course: {course.name}</h3>
                        <form onSubmit={submit}>
                            {/* Title Field */}
                            <div className="mb-4">
                                <label htmlFor="title" className="block font-medium text-sm text-gray-700">Exam Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    autoFocus
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <div className="text-red-500 mt-2 text-sm">{errors.title}</div>}
                            </div>

                            {/* Duration Field */}
                            <div className="mb-4">
                                <label htmlFor="duration_minutes" className="block font-medium text-sm text-gray-700">Duration (Minutes)</label>
                                <input
                                    id="duration_minutes"
                                    type="number"
                                    name="duration_minutes"
                                    min="1"
                                    value={data.duration_minutes}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                />
                                {errors.duration_minutes && <div className="text-red-500 mt-2 text-sm">{errors.duration_minutes}</div>}
                            </div>

                            {/* Passing Score Field */}
                            <div className="mb-4">
                                <label htmlFor="passing_score" className="block font-medium text-sm text-gray-700">Passing Score (%)</label>
                                <input
                                    id="passing_score"
                                    type="number"
                                    name="passing_score"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.passing_score}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    onChange={(e) => setData('passing_score', parseFloat(e.target.value))}
                                />
                                {errors.passing_score && <div className="text-red-500 mt-2 text-sm">{errors.passing_score}</div>}
                            </div>

                            {/* Is Published Checkbox */}
                            <div className="mb-4 flex items-center">
                                <input
                                    id="is_published"
                                    type="checkbox"
                                    name="is_published"
                                    checked={data.is_published}
                                    className="mr-2 border-gray-300 rounded shadow-sm text-indigo-600 focus:ring-indigo-500"
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                />
                                <label htmlFor="is_published" className="font-medium text-sm text-gray-700">Publish Exam?</label>
                                {errors.is_published && <div className="text-red-500 mt-2 text-sm">{errors.is_published}</div>}
                            </div>

                            <div className="flex items-center justify-end mt-4">
                                <Link
                                    href={route('courses.units.exams.index', [course.id, unit.id])}
                                    className="mr-4 text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-25 transition ease-in-out duration-150"
                                    disabled={processing}
                                >
                                    Update Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}