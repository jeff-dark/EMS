import AppLayout from '@/layouts/app-layout'
import { Head, Link, useForm } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FormEvent } from 'react'

interface Unit { id: number; title: string }
interface Doc { id: number; title: string; description?: string | null; unit: Unit; created_at: string; size: number; mime: string }

export default function TeacherRevisionIndex({ units = [], documents = [] }: { units: Unit[]; documents: Doc[] }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    unit_id: units[0]?.id ?? '',
    title: '',
    description: '',
    file: null as File | null,
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    post('/revision', { forceFormData: true, onSuccess: () => reset('title','description','file') })
  }

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/1024/1024).toFixed(1)} MB`
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Revision Bank', href: '/revision' }]}>
      <Head title="Revision Bank" />
      <div className="p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Revision PDF</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Unit</label>
              <select
                value={data.unit_id}
                onChange={(e) => setData('unit_id', Number(e.target.value))}
                className="border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select unit</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.title}</option>
                ))}
              </select>
              {errors.unit_id && <div className="text-red-600 text-sm mt-1">{errors.unit_id}</div>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Title</label>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="border rounded px-3 py-2" required />
              {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium mb-1">Description (optional)</label>
              <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="border rounded px-3 py-2" rows={3} />
              {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium mb-1">PDF File</label>
              <input accept="application/pdf,.pdf" type="file" onChange={e => setData('file', e.target.files?.[0] ?? null)} className="border rounded px-3 py-2" required />
              {errors.file && <div className="text-red-600 text-sm mt-1">{errors.file}</div>}
            </div>
            <div className="md:col-span-2">
              <Button disabled={processing}>{processing ? 'Uploading…' : 'Upload'}</Button>
            </div>
          </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Revision Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{doc.unit.title}</TableCell>
                      <TableCell>{fmtSize(doc.size)}</TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button asChild variant="link" size="sm"><a href={`/revision/${doc.id}/download`}>Download</a></Button>
                        <Button asChild variant="destructive" size="sm">
                          <Link as="button" method="delete" href={`/revision/${doc.id}`} preserveScroll>Delete</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">No documents uploaded yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
