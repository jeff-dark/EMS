import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Create New Unit',
		href: '/units/create',
	},
];

export default function Create({ course }: { course: { id: number; name: string } }) {
	function route(name: string, courseId?: number): string {
		if (name === 'units.store' && courseId !== undefined) {
			return `/courses/${courseId}/units`;
		}
		return '/';
	}

	const { data, setData, post, processing, errors } = useForm({
		title: '',
		summary: '',
		order: 1,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post(route('units.store', course.id));
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Create New Unit" />
			<div className='w-8/12 p-4'>
				<form onSubmit={handleSubmit} className='space-y-4'>
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
					<Button type="submit" disabled={processing}>Create Unit</Button>
				</form>
			</div>
		</AppLayout>
	);
}
