import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Course { id:number; name:string }
interface Unit { id:number; title:string; course:Course }
interface TeacherRow { id:number; name:string; email:string; assignment_status:string }
interface PageProps { unit: Unit; teachers: TeacherRow[] }

export default function UnitAssignments({ unit, teachers }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: `Unit: ${unit.title}`, href: '#' }]}>      
      <Head title={`Unit Instructors - ${unit.title}`} />
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">Instructors for Unit: {unit.title} ({unit.course.name})</h1>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Instructor</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.email}</td>
                <td className="p-2">{t.assignment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
