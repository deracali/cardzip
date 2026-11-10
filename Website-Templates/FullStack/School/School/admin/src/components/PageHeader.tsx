import type { PropsWithChildren, ReactNode } from 'react'

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

export function Panel({ title, note, action, children }: PropsWithChildren<{ title: string; note?: string; action?: ReactNode }>) {
  return <section className="panel"><div className="panel-head"><div><h2>{title}</h2>{note&&<p>{note}</p>}</div>{action}</div>{children}</section>
}
