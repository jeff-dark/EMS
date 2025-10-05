import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';

interface Unit {
	id: number;
	title: string;
	summary: string;
	order: number;
}
interface Props {
	course: { id: number; name: string };
	unit: Unit;
}

export default function Edit({ course, unit }: Props) {
	function route(name: string, courseId?: number, unitId?: number): string {
		if (name === 'units.update' && courseId !== undefined && unitId !== undefined) {
			return `/courses/${courseId}/units/${unitId}`;
		}
		return '/';
	}

	const { data, setData, put, processing, errors } = useForm({
		title: unit.title,
		summary: unit.summary,
		order: unit.order,
	});

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		put(route('units.update', course.id, unit.id));
	};

	return (
		<AppLayout breadcrumbs={[{ title: 'Edit Unit', href: `/courses/${course.id}/units/${unit.id}/edit` }]}>
			<Head title="Edit Unit" />
			<div className='w-8/12 p-4'>
				<form onSubmit={handleUpdate} className='space-y-4'>
					{/* Display validation errors */}
					{Object.keys(errors).length > 0 && (
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
						<Label htmlFor="unit-title">Title</Label>
						<Input type='text' placeholder="Enter unit title" value={data.title} onChange={e => setData('title', e.target.value)} />
					</div>
					<div className='gap-2'>
						<Label htmlFor="unit-summary">Summary</Label>
						<Input type='text' placeholder="Enter unit summary" value={data.summary} onChange={e => setData('summary', e.target.value)} />
					</div>
					<div className='gap-2'>
						<Label htmlFor="unit-order">Order</Label>
						<Input type='number' min={1} placeholder="Enter unit order" value={data.order} onChange={e => setData('order', Number(e.target.value))} />
					</div>
					<Button type="submit" disabled={processing}>Update Unit</Button>
				</form>
			</div>
		</AppLayout>
	);
}
