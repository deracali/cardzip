import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react'

export function PortalPage() {
  return <main className="portal-page"><div className="portal-card"><span className="portal-logo"><BookOpen size={23}/></span><span className="eyebrow">GREENFIELD COLLEGE · PORTAL</span><h1>Welcome back.</h1><p>Choose your portal to continue to your school community.</p><a className="portal-option" href="/student-app"><b>Student app</b><small>Fees, results, notices, and timetable</small><ArrowRight size={16}/></a><a className="portal-option" href="http://localhost:5174/"><b>Staff &amp; admin</b><small>Attendance, records, and school operations · run admin on port 5174</small><ArrowRight size={16}/></a><div className="portal-safety"><ShieldCheck size={16}/> Demonstration portal - do not use real credentials.</div></div></main>
}
