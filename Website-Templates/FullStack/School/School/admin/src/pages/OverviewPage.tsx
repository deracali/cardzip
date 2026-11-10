import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Bell, BookOpen, CalendarCheck, CreditCard, Ticket, Users } from 'lucide-react'
import { money } from '../data'
import type { AdminState } from '../hooks/useAdminState'
import type { LucideIcon } from 'lucide-react'
import { Panel, PageHeader } from '../components/PageHeader'

const quickActions: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: 'Fee monitor', href: '/fees', Icon: CreditCard },
  { label: 'Result pins', href: '/pins', Icon: Ticket },
  { label: 'Attendance', href: '/attendance', Icon: CalendarCheck },
  { label: 'Results', href: '/results', Icon: BookOpen },
  { label: 'Broadcast', href: '/broadcast', Icon: Bell },
  { label: 'Staff & payroll', href: '/settings', Icon: BadgeCheck },
]

export function OverviewPage({ state }: { state: AdminState }) {
  const paid = state.fees.reduce((total, row) => total + row.paid, 0)
  const due = state.fees.reduce((total, row) => total + row.amount - row.paid, 0)
  const present = state.attendance.filter((row) => row.present).length
  const metrics = [
    { label: 'TERM REVENUE VS TARGET', value: money(paid), note: '72% of term target collected', Icon: CreditCard, trend: '+12% this term', up: true },
    { label: 'DAILY ATTENDANCE', value: '94.2%', note: `${present} of ${state.attendance.length} demo students present`, Icon: CalendarCheck, trend: '+1.4% vs yesterday', up: true },
    { label: 'SCRATCH CARD PINS', value: state.pins.length.toLocaleString(), note: 'Of 3,200 generated this term', Icon: Ticket, trend: `${state.pins.filter((pin) => pin.status === 'Active').length} active`, up: true },
    { label: 'STUDENT ENROLLMENT', value: '2,847', note: 'Across 86 classes', Icon: Users, trend: '+24 this month', up: true },
  ]
  return <><PageHeader title="Good morning, Mrs. Okafor" description="Here is your school at a glance for Wednesday, 5 November 2026." action={<a className="primary-button" href="/broadcast"><Bell size={14}/> New broadcast</a>}/><div className="metrics-grid">{metrics.map(({ label, value, note, Icon, trend, up }) => <article className="metric-card" key={label}><div><span>{label}</span><Icon size={16}/></div><b>{value}</b><small>{note}</small><em className={up ? 'trend up' : 'trend'}>{up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {trend}</em></article>)}</div><div className="overview-grid"><Panel title="Fee collection · Term 1" note="Demo ledger" action={<a href="/fees">View full ledger <ArrowRight size={13}/></a>}><div className="collection-total"><div><span>Collected this term</span><strong>{money(paid)}</strong></div><span className="percent-pill">72%</span></div><div className="progress"><span style={{ width: '72%' }}/></div><div className="collection-foot"><span>Outstanding balance: <b>{money(due)}</b></span><span>Target: ₦68.0M</span></div></Panel><Panel title="Quick management" note="Jump back into your daily work"><div className="quick-grid">{quickActions.map(({ label, href, Icon }) => <a key={label} href={href}><Icon size={17}/><span>{label}</span></a>)}</div></Panel></div><Panel title="Recent fee activity" note="Latest student account updates" action={<a href="/fees">View fee ledger <ArrowRight size={13}/></a>}><div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>CLASS</th><th>AMOUNT PAID</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{state.fees.slice(0, 5).map((fee) => <tr key={fee.id}><td><b>{fee.student}</b><small>{fee.id}</small></td><td>{fee.className}</td><td>{money(fee.paid)}</td><td><span className={`status ${fee.status.toLowerCase()}`}>{fee.status}</span></td><td><a className="table-link" href="/fees">Review</a></td></tr>)}</tbody></table></div></Panel><p className="demo-notice">Prototype dashboard - payment, messaging, and student records are local sample data.</p></>
}
