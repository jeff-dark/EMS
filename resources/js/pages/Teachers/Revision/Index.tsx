import AppLayout from '@/layouts/app-layout'
import { Head, Link, useForm, router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FilterBar from '@/components/ui/filter-bar'
import { Input } from '@/components/ui/input'
import { FormEvent } from 'react'

interface Unit { id: number; title: string }
interface Doc { id: number; title: string; description?: string | null; unit: Unit; created_at: string; size: number; mime: string; category?: string | null; tags?: string[] }
interface Paginator<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[] }

export default function TeacherRevisionIndex({ units = [], documents, filters, categories = [] }: { units: Unit[]; documents: Paginator<Doc>; filters: any; categories: string[] }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    unit_id: units[0]?.id ? String(units[0].id) : '',
    title: '',
    description: '',
    file: null as File | null,
    category: '',
    tags: '',
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

  // Filters state from server
  const q = String(filters?.q ?? '')
  const fUnitId = String(filters?.unit_id ?? '')
  const fCategory = String(filters?.category ?? '')
  const perPage = String(filters?.per_page ?? '10')

  const applyFilters = (params: Record<string, string>) => {
    const query = new URLSearchParams({ q, unit_id: fUnitId, category: fCategory, per_page: perPage, ...params })
    router.get(`/revision?${query.toString()}`, {}, { preserveState: true, preserveScroll: true })
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Revision Bank', href: '/revision' }]}>
      <Head title="Revision Bank" />
      <div className="p-6 space-y-8">
        <FilterBar onReset={() => applyFilters({ q: '', unit_id: '', category: '' })}>
          <Input
            defaultValue={q}
            onChange={(e)=> applyFilters({ q: e.target.value })}
            placeholder="Search title or description"
          />
          <Select value={fUnitId} onValueChange={(val)=> applyFilters({ unit_id: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Units</SelectItem>
              {units.map(u => (<SelectItem key={u.id} value={String(u.id)}>{u.title}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={fCategory} onValueChange={(val)=> applyFilters({ category: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </FilterBar>

        <Card>
          <CardHeader>
            <CardTitle>Upload Revision PDF</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Unit</label>
              <Select value={data.unit_id} onValueChange={(val) => setData('unit_id', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Category (optional)</label>
              <input type="text" value={data.category} onChange={e => setData('category', e.target.value)} className="border rounded px-3 py-2" placeholder="e.g., Past Papers" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input type="text" value={data.tags} onChange={e => setData('tags', e.target.value)} className="border rounded px-3 py-2" placeholder="e.g., midterm, final" />
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
                  {documents.data.map(doc => (
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer transition hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                      onClick={() => window.open(`/revision/${doc.id}/view`, '_blank', 'noopener,noreferrer')}
                    >
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{doc.unit.title}</TableCell>
                      <TableCell>{fmtSize(doc.size)}</TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleString()}</TableCell>
                      <TableCell className="space-x-2" onClick={(e)=> e.stopPropagation()}>
                        <Button asChild variant="link" size="sm"><a href={`/revision/${doc.id}/download`}>Download</a></Button>
                        <Button asChild variant="destructive" size="sm">
                          <Link as="button" method="delete" href={`/revision/${doc.id}`} preserveScroll>Delete</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {documents.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">No documents uploaded yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {documents.links.map((l, idx) => (
                <Link
                  key={idx}
                  href={l.url || ''}
                  className={`px-3 py-1 rounded border ${l.active ? 'bg-primary text-primary-foreground' : 'bg-background'} ${!l.url ? 'opacity-50 pointer-events-none' : ''}`}
                  preserveScroll
                >
                  {typeof l.label === 'string' ? l.label.replace(/&laquo;|&raquo;/g, (m)=> m==='&laquo;'?'«': '»') : l.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
