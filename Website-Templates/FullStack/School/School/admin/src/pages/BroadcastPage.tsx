import { useState, type FormEvent } from 'react'
import { CheckCircle2, Megaphone, Send } from 'lucide-react'
import { PageHeader, Panel } from '../components/PageHeader'

export function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('All families')
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }
  return <><PageHeader title="Push broadcast center" description="Compose a notice for a selected school community."/><div className="broadcast-grid"><Panel title="Create a broadcast" note="Preview only - messages are not delivered"><form className="broadcast-form" onSubmit={submit}><label>Audience<select value={audience} onChange={(event) => setAudience(event.target.value)}><option>All families</option><option>JSS 3 Gold</option><option>Teaching staff</option><option>Senior students</option></select></label><label>Message title<input required placeholder="e.g. Mid-term break reminder"/></label><label>Message<textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={240} placeholder="Write a clear and helpful announcement..."/></label><small>{message.length}/240 characters · Audience: {audience}</small><button className="primary-button"><Send size={14}/> {sent ? 'Broadcast saved' : 'Save broadcast preview'}</button>{sent&&<p className="inline-notice" role="status"><CheckCircle2 size={15}/> Saved locally. No message was sent.</p>}</form></Panel><Panel title="Preview"><article className="broadcast-preview"><div><Megaphone size={18}/><span>GREENFIELD COLLEGE · SCHOOL NOTICE</span></div><h3>{message ? 'Your announcement title' : 'School community notice'}</h3><p>{message || 'Your announcement preview will appear here after you write a message.'}</p><small>Audience: {audience} · Demo preview</small></article></Panel></div><Panel title="Recent broadcasts" note="Sample activity"><div className="activity-row"><span className="activity-icon"><Megaphone size={15}/></span><div><b>Mid-term parent meeting</b><small>All families · 29 Oct · Preview only</small></div><span className="status partial">Draft</span></div><div className="activity-row"><span className="activity-icon"><Megaphone size={15}/></span><div><b>Staff planning reminder</b><small>Teaching staff · 27 Oct · Preview only</small></div><span className="status partial">Draft</span></div></Panel></>
}
