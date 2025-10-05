import { Link, Head, usePage } from '@inertiajs/react';
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
    course_id: number;
}

interface Course {
    id: number;
    name: string;
}

interface ExamsIndexProps extends PageProps {
    course: Course;
    unit: Unit;
    exams: Exam[];
}

export default function Index({ auth, course, unit, exams }: ExamsIndexProps) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Exams for Unit: {unit.title} ({course.name})
                </h2>
            }
        >
            <Head title={`Exams for ${unit.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Success Flash Message */}
                    {flash.message && (
                        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                            {flash.message as string}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Exam List</h3>
                            <Link 
                                href={route('courses.units.exams.create', [course.id, unit.id])}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                Create New Exam
                            </Link>
                        </div>

                        {exams.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (min)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {exams.map((exam) => (
                                        <tr key={exam.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration_minutes}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.passing_score}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {exam.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link 
                                                    href={route('courses.units.exams.edit', [course.id, unit.id, exam.id])}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </Link>
                                                {/* Link to manage exam questions would go here */}
                                                
                                                <Link 
                                                    href={route('courses.units.exams.destroy', [course.id, unit.id, exam.id])}
                                                    method="delete"
                                                    as="button"
                                                    className="text-red-600 hover:text-red-900"
                                                    preserveScroll
                                                    onClick={() => confirm('Are you sure you want to delete this exam?')}
                                                >
                                                    Delete
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No exams found for this unit. Time to create one!</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}