import { useMemo, useState } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Bell, Building2, Check,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, CreditCard, Database,
  Download, Eye, EyeOff, FileKey, FileText, Globe2, KeyRound, LayoutDashboard,
  LockKeyhole, LogOut, Menu, MoreHorizontal, Plus, Search, Shield,
  ShieldCheck, SlidersHorizontal, Sparkles, Users, WalletCards, X, Zap,
} from 'lucide-react'
import './App.css'

const membersSeed = [
  { name: 'Amara Okafor', email: 'amara@acme.corp', workspace: 'Acme Corp', role: 'Admin', status: 'Active', last: 'Now', initials: 'AO', color: 'coral' },
  { name: 'Daniel Reyes', email: 'daniel@acme.corp', workspace: 'Acme Corp', role: 'Admin', status: 'Active', last: '2h ago', initials: 'DR', color: 'blue' },
  { name: 'Priya Nair', email: 'priya@globex.io', workspace: 'Globex Inc', role: 'Manager', status: 'Active', last: '5m ago', initials: 'PN', color: 'lavender' },
  { name: 'Jonas Weber', email: 'jonas@acme.corp', workspace: 'Acme Corp', role: 'Manager', status: 'Pending', last: 'Invited 2d ago', initials: 'JW', color: 'green' },
  { name: 'Chen Wu', email: 'chen@intech.io', workspace: 'Intech LLC', role: 'Member', status: 'Active', last: '1h ago', initials: 'CW', color: 'amber' },
  { name: 'Sarah Haddad', email: 'sarah@acme.corp', workspace: 'Acme Corp', role: 'Member', status: 'Suspended', last: '4d ago', initials: 'SH', color: 'pink' },
  { name: 'Sytan Patel', email: 'sytan@globex.io', workspace: 'Globex Inc', role: 'Member', status: 'Active', last: 'Yesterday', initials: 'SP', color: 'teal' },
]

const workspaces = [
  { name: 'Acme Corp', detail: 'Pro · 8 members', initials: 'A', color: 'purple', plan: 'Pro' },
  { name: 'Globex Inc', detail: 'Pro · 4 members', initials: 'G', color: 'blue', plan: 'Pro' },
  { name: 'Intech LLC', detail: 'Enterprise · 6 members', initials: 'I', color: 'green', plan: 'Enterprise' },
]

const navItems = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/team', label: 'Team & Roles', icon: Users, count: '12' },
  { path: '/workspaces', label: 'Workspaces', icon: Building2 },
  { path: '/billing', label: 'Billing & Usage', icon: CreditCard },
  { path: '/audit', label: 'Audit & Security', icon: ShieldCheck },
  { path: '/api-keys', label: 'API Keys', icon: KeyRound },
]

function Avatar({ initials, color = 'purple', small = false }) {
  return <span className={`avatar avatar-${color}${small ? ' avatar-small' : ''}`}>{initials}</span>
}

function Logo() {
  return <a className="logo" href="/overview"><span className="logo-icon"><Sparkles size={14} /></span><span>Acme <b>Corp</b></span></a>
}

function Sidebar({ path, mobileOpen, closeMenu }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={closeMenu} />}
      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-top"><Logo /><button className="icon-button mobile-close" aria-label="Close navigation" onClick={closeMenu}><X size={17} /></button></div>
        <div className="sidebar-label">SWITCH WORKSPACES</div>
        <button className="workspace-current" onClick={() => setWorkspaceOpen(!workspaceOpen)} aria-expanded={workspaceOpen}>
          <Avatar initials="A" /><span><b>Acme Corp</b><small>Pro · 8 members</small></span><ChevronDown size={14} />
        </button>
        {workspaceOpen && <div className="workspace-menu">{workspaces.map((item) => <a href="/workspaces" key={item.name}><Avatar initials={item.initials} color={item.color} small /><span>{item.name}<small>{item.detail}</small></span></a>)}</div>}
        <div className="sidebar-workspaces">{workspaces.slice(1).map((item) => <a href="/workspaces" key={item.name}><Avatar initials={item.initials} color={item.color} small /><span><b>{item.name}</b><small>{item.detail}</small></span></a>)}<a className="create-workspace" href="/workspaces"><Plus size={13} /> Create New Workspace</a></div>
        <div className="sidebar-label menu-label">MENU</div>
        <nav className="side-nav" aria-label="Admin menu">{navItems.map(({ path: href, label, icon: Icon, count }) => <a href={href} key={href} className={path === href ? 'active' : ''} onClick={closeMenu}><Icon size={15} /><span>{label}</span>{count && <small>{count}</small>}</a>)}</nav>
        <div className="sidebar-spacer" />
        <div className="trial-card"><Zap size={14} /><b>Trial ends in 6 days</b><span>Upgrade now for 25,000 AI tasks and unlimited API calls.</span><a href="/billing">View plans <ArrowRight size={12} /></a></div>
        <a href="/profile" className="sidebar-profile"><Avatar initials="AO" color="coral" small /><span><b>Amara Okafor</b><small>Admin · Acme Corp</small></span><LogOut size={14} /></a>
      </aside>
    </>
  )
}

