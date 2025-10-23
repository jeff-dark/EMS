import AppSidebarLayout from '@/layouts/app/app-sidebar-layout'
import { Head } from '@inertiajs/react'

interface Unit { id: number; title: string }
interface Doc { id: number; title: string; description?: string | null; unit: Unit; created_at: string; size: number }

export default function StudentRevision({ documents = [] }: { documents: Doc[] }) {
  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/1024/1024).toFixed(1)} MB`
  }

  return (
  <AppSidebarLayout breadcrumbs={[{ title: 'Revise', href: '/student/revision' }]}>
      <Head title="Revise" />
      <div className="p-6 space-y-6">
        <section className="bg-white rounded-md shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Revision Materials</h2>
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
                    <td className="py-2 pr-4"><a className="text-blue-700 hover:underline" href={`/revision/${doc.id}/download`}>Download</a></td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr><td className="py-4 text-muted-foreground" colSpan={5}>No revision materials available yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppSidebarLayout>
  )
}
