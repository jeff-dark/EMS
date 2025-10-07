import React from 'react'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'

const tokens = [
  'primary','success','info','warning','critical','destructive','secondary','accent'
] as const

export default function StyleGuide() {
  return (
    <div className="space-y-10 p-8 max-w-5xl mx-auto">
      <Head title="Style Guide" />
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Style Guide</h1>
        <p className="text-muted-foreground mt-1">Design token & component preview.</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Color Tokens</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tokens.map(t => (
            <div key={t} className="rounded-lg border bg-card p-3 text-sm flex flex-col gap-2">
              <div className="font-medium capitalize">{t}</div>
              <div className="flex gap-2 items-center">
                <div className="h-10 w-10 rounded-md border" style={{ background: `var(--${t})` }} />
                <div className="text-muted-foreground text-xs leading-tight">
                  <div className="flex items-center gap-1"><span className="size-3 rounded-sm border" style={{ background: `var(--${t}-foreground, var(--foreground))` }} /> fg</div>
                  <code className="block mt-1">--{t}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          {['default','success','info','warning','critical','destructive','secondary','subtle','ghost','link','outline'].map(v => (
            <Button key={v} variant={v as any}>{v}</Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {['default','success','info','warning','critical','destructive','secondary','subtle','outline'].map(v => (
            <Badge key={v} variant={v as any}>{v}</Badge>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Alerts</h2>
        <div className="space-y-3">
          {['default','success','info','warning','critical','destructive'].map(v => (
            <Alert key={v} variant={v as any}>
              <AlertTitle className="capitalize">{v} Alert</AlertTitle>
              <AlertDescription>Example description for the {v} variant.</AlertDescription>
            </Alert>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inputs (state variants)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-sm font-medium">Default</label><Input placeholder="Default" /></div>
          <div className="space-y-1"><label className="text-sm font-medium">Success</label><Input variant="success" placeholder="Success" /></div>
          <div className="space-y-1"><label className="text-sm font-medium">Warning</label><Input variant="warning" placeholder="Warning" /></div>
          <div className="space-y-1"><label className="text-sm font-medium">Critical</label><Input variant="critical" placeholder="Critical" /></div>
        </div>
      </section>

      <footer className="pt-8 text-xs text-muted-foreground">
        Generated style guide. Adjust tokens in <code>resources/css/app.css</code>.
      </footer>
    </div>
  )
}
