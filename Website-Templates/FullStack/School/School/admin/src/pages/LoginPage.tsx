import { useState, type FormEvent } from 'react'
import { BookOpen, ShieldCheck } from 'lucide-react'

export function LoginPage() {
  const [notice, setNotice] = useState('')
  return <main className="login-page"><form className="login-card" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setNotice('Demo sign-in submitted. Authentication is not connected.') }}><a className="admin-brand login-brand" href="/"><span>GC</span><b>Greenfield College<small>ADMIN PORTAL</small></b></a><h1>Welcome back.</h1><p>Sign in to manage school operations.</p><label>Admin email<input type="email" required autoComplete="email" placeholder="admin@greenfield.example"/></label><label>Password<input type="password" required autoComplete="current-password" placeholder="Password"/></label><button className="primary-button"><BookOpen size={14}/> Sign in</button>{notice&&<p className="inline-notice" role="status">{notice}</p>}<div className="login-safety"><ShieldCheck size={15}/> Demo only. Do not enter real credentials.</div><a className="back-link" href="http://localhost:5173/">Back to school website</a></form></main>
}
