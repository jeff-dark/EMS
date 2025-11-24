import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import React, { useMemo } from 'react';

interface Unit { id:number; title:string; course_id:number }
interface Course { id:number; name:string; units: Unit[] }
interface TeacherUnit { id:number; title:string; course_id:number }
interface TeacherData { id:number; user:{ id:number; name:string; email:string; username?: string }; contact_phone?:string; hire_date?:string; units: TeacherUnit[] }
interface PageProps { teacher: TeacherData; courses: Course[] }

export default function Edit({ teacher, courses }: PageProps) {
    function route(name: string, id?: number): string {
        if (name === 'teachers.update' && id) return `/teachers/${id}`;
        return '/teachers';
    }

    const { data, setData, put, processing, errors } = useForm({
        name: teacher.user.name || '',
        email: teacher.user.email || '',
        username: teacher.user.username || '',
        password: '',
        contact_phone: teacher.contact_phone || '',
        hire_date: teacher.hire_date || '',
        courses: Array.from(new Set(teacher.units.map(u => u.course_id))) as number[],
        units: teacher.units.map(u => u.id) as number[],
    });

    const filteredUnits = useMemo(() => {
        return courses
            .filter(c => data.courses.includes(c.id))
            .flatMap(c => c.units.map(u => ({ ...u, courseName: c.name })));
    }, [courses, data.courses]);

    const toggleArrayValue = (field: 'courses'|'units', value:number) => {
        const current = data[field] as number[];
        const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
        setData(field, next as any);
        if (field === 'courses') {
            // Remove units that no longer belong to selected courses
            if (!next.includes(value)) {
                const validUnitIds = new Set(courses.filter(c => next.includes(c.id)).flatMap(c => c.units.map(u => u.id)));
                setData('units', (data.units as number[]).filter(id => validUnitIds.has(id)) as any);
            }
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('teachers.update', teacher.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit Instructor', href: `/teachers/${teacher.id}/edit` }]}>            
            <Head title={`Edit Instructor - ${teacher.user.name}`} />
            <div className='w-full max-w-5xl p-4 space-y-6'>
                <h1 className='text-2xl font-semibold'>Edit Instructor Details - {teacher.user.name}</h1>
                <form onSubmit={handleUpdate} className='space-y-6'>
                    {Object.keys(errors).length > 0 && (
                        <Alert variant='destructive'>
                            <OctagonAlert />
                            <AlertTitle>Errors</AlertTitle>
                            <AlertDescription>
                                {Object.values(errors).map((error, index) => <div key={index}>{error}</div>)}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='grid md:grid-cols-4 gap-4'>
                        <div>
                            <Label>Name</Label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                            {errors.name && <p className='text-red-600 text-sm'>{errors.name}</p>}
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input type='email' value={data.email} onChange={e => setData('email', e.target.value)} />
                            {errors.email && <p className='text-red-600 text-sm'>{errors.email}</p>}
                        </div>
                        <div>
                            <Label>Username</Label>
                            <Input value={data.username} onChange={e => setData('username', e.target.value)} />
                            {errors.username && <p className='text-red-600 text-sm'>{errors.username}</p>}
                        </div>
                        <div>
                            <Label>Password <span className='text-xs'>(leave blank to keep unchanged)</span></Label>
                            <Input type='password' value={data.password} onChange={e => setData('password', e.target.value)} autoComplete='new-password' />
                            {errors.password && <p className='text-red-600 text-sm'>{errors.password}</p>}
                        </div>
                    </div>

                    <div className='grid md:grid-cols-3 gap-4'>
                        <div>
                            <Label>Contact Phone</Label>
                            <Input value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)} />
                            {errors.contact_phone && <p className='text-red-600 text-sm'>{errors.contact_phone}</p>}
                        </div>
                        <div>
                            <Label>Hire Date</Label>
                            <Input type='date' value={data.hire_date} onChange={e => setData('hire_date', e.target.value)} />
                            {errors.hire_date && <p className='text-red-600 text-sm'>{errors.hire_date}</p>}
                        </div>
                    </div>

                    <div className='grid md:grid-cols-2 gap-8'>
                        <div>
                            <h2 className='font-semibold mb-2'>Courses</h2>
                            <div className='space-y-2 max-h-64 overflow-auto border p-3 rounded'>
                                {courses.map(course => (
                                    <label key={course.id} className='flex items-center space-x-2'>
                                        <input type='checkbox' checked={data.courses.includes(course.id)} onChange={() => toggleArrayValue('courses', course.id)} />
                                        <span>{course.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.courses && <p className='text-red-600 text-sm mt-1'>{errors.courses}</p>}
                        </div>
                        <div>
                            <h2 className='font-semibold mb-2'>Units</h2>
                            <div className='space-y-2 max-h-64 overflow-auto border p-3 rounded'>
                                {filteredUnits.map(unit => (
                                    <label key={unit.id} className='flex items-center space-x-2'>
                                        <input type='checkbox' checked={data.units.includes(unit.id)} onChange={() => toggleArrayValue('units', unit.id)} />
                                        <span>{unit.title} <span className='text-xs text-gray-500'>({unit.courseName})</span></span>
                                    </label>
                                ))}
                            </div>
                            {errors.units && <p className='text-red-600 text-sm mt-1'>{errors.units}</p>}
                        </div>
                    </div>

                    <Button disabled={processing} type='submit'>{processing ? 'Saving...' : 'Save Changes'}</Button>
                </form>
            </div>
        </AppLayout>
    );
}


