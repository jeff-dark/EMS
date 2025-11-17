import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Course { id:number; name:string }
interface TeacherRow { id:number; name:string; email:string; units:string[] }
interface PageProps { course: Course; teachers: TeacherRow[] }

export default function CourseAssignments({ course, teachers }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: `Course: ${course.name}`, href: '#' }]}>      
      <Head title={`Course Instructors - ${course.name}`} />
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Instructors for Course: {course.name}</h1>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Instructor</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Units Teaching</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.email}</td>
                <td className="p-2">{t.units.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
