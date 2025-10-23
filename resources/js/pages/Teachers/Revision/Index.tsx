import AppSidebarLayout from '@/layouts/app/app-sidebar-layout'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
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
  <AppSidebarLayout breadcrumbs={[{ title: 'Revision Bank', href: '/revision' }]}>
      <Head title="Revision Bank" />
      <div className="p-6 space-y-8">
        <section className="bg-white rounded-md shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Upload Revision PDF</h2>
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
              <button disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">{processing ? 'Uploading…' : 'Upload'}</button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-md shadow p-4">
          <h2 className="text-lg font-semibold mb-4">My Revision Documents</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Unit</th>
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">Uploaded</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} className="border-b">
                    <td className="py-2 pr-4">{doc.title}</td>
                    <td className="py-2 pr-4">{doc.unit.title}</td>
                    <td className="py-2 pr-4">{fmtSize(doc.size)}</td>
                    <td className="py-2 pr-4">{new Date(doc.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-4 space-x-2">
                      <a className="text-blue-700 hover:underline" href={`/revision/${doc.id}/download`}>Download</a>
                      <Link as="button" method="delete" href={`/revision/${doc.id}`} className="text-red-700 hover:underline" preserveScroll>Delete</Link>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr><td className="py-4 text-muted-foreground" colSpan={5}>No documents uploaded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppSidebarLayout>
  )
}