function Header({ onMenu, currentLabel }) {
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={18} /></button>
      <div className="breadcrumbs"><span>Admin</span><ChevronRight size={13} /><span>Acme Corp</span><ChevronRight size={13} /><b>{currentLabel}</b></div>
      <div className={`topbar-search${showSearch ? ' search-open' : ''}`}><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => setShowSearch(true)} onBlur={() => setShowSearch(false)} placeholder="Search members, logs, invoices..." aria-label="Search members, logs, invoices" /><kbd>⌘ K</kbd></div>
      <div className="topbar-actions"><a className="plan-chip" href="/billing"><span /> All systems operational</a><button className="icon-button notification-button" aria-label="Notifications"><Bell size={15} /><i /></button><button className="icon-button" aria-label="Help"><CircleHelp size={15} /></button><a className="profile-chip" href="/profile"><Avatar initials="AO" color="coral" small /><span>Amara</span><ChevronDown size={12} /></a></div>
    </header>
  )
}

function PageTabs({ path }) {
  const tabs = [{ path: '/team', title: 'Team & Roles', Icon: Users }, { path: '/workspaces', title: 'Workspaces & Invites', Icon: Building2 }, { path: '/billing', title: 'Billing & Usage', Icon: CreditCard }, { path: '/audit', title: 'Audit & Security', Icon: ShieldCheck }]
  return <nav className="page-tabs" aria-label="Team administration">{tabs.map(({ path: href, title, Icon }) => <a key={href} href={href} className={path === href ? 'selected' : ''}><Icon size={14} />{title}</a>)}</nav>
}

function PageTitle({ title, description, actions }) {
  return <div className="page-title"><div><h1>{title}</h1><p>{description}</p></div><div className="title-actions">{actions}</div></div>
}

function InvitePanel({ onInvite }) {
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState('Member')
  const [message, setMessage] = useState('Welcome to Acme — excited to build with you!')
  const [notice, setNotice] = useState('')
  function submit(event) {
    event.preventDefault()
    const list = emails.split(/[,\s;]+/).map((email) => email.trim()).filter(Boolean)
    if (!list.length) return
    onInvite(list, role)
    setNotice(`${list.length} invitation${list.length === 1 ? '' : 's'} added to the preview.`)
    setEmails('')
  }
  return <aside className="invite-panel"><h3>Invite teammates to Acme Corp</h3><form onSubmit={submit}><label className="sr-only" htmlFor="invite-emails">Email addresses</label><input id="invite-emails" type="text" value={emails} onChange={(event) => setEmails(event.target.value)} placeholder="name@company.com, name@..." required /><label className="sr-only" htmlFor="invite-role">Invitation role</label><select id="invite-role" value={role} onChange={(event) => setRole(event.target.value)}><option>Member</option><option>Manager</option><option>Admin</option></select><label className="sr-only" htmlFor="invite-message">Invitation message</label><input id="invite-message" value={message} onChange={(event) => setMessage(event.target.value)} /><button className="primary-button full-width" type="submit">Send {emails.trim() ? emails.split(/[,\s;]+/).filter(Boolean).length : 0} invite{emails.trim() && emails.split(/[,\s;]+/).filter(Boolean).length === 1 ? '' : 's'} <ArrowRight size={14} /></button></form>{notice && <p className="inline-notice"><Check size={12} />{notice} Email delivery requires a connected service.</p>}<div className="invite-foot"><span>✦ Invite link expires in 7 days</span><button aria-label="Copy invitation link" onClick={() => setNotice('Invitation link copied in this preview.')}>⧉</button></div></aside>
}

