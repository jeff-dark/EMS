import AppLayout from '@/layouts/app-layout'
import { Head, Link, router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import FilterBar from '@/components/ui/filter-bar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Unit { id: number; title: string }
interface Doc { id: number; title: string; description?: string | null; unit: Unit; created_at: string; size: number; category?: string | null; tags?: string[] }
interface Paginator<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[] }

export default function StudentRevision({ documents, filters, units = [], categories = [] }: { documents: Paginator<Doc>; filters: any; units: Unit[]; categories: string[] }) {
  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/1024/1024).toFixed(1)} MB`
  }

  const q = String(filters?.q ?? '')
  const fUnitId = String(filters?.unit_id ?? '')
  const fCategory = String(filters?.category ?? '')
  const perPage = String(filters?.per_page ?? '10')

  const applyFilters = (params: Record<string,string>) => {
    const query = new URLSearchParams({ q, unit_id: fUnitId, category: fCategory, per_page: perPage, ...params })
    router.get(`/student/revision?${query.toString()}`, {}, { preserveState: true, preserveScroll: true })
  }

  // Group by unit for easier browsing (current page only)
  const groups = documents.data.reduce<Record<number, { unit: Unit; items: Doc[] }>>((acc, d) => {
    const key = d.unit.id
    if (!acc[key]) acc[key] = { unit: d.unit, items: [] }
    acc[key].items.push(d)
    return acc
  }, {})
  const grouped = Object.values(groups)

  return (
    <AppLayout breadcrumbs={[{ title: 'Revise', href: '/student/revision' }] }>
      <Head title="Revise" />
      <div className="p-6 space-y-6">
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
            <CardTitle>Revision Materials</CardTitle>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped.map(group => (
                    <>
                      <TableRow key={`unit-${group.unit.id}`} className="bg-accent/40">
                        <TableCell colSpan={4} className="font-semibold">{group.unit.title}</TableCell>
                      </TableRow>
                      {group.items.map(doc => (
                        <TableRow
                          key={doc.id}
                          className="cursor-pointer transition hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                          onClick={() => window.open(`/revision/${doc.id}/view`, '_blank', 'noopener,noreferrer')}
                        >
                          <TableCell>{doc.title}</TableCell>
                          <TableCell>{doc.unit.title}</TableCell>
                          <TableCell>{fmtSize(doc.size)}</TableCell>
                          <TableCell>{new Date(doc.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                  {documents.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">No revision materials available yet.</TableCell>
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
