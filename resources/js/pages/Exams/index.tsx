import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function ExamsIndex() {
    const { props } = usePage();
    const exams = (props as any).exams || [];

    return (
        <>
            <Head title="Exams" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">All Exams</h1>
                {exams.length === 0 ? (
                    <p>No exams found.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (min)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passing %</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {exams.map((exam: any) => (
                                    <tr key={exam.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{exam.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{exam.unit?.course?.title ?? '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{exam.unit?.title ?? '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{exam.duration_minutes}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{exam.passing_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