function PermissionPanel({ member }) {
  const [permissions, setPermissions] = useState({ billing: member?.role === 'Admin', api: false, workspace: member?.role !== 'Member', team: member?.role === 'Admin' })
  const [saved, setSaved] = useState(false)
  function toggle(key) { setPermissions((current) => ({ ...current, [key]: !current[key] })); setSaved(false) }
  return <section className="permission-panel"><div className="permission-user"><Avatar initials={member?.initials || 'JW'} color={member?.color || 'green'} /><div><b>{member?.name || 'Jonas Weber'} — {member?.role || 'Manager'}</b><small>{member?.email || 'jonas@acme.corp'}</small></div><button className="small-button" onClick={() => setSaved(true)}>{saved ? <><Check size={12} /> Saved</> : 'Save roles'}</button></div><div className="permission-grid">{[['billing', 'Billing Access', 'View invoices, update cards'], ['workspace', 'Workspace Settings', 'Rename, logo, domain'], ['api', 'API Keys', 'Create & revoke keys'], ['team', 'Team Management', 'Invite, edit roles']].map(([key, title, copy]) => <div className="permission-item" key={key}><span><b>{title}</b><small>{copy}</small></span><button className={`toggle${permissions[key] ? ' on' : ''}`} role="switch" aria-checked={permissions[key]} aria-label={title} onClick={() => toggle(key)}><i /></button></div>)}</div></section>
}

function TeamPage() {
  const [members, setMembers] = useState(membersSeed)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All roles')
  const [status, setStatus] = useState('All status')
  const [selected, setSelected] = useState(membersSeed[3])
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => members.filter((member) => `${member.name} ${member.email} ${member.workspace}`.toLowerCase().includes(query.toLowerCase()) && (role === 'All roles' || member.role === role) && (status === 'All status' || member.status === status)), [members, query, role, status])
  function addInvites(emails, inviteRole) {
    const newMembers = emails.map((email, index) => {
      const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
      return { name, email, workspace: 'Acme Corp', role: inviteRole, status: 'Pending', last: 'Invited just now', initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2), color: ['teal', 'blue', 'pink'][index % 3] }
    })
    setMembers((current) => [...newMembers, ...current])
  }
  function exportMembers() {
    const rows = [['Name', 'Email', 'Workspace', 'Role', 'Status'], ...filtered.map((item) => [item.name, item.email, item.workspace, item.role, item.status])]
    const csv = rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'acme-team-members.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }
  return <><PageTitle title="Team Members" description="Manage your team roles and workspace permissions." actions={<><button className="outline-button" onClick={exportMembers}><Download size={14} /> Export</button><button className="primary-button" onClick={() => document.getElementById('invite-emails')?.focus()}><Plus size={14} /> Invite Member</button></>} /><div className="filter-toolbar"><label className="search-field"><Search size={14} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search by name or email..." /><kbd>⌘ K</kbd></label><label className="select-wrap"><span className="sr-only">Filter by role</span><select value={role} onChange={(event) => setRole(event.target.value)}><option>All roles</option><option>Admin</option><option>Manager</option><option>Member</option></select><ChevronDown size={12} /></label><label className="select-wrap"><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All status</option><option>Active</option><option>Pending</option><option>Suspended</option></select><ChevronDown size={12} /></label><button className="outline-button more-filter" onClick={() => { setQuery(''); setRole('All roles'); setStatus('All status') }}><SlidersHorizontal size={13} /> More filters</button></div><section className="table-card"><div className="table-scroll"><table className="members-table"><thead><tr><th>USER</th><th>WORKSPACE</th><th>ROLE</th><th>STATUS</th><th>LAST ACTIVE</th><th aria-label="Actions" /></tr></thead><tbody>{filtered.slice((page - 1) * 6, page * 6).map((member) => <tr key={member.email} onClick={() => setSelected(member)} className={selected?.email === member.email ? 'row-selected' : ''}><td><div className="member-info"><Avatar initials={member.initials} color={member.color} /><span><b>{member.name}</b><small>{member.email}</small></span></div></td><td>{member.workspace}</td><td><span className={`role-badge role-${member.role.toLowerCase()}`}>{member.role}</span></td><td><span className={`status-badge status-${member.status.toLowerCase()}`}><i />{member.status}</span></td><td>{member.last}</td><td><button className="icon-button row-menu" aria-label={`More actions for ${member.name}`} onClick={(event) => { event.stopPropagation(); setSelected(member) }}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">No team members match those filters.</div>}</div><div className="table-footer"><span>Showing {filtered.length ? (page - 1) * 6 + 1 : 0}–{Math.min(page * 6, filtered.length)} of {filtered.length} members</span><div className="pagination"><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(1)}><ChevronLeft size={14} /></button><button className="current-page">1</button><button aria-label="Next page" disabled={filtered.length <= 6} onClick={() => setPage(2)}><ChevronRight size={14} /></button></div></div></section><div className="team-bottom"><PermissionPanel key={selected?.email} member={selected} /><InvitePanel onInvite={addInvites} /></div></>
}

