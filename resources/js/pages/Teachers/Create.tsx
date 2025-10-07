import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import React, { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Register Teacher', href: '/teachers/create' },
];

interface Unit { id:number; title:string; course_id:number; }
interface Course { id:number; name:string; units: Unit[] }
interface UserOption { id:number; name:string; email:string }
interface PageProps { courses: Course[]; availableUsers: UserOption[]; prefillUserId?: number|null }

export default function Create(props: PageProps) {
    const { courses = [], availableUsers = [], prefillUserId = null } = props;

    function route(name: string): string {
        if (name === 'teachers.store') return '/teachers';
        return '/';
    }

    const { data, setData, post, processing, errors } = useForm({
        create_new_user: prefillUserId ? false : true,
        user_id: prefillUserId ? String(prefillUserId) : '',
        new_user: {
            name: '',
            email: '',
            username: '',
            password: '',
        },
        contact_phone: '',
        hire_date: '',
        courses: [] as number[],
        units: [] as number[],
    });

    const filteredUnits = useMemo(() => {
        if (!data.courses.length) return [] as { id:number; title:string; courseName:string }[];
        return courses
            .filter(c => data.courses.includes(c.id))
            .flatMap(c => c.units.map(u => ({ id: u.id, title: u.title, courseName: c.name })));
    }, [data.courses, courses]);

    const toggleArrayValue = (field: 'courses'|'units', value: number) => {
        const current = data[field] as number[];
        const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
        setData(field, next as any);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teachers.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Teacher" />
            <div className='w-full max-w-5xl p-4 space-y-6'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <OctagonAlert />
                            <AlertTitle>Errors</AlertTitle>
                            <AlertDescription>
                                {Object.values(errors).map((error, index) => <div key={index}>{error}</div>)}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='space-y-2'>
                        <Label className='font-semibold'>Teacher Account</Label>
                        <div className='flex items-center space-x-4'>
                            <label className='flex items-center space-x-2'>
                                <input
                                    type='radio'
                                    name='user_mode'
                                    checked={data.create_new_user === true}
                                    onChange={() => setData({ ...data, create_new_user: true, user_id: '' })}
                                />
                                <span>Create New User</span>
                            </label>
                            <label className='flex items-center space-x-2'>
                                <input
                                    type='radio'
                                    name='user_mode'
                                    checked={data.create_new_user === false}
                                    onChange={() => setData({ ...data, create_new_user: false })}
                                />
                                <span>Use Existing User</span>
                            </label>
                        </div>
                        {!data.create_new_user && (
                            <div>
                                <Label>Select Existing User</Label>
                                <select
                                    className='border rounded w-full p-2 mt-1'
                                    value={data.user_id}
                                    onChange={e => setData('user_id', e.target.value)}
                                >
                                    <option value=''>-- Choose User --</option>
                                    {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                                {errors.user_id && <p className='text-red-600 text-sm'>{errors.user_id}</p>}
                            </div>
                        )}
                        {data.create_new_user && (
                            <div className='grid md:grid-cols-2 gap-4'>
                                <div>
                                    <Label>Name</Label>
                                    <Input value={data.new_user.name} onChange={e => setData('new_user', { ...data.new_user, name: e.target.value })} />
                                    {errors['new_user.name'] && <p className='text-red-600 text-sm'>{errors['new_user.name']}</p>}
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input type='email' value={data.new_user.email} onChange={e => setData('new_user', { ...data.new_user, email: e.target.value })} />
                                    {errors['new_user.email'] && <p className='text-red-600 text-sm'>{errors['new_user.email']}</p>}
                                </div>
                                <div>
                                    <Label>Username</Label>
                                    <Input value={data.new_user.username} onChange={e => setData('new_user', { ...data.new_user, username: e.target.value })} />
                                    {errors['new_user.username'] && <p className='text-red-600 text-sm'>{errors['new_user.username']}</p>}
                                </div>
                                <div>
                                    <Label>Password</Label>
                                    <Input type='password' value={data.new_user.password} onChange={e => setData('new_user', { ...data.new_user, password: e.target.value })} />
                                    {errors['new_user.password'] && <p className='text-red-600 text-sm'>{errors['new_user.password']}</p>}
                                </div>
                            </div>
                        )}
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
                            <h2 className='font-semibold mb-2'>Select Courses</h2>
                            <div className='space-y-2 max-h-64 overflow-auto border p-3 rounded'>
                                {courses.map(course => (
                                    <label key={course.id} className='flex items-center space-x-2'>
                                        <input
                                            type='checkbox'
                                            checked={data.courses.includes(course.id)}
                                            onChange={() => toggleArrayValue('courses', course.id)}
                                        />
                                        <span>{course.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.courses && <p className='text-red-600 text-sm mt-1'>{errors.courses}</p>}
                        </div>
                        <div>
                            <h2 className='font-semibold mb-2'>Select Units (Filtered)</h2>
                            <div className='space-y-2 max-h-64 overflow-auto border p-3 rounded'>
                                {!filteredUnits.length && <p className='text-sm text-gray-600'>Select at least one course.</p>}
                                {filteredUnits.map(unit => (
                                    <label key={unit.id} className='flex items-center space-x-2'>
                                        <input
                                            type='checkbox'
                                            checked={data.units.includes(unit.id)}
                                            onChange={() => toggleArrayValue('units', unit.id)}
                                        />
                                        <span>{unit.title} <span className='text-xs text-gray-500'>({unit.courseName})</span></span>
                                    </label>
                                ))}
                            </div>
                            {errors.units && <p className='text-red-600 text-sm mt-1'>{errors.units}</p>}
                        </div>
                    </div>

                    <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Teacher & Assign Units'}</Button>
                </form>
            </div>
        </AppLayout>
    );
}


