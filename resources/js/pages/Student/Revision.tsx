import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Unit { id: number; title: string }
interface Doc { id: number; title: string; description?: string | null; unit: Unit; created_at: string; size: number }

export default function StudentRevision({ documents = [] }: { documents: Doc[] }) {
  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/1024/1024).toFixed(1)} MB`
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Revise', href: '/student/revision' }] }>
      <Head title="Revise" />
      <div className="p-6 space-y-6">
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
                  {documents.map(doc => (
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
                  {documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">No revision materials available yet.</TableCell>
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