function WorkspacesPage() {
  const [items, setItems] = useState(workspaces)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  function createWorkspace(event) { event.preventDefault(); const trimmed = name.trim(); if (!trimmed) return; setItems((current) => [...current, { name: trimmed, detail: 'Starter · 1 member', initials: trimmed[0].toUpperCase(), color: 'purple', plan: 'Starter' }]); setName(''); setShowForm(false) }
  return <><PageTitle title="Workspaces" description="Organize teams, members, and settings across your organization." actions={<button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={14} /> New workspace</button>} /><PageTabs path="/workspaces" />{showForm && <form className="create-workspace-form" onSubmit={createWorkspace}><label htmlFor="workspace-name">Workspace name</label><input id="workspace-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Product team" required /><button className="primary-button">Create workspace</button></form>}<div className="workspace-grid">{items.map((item, index) => <article className="workspace-card" key={`${item.name}-${index}`}><div className="workspace-card-top"><Avatar initials={item.initials} color={item.color} /><span className={`role-badge ${item.plan === 'Enterprise' ? 'role-admin' : 'role-manager'}`}>{item.plan}</span></div><h2>{item.name}</h2><p>{item.detail}</p><div className="workspace-card-meta"><span><Users size={13} /> {item.detail.split(' · ')[1]}</span><span><Activity size={13} /> Active</span></div><a href="/team" className="text-button">Manage workspace <ArrowRight size={13} /></a></article>)}</div><section className="pending-invites"><div><h2>Pending invitations</h2><p>Invitations expire after 7 days. Resend or revoke them any time.</p></div><a href="/team" className="outline-button">Manage invitations <ArrowRight size={13} /></a><div className="invite-row"><Avatar initials="JW" color="green" small /><span><b>Jonas Weber</b><small>jonas@acme.corp · invited 2 days ago</small></span><span className="status-badge status-pending"><i />Pending</span><button className="outline-button" onClick={(event) => { event.currentTarget.textContent = 'Resent' }}>Resend invite</button></div></section></>
}

function UsageCard({ icon: Icon, label, value, percent, note, warning = false }) {
  return <article className="usage-card"><div className="usage-card-heading"><span><Icon size={14} />{label}</span>{warning && <span className="warning-chip">⚠ At limit</span>}</div><b>{value}</b><div className="usage-progress"><i style={{ width: `${percent}%` }} /></div><small>{note}</small></article>
}

