import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Course { id:number; name:string }
interface UnitRow { id:number; title:string; course: Course; assignment_status:string }
interface Teacher { user: { name:string } }
interface PageProps { teacher: Teacher; units: UnitRow[] }

export default function Load({ teacher, units }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Teaching Load', href: '#' }]}>      
      <Head title={`Teaching Load - ${teacher.user.name}`} />
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Teaching Load - {teacher.user.name}</h1>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-left">Unit</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {units.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.course.name}</td>
                <td className="p-2">{u.title}</td>
                <td className="p-2">{u.assignment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
