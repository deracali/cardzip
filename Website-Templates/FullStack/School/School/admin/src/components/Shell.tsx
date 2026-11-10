import { useState, type PropsWithChildren } from 'react'
import {
  Bell, BookOpen, CalendarCheck, ChevronDown, CreditCard, FileBadge,
  LayoutDashboard, LogOut, Menu, Megaphone, Settings, Shield, Ticket, Users, X,
} from 'lucide-react'

const nav = [
  { title: 'Overview', path: '/', Icon: LayoutDashboard },
  { title: 'Student records', path: '/students', Icon: Users, badge: '2,847' },
  { title: 'Fees & payroll', path: '/fees', Icon: CreditCard },
  { title: 'Fee collection', path: '/fees', Icon: FileBadge },
  { title: 'Results & performance', path: '/results', Icon: BookOpen },
  { title: 'Attendance', path: '/attendance', Icon: CalendarCheck },
  { title: 'Scratch card pins', path: '/pins', Icon: Ticket, badge: 'NEW' },
  { title: 'Push broadcast center', path: '/broadcast', Icon: Megaphone },
  { title: 'Settings', path: '/settings', Icon: Settings },
]

export function Shell({ path, children }: PropsWithChildren<{ path: string }>) {
  const [open, setOpen] = useState(false)
  const current = nav.find((item) => item.path === path)?.title ?? 'Dashboard'
  return <div className="admin-shell"><aside className={`sidebar${open ? ' open' : ''}`}><a className="admin-brand" href="/"><span>GC</span><b>Greenfield College<small>School Portal · Lagos</small></b></a><p className="nav-caption">MAIN MENU</p><nav>{nav.map(({ title, path: href, Icon, badge }) => <a key={`${title}-${href}`} href={href} className={current === title || (path === '/fees' && title === 'Fee collection') ? 'active' : ''} onClick={() => setOpen(false)}><Icon size={16}/><span>{title}</span>{badge&&<small>{badge}</small>}</a>)}</nav><div className="sidebar-bottom"><Shield size={15}/><span>Term 1 · 2026/27<small>School portal demo</small></span></div><a className="admin-profile" href="/settings"><span className="avatar">AO</span><b>Mrs. A. Okafor<small>Admin · Greenfield</small></b><ChevronDown size={14}/></a></aside>{open&&<button className="sidebar-overlay" aria-label="Close menu" onClick={()=>setOpen(false)}/>}<main className="admin-main"><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X size={20}/>:<Menu size={20}/>}</button><div className="breadcrumb"><a href="/">Home</a><span>›</span><b>{current}</b><span className="live-dot">● Live sync</span></div><div className="top-actions"><label className="global-search"><span>⌕</span><input placeholder="Search student, PIN, receipt..." /><kbd>⌘K</kbd></label><button className="term-select">First Term <ChevronDown size={12}/></button><button className="icon-button" aria-label="Notifications"><Bell size={16}/><i/></button><a className="broadcast-shortcut" href="/broadcast"><Megaphone size={14}/> New broadcast</a></div></header><div className="admin-content">{children}</div><footer className="admin-footer"><span>© 2026 Greenfield College · Administrative portal</span><span>Demo data · Changes saved in this browser</span></footer></main></div>
}