function BillingPage() {
  const [notice, setNotice] = useState('')
  const [cancelled, setCancelled] = useState(false)
  const invoices = [
    ['Oct 01, 2025', 'INV-2025-1021', '$79.00', 'Stripe', 'Paid'],
    ['Sep 01, 2025', 'INV-2025-0921', '$79.00', 'Stripe', 'Paid'],
    ['Aug 01, 2025', 'INV-2025-0821', '$79.00', 'Lemon Squeezy', 'Paid'],
    ['Jul 01, 2025', 'INV-2025-0721', '$79.00', 'Stripe', 'Paid'],
  ]
  function downloadInvoice(invoice) {
    const content = `Acme Corp invoice preview\n${invoice[1]}\nDate: ${invoice[0]}\nAmount: ${invoice[2]}\nStatus: ${invoice[4]}\n\nConnect your billing provider to download official invoices.`
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    link.download = `${invoice[1]}.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  function exportCsv() {
    const rows = [['Date', 'Invoice', 'Amount', 'Provider', 'Status'], ...invoices]
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' }))
    link.download = 'acme-billing-history.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }
  return <><PageTitle title="Subscription Billing & Usage" description="Plan, metrics, payment method and invoice history." actions={<span className="date-range">BILLING CYCLE · NOV 01 – DEC 01</span>} /><PageTabs path="/billing" /><section className="subscription-banner"><div className="subscription-plan"><span className="plan-icon"><Zap size={18} /></span><div><h2>{cancelled ? 'Pro Trial — Ends in 6 days' : 'Pro Tier Plan — $79/mo'} <span className={`status-badge ${cancelled ? 'status-pending' : 'status-active'}`}><i />{cancelled ? 'Ending' : 'Active'}</span></h2><p>Renews Dec 01, 2025 · 30 seats · 1,000 AI calls included</p></div></div><div className="subscription-actions"><button className="text-button danger-text" onClick={() => { setCancelled(!cancelled); setNotice(cancelled ? 'Subscription renewal restored.' : 'Cancellation scheduled for the end of this billing cycle.') }}>{cancelled ? 'Resume Subscription' : 'Cancel Subscription'}</button><a className="primary-button" href="/checkout?plan=enterprise">Upgrade to Enterprise <ArrowRight size={13} /></a></div></section>{notice && <div className="billing-notice"><Check size={14} />{notice}</div>}<div className="usage-grid"><UsageCard icon={Users} label="Seats Used" value="8 / 10 Seats" percent={80} note="Approaching limit — consider an add-on pack." /><UsageCard icon={Activity} label="Monthly API Calls" value="892 / 1,000 Requests" percent={89} warning note="2 weeks left before extra request fees apply." /><UsageCard icon={Database} label="Storage Usage" value="12.4 GB / 50 GB" percent={25} note="Healthy storage for assets & backups." /></div><div className="billing-middle"><section className="payment-method"><div className="card-heading"><h2>Payment Method</h2><span className="payment-tag">Stripe</span></div><div className="saved-card"><span className="visa">VISA</span><span><b>•••• 4242</b><small>Expires 08/26</small></span></div><button className="outline-button full-width" onClick={() => setNotice('Payment method update is a demo. Connect Stripe Billing Portal to securely update cards.')}><CreditCard size={13} /> Update Card</button><small className="muted-caption">Also supports Lemon Squeezy · SEPA · ACH</small></section><section className="invoice-card"><div className="card-heading"><h2>Invoice History</h2><button className="text-button" onClick={exportCsv}>View all <ArrowRight size={12} /></button></div><div className="table-scroll"><table className="invoice-table"><thead><tr><th>DATE</th><th>INVOICE ID</th><th>AMOUNT</th><th>PROVIDER</th><th>STATUS</th><th /></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice[1]}>{invoice.slice(0, 5).map((cell, index) => <td key={index}>{index === 4 ? <span className="status-badge status-active"><i />{cell}</span> : cell}</td>)}<td><button className="icon-button" aria-label={`Download invoice ${invoice[1]}`} onClick={() => downloadInvoice(invoice)}><Download size={13} /></button></td></tr>)}</tbody></table></div></section></div><section className="billing-security"><div className="security-heading"><div><h2>Audit Logs & Security</h2><p>Sessions, two-factor protection and full event trail.</p></div><a href="/audit" className="outline-button">Open security center <ArrowRight size={13} /></a></div><div className="security-cards"><div className="two-factor-card"><div className="card-heading"><h3><Shield size={15} /> Two-Factor Authentication</h3><span className="status-badge status-active">Configured</span></div><p><LockKeyhole size={12} /> 2 passkeys · Last used 2d ago <button className="toggle on" role="switch" aria-checked="true" aria-label="Two-factor authentication enabled"><i /></button></p></div><div className="active-sessions"><div className="card-heading"><h3>Active Sessions</h3><button className="text-button danger-text" onClick={() => setNotice('Other sessions have been signed out in this preview.')}>Revoke all other sessions</button></div><p><Globe2 size={13} /> macOS Chrome — Lagos, NG <span>Current</span></p><p><Globe2 size={13} /> iPhone 15 — Safari — Lagos, NG <button className="icon-button" onClick={(event) => { event.currentTarget.closest('p').remove() }} aria-label="Revoke iPhone session"><X size={12} /></button></p></div></div></section></>
}

const auditEvents = [
  ['2025-11-01 09:42', 'Amara Okafor', 'member.role_updated', 'Jonas Weber', 'Lagos, NG'],
  ['2025-11-01 09:18', 'Daniel Reyes', 'workspace.settings_changed', 'Acme Corp', 'Berlin, DE'],
  ['2025-10-31 16:04', 'Priya Nair', 'api_key.created', 'Production key', 'Mumbai, IN'],
  ['2025-10-31 14:29', 'Sytan Patel', 'auth.mfa_verified', 'Passkey', 'Lagos, NG'],
  ['2025-10-30 11:52', 'Chen Wu', 'billing.card_updated', '•••• 4242', 'Singapore, SG'],
]

function AuditPage() {
  const [query, setQuery] = useState('')
  const [twoFactor, setTwoFactor] = useState(true)
  const [notice, setNotice] = useState('')
  const events = auditEvents.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()))
  return <><PageTitle title="Audit Logs & Security" description="Sessions, two-factor protection and a searchable event trail." actions={<button className="outline-button" onClick={() => setNotice('Audit report exported in this preview.')}><Download size={14} /> Export CSV</button>} /><PageTabs path="/audit" /><div className="security-summary"><article><div><ShieldCheck size={17} /><span>Security score</span></div><b>Strong</b><small>All recommended protections are enabled.</small></article><article><div><LockKeyhole size={17} /><span>Two-factor auth</span></div><b>{twoFactor ? 'Enabled' : 'Needs attention'}</b><small>{twoFactor ? 'Required for all workspace admins.' : 'Enable additional account protection.'}</small><button className={`toggle${twoFactor ? ' on' : ''}`} role="switch" aria-checked={twoFactor} aria-label="Toggle two-factor authentication" onClick={() => setTwoFactor(!twoFactor)}><i /></button></article><article><div><Globe2 size={17} /><span>Active sessions</span></div><b>2 devices</b><small>Last login · Lagos, Nigeria</small></article></div>{notice && <div className="billing-notice"><Check size={14} />{notice}</div>}<section className="audit-table-card"><div className="card-heading"><div><h2>Activity log</h2><p>Review recent activity across your organization.</p></div><label className="search-field audit-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity..." /></label></div><div className="table-scroll"><table className="audit-table"><thead><tr><th>TIMESTAMP</th><th>ACTOR</th><th>EVENT</th><th>RESOURCE</th><th>LOCATION</th><th /></tr></thead><tbody>{events.map((event) => <tr key={event[0]}>{event.map((cell, i) => <td key={i}>{i === 1 ? <span className="audit-actor"><Avatar initials={cell.split(' ').map((part) => part[0]).join('')} color="coral" small />{cell}</span> : i === 2 ? <code>{cell}</code> : cell}</td>)}<td><button className="icon-button" aria-label={`View details for ${event[2]}`} onClick={() => setNotice(`${event[2]} · ${event[1]} · ${event[0]}`)}><Eye size={13} /></button></td></tr>)}</tbody></table>{events.length === 0 && <div className="empty-state">No audit events match your search.</div>}</div></section><div className="security-actions"><a href="/api-keys" className="security-action"><KeyRound /><span><b>Manage API keys</b><small>Review and rotate access credentials.</small></span><ArrowRight /></a><a href="/workspaces" className="security-action"><Users /><span><b>Review team access</b><small>Check roles and pending invites.</small></span><ArrowRight /></a></div></>
}

function ApiKeysPage() {
  const [keys, setKeys] = useState([{ name: 'Production key', prefix: 'nx_live_•••••••8f2a', created: 'Oct 18, 2025', lastUsed: '2 minutes ago' }, { name: 'Staging key', prefix: 'nx_test_•••••••3c91', created: 'Sep 02, 2025', lastUsed: 'Yesterday' }])
  const [notice, setNotice] = useState('')
  function createKey() { setKeys((items) => [...items, { name: `New API key ${items.length + 1}`, prefix: `nx_test_•••••••${Math.random().toString(16).slice(2, 6)}`, created: 'Just now', lastUsed: 'Never' }]); setNotice('API key created in this local preview. Connect your backend to issue real credentials.') }
  return <><PageTitle title="API Keys" description="Create and manage credentials for your workspace integrations." actions={<button className="primary-button" onClick={createKey}><Plus size={14} /> Create API key</button>} /><div className="api-warning"><LockKeyhole size={16} /><span><b>Keep your keys safe.</b> Never share API keys in public code or client-side apps. Keys shown here are sample values.</span></div>{notice && <div className="billing-notice"><Check size={14} />{notice}</div>}<section className="api-keys-card"><div className="card-heading"><div><h2>Your keys</h2><p>Keys grant access to your workspace API.</p></div><span className="count-chip">{keys.length} keys</span></div>{keys.map((key) => <article className="api-key-row" key={key.name}><span className="api-key-icon"><FileKey size={17} /></span><div className="api-key-name"><b>{key.name}</b><code>{key.prefix}</code></div><div className="api-key-meta"><span>Created {key.created}</span><small>Last used {key.lastUsed}</small></div><button className="outline-button" onClick={() => setNotice(`${key.name} revoked in the preview.`)}><EyeOff size={13} /> Revoke</button></article>)}</section><section className="api-doc-callout"><FileText size={20} /><div><b>Build with the Nexara API</b><p>Read the integration guide to create workflows with your own services.</p></div><a href="/workspaces" className="text-button">Integration guide <ArrowRight size={13} /></a></section></>
}

function OverviewPage() {
  return <><PageTitle title="Workspace Overview" description="A snapshot of activity, team health, and usage across Acme Corp." actions={<a className="primary-button" href="/team"><Users size={14} /> Manage team</a>} /><div className="overview-stats"><article><span><Users size={15} /> Team members</span><b>8 <small>/ 10 seats</small></b><a href="/team">Manage members <ArrowRight size={12} /></a></article><article><span><Activity size={15} /> API calls this month</span><b>892 <small>/ 1,000</small></b><a href="/billing">View usage <ArrowRight size={12} /></a></article><article><span><Database size={15} /> Storage used</span><b>12.4 <small>GB / 50 GB</small></b><a href="/billing">Usage details <ArrowRight size={12} /></a></article><article><span><ShieldCheck size={15} /> Security score</span><b>Strong</b><a href="/audit">Security center <ArrowRight size={12} /></a></article></div><div className="overview-bottom"><section className="overview-panel"><div className="card-heading"><div><h2>Recent team activity</h2><p>The latest changes in your workspace.</p></div><a className="text-button" href="/audit">View audit log <ArrowRight size={12} /></a></div>{auditEvents.slice(0, 4).map((event) => <div className="recent-event" key={event[0]}><Avatar initials={event[1].split(' ').map((part) => part[0]).join('')} color="coral" small /><span><b>{event[1]}</b><small>{event[2]} · {event[3]}</small></span><time>{event[0].slice(11)}</time></div>)}</section><section className="overview-panel quick-links"><h2>Quick links</h2><a href="/workspaces"><Building2 /> Manage workspaces <ArrowRight /></a><a href="/billing"><WalletCards /> Billing and plans <ArrowRight /></a><a href="/api-keys"><KeyRound /> API keys <ArrowRight /></a><a href="/audit"><ShieldCheck /> Audit and security <ArrowRight /></a></section></div></>
}

function CheckoutPage() {
  const [completed, setCompleted] = useState(false)
  const [cycle, setCycle] = useState('monthly')
  return <div className="checkout-wrap"><a className="back-link" href="/billing"><ArrowLeft size={14} /> Back to billing</a><section className="checkout-card"><div className="checkout-copy"><span className="eyebrow">ACME CORP · PLAN UPGRADE</span><h1>Upgrade your workspace.</h1><p>Get more room for your team and workflows. Choose a billing cycle to preview your plan.</p><div className="cycle-select"><button className={cycle === 'monthly' ? 'active' : ''} onClick={() => setCycle('monthly')}>Monthly</button><button className={cycle === 'annual' ? 'active' : ''} onClick={() => setCycle('annual')}>Annual <b>Save 20%</b></button></div><div className="checkout-plan-row"><span><b>Enterprise</b><small>Unlimited seats · Priority support · SSO</small></span><b>${cycle === 'annual' ? '99' : '129'}<small> / seat / month</small></b></div>{completed ? <div className="form-success"><Check size={18} /><span><b>Checkout preview complete</b><small>No payment was taken. Connect server-side Stripe Checkout to accept payments securely.</small></span></div> : <form onSubmit={(event) => { event.preventDefault(); setCompleted(true) }} className="checkout-fields"><label>Billing email<input type="email" placeholder="billing@company.com" required /></label><label>Company name<input placeholder="Acme Corp" required /></label><button className="primary-button full-width">Continue to secure payment <ArrowRight size={14} /></button><small className="checkout-note"><LockKeyhole size={12} /> Demo only. No card details collected and no charge is made.</small></form>}</div><aside className="checkout-aside"><div className="plan-icon"><Zap size={19} /></div><h2>Enterprise</h2><p>For organizations building at scale.</p><ul><li><Check /> Unlimited team seats</li><li><Check /> Unlimited API usage</li><li><Check /> SSO / SAML and advanced security</li><li><Check /> Dedicated success manager</li></ul><div className="checkout-today"><span>Due today</span><b>$0.00</b></div><small>Your plan change begins after payment is configured.</small></aside></section></div>
}

function ProfilePage() {
  const [saved, setSaved] = useState(false)
  return <><PageTitle title="Your Profile" description="Manage your personal account details and preferences." /><section className="profile-settings"><Avatar initials="AO" color="coral" /><div><h2>Amara Okafor</h2><p>Workspace administrator · amara@acme.corp</p></div><label>Full name<input defaultValue="Amara Okafor" /></label><label>Email address<input type="email" defaultValue="amara@acme.corp" /></label><button className="primary-button" onClick={() => setSaved(true)}>{saved ? <><Check size={14} /> Changes saved</> : 'Save changes'}</button><p className="profile-note">Profile changes are saved in this local preview only.</p></section></>
}

function NotFound() {
  return <div className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This page isn't in your workspace.</h1><p>Choose an admin section from the menu to continue.</p><a className="primary-button" href="/overview">Go to overview <ArrowRight size={14} /></a></div>
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/overview'
  const [mobileOpen, setMobileOpen] = useState(false)
  const page = {
    '/': <OverviewPage />,
    '/overview': <OverviewPage />,
    '/team': <TeamPage />,
    '/workspaces': <WorkspacesPage />,
    '/billing': <BillingPage />,
    '/audit': <AuditPage />,
    '/api-keys': <ApiKeysPage />,
    '/checkout': <CheckoutPage />,
    '/profile': <ProfilePage />,
  }[path]
  const pageLabel = navItems.find((item) => item.path === path)?.label || 'Team & Access'
  const currentLabel = path === '/checkout' ? 'Checkout' : path === '/profile' ? 'Profile' : pageLabel
  return <div className="admin-app"><Sidebar path={path} mobileOpen={mobileOpen} closeMenu={() => setMobileOpen(false)} /><div className="main-shell"><Header currentLabel={currentLabel} onMenu={() => setMobileOpen(true)} /><main className="content"><div className="content-crumb"><span>Admin</span><ChevronRight size={12} /><span>Acme Corp</span><ChevronRight size={12} /><b>{currentLabel}</b></div>{page && path !== '/overview' && path !== '/team' && path !== '/checkout' && path !== '/profile' && <PageTabs path={path} />}{page || <NotFound />}</main><footer className="main-footer"><span>© 2025 Acme Corp. All rights reserved.</span><div><a href="/audit">Status: All systems operational</a><a href="/profile">Help & support</a></div></footer></div></div>
}

export default App
