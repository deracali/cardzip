import { useState } from 'react'
import { Activity, ArrowRight, CreditCard, ExternalLink, LayoutDashboard, LogOut, Package, Settings, Users } from 'lucide-react'
import '../dashboard.css'

const creatorSections = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Content', icon: Activity },
  { name: 'Products', icon: Package },
  { name: 'Audience', icon: Users },
  { name: 'Settings', icon: Settings },
]

const adminSections = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Creators', icon: Users },
  { name: 'Content', icon: Activity },
  { name: 'Products', icon: Package },
  { name: 'Payments', icon: CreditCard },
  { name: 'Settings', icon: Settings },
]

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('creatorhub_demo_session') || 'null')
  } catch {
    return null
  }
}

export default function CreatorDashboardPage({ admin = false }) {
  const [section, setSection] = useState('Overview')
  const session = getSession()
  if (admin && session?.role !== 'admin') {
    return <main className="ch-state"><section><h1>Administrator sign in</h1><p>Use admin@example.com in the Vite preview to open the static administrator dashboard.</p><a className="creator-button creator-button-primary" href="/login">Continue to sign in</a></section></main>
  }
  if (!admin && !session) {
    return <main className="ch-state"><section><h1>Creator sign in required</h1><p>Sign in to preview the static Creator Hub client dashboard.</p><a className="creator-button creator-button-primary" href="/login">Sign in</a></section></main>
  }
  const isAdmin = admin
  const sections = isAdmin ? adminSections : creatorSections
  const user = isAdmin
    ? { name: 'CreatorHub Administrator', email: 'admin@example.com' }
    : { name: session.name, email: session.email }

  function signOut() {
    localStorage.removeItem('creatorhub_demo_session')
    window.location.href = '/'
  }

  return (
    <div className={isAdmin ? 'ch-shell ch-admin-shell' : 'ch-shell ch-client-shell'}>
      <aside className="ch-sidebar">
        <a className="creator-brand" href="/"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
        <div className="ch-workspace"><span className={isAdmin ? 'ch-avatar ch-admin-avatar' : 'ch-avatar'}>{user.name.charAt(0)}</span><span><strong>{user.name}</strong><small>{isAdmin ? 'Platform administrator' : 'Creator account'}</small></span></div>
        <nav className="ch-nav" aria-label={`${isAdmin ? 'Admin' : 'Creator'} dashboard sections`}>
          {sections.map(({ name, icon: Icon }) => <button type="button" key={name} className={section === name ? 'active' : ''} onClick={() => setSection(name)}><Icon size={15} /> {name}</button>)}
        </nav>
        <div className="ch-sidebar-bottom"><a href="/">Return to website <ArrowRight size={13} /></a><button type="button" onClick={signOut}><LogOut size={13} /> Sign out</button></div>
      </aside>
      <main className="ch-main">
        <header className="ch-topbar"><div><span>{isAdmin ? 'ADMINISTRATION' : 'CREATOR WORKSPACE'}</span><strong>{section}</strong></div><span className={isAdmin ? 'ch-admin-chip' : 'ch-public-link'}>{isAdmin ? 'Static preview' : user.email}</span></header>
        <div className="ch-content">
          {isAdmin ? <AdminSection section={section} /> : <CreatorSection section={section} user={user} />}
        </div>
      </main>
    </div>
  )
}

function PageHeading({ eyebrow, title, copy, action }) {
  return <div className="ch-page-heading"><div><span className="ch-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</div>
}

function Metric({ label, value, icon: Icon, note }) {
  return <article className="ch-card ch-metric"><span>{label}<Icon size={16} /></span><strong>{value}</strong><small>{note}</small></article>
}

function CreatorSection({ section, user }) {
  return (
    <>
      <PageHeading eyebrow="CREATOR DASHBOARD" title={`Welcome back, ${user.name.split(' ')[0]}`} copy="A static preview of your Creator Hub workspace." action={<a className="creator-button creator-button-primary" href="/maya-chen">View public profile <ExternalLink size={14} /></a>} />
      {section === 'Overview' && <>
        <div className="ch-metrics"><Metric label="Published content" value="12" icon={Activity} note="4 newsletters, 8 posts" /><Metric label="Digital products" value="5" icon={Package} note="3 currently active" /><Metric label="Audience" value="2,482" icon={Users} note="+18% this month" /><Metric label="Creator earnings" value="$1,840" icon={CreditCard} note="Last 30 days" /></div>
        <div className="ch-overview-grid"><article className="ch-card"><div className="ch-panel-title"><div><h2>Recent content</h2><p>Your latest static workspace activity.</p></div></div><div className="ch-list"><div className="ch-list-row"><span className="ch-list-icon"><Activity size={15} /></span><span className="ch-list-copy"><strong>Building an audience without burnout</strong><small>Published · blog</small></span></div><div className="ch-list-row"><span className="ch-list-icon"><Package size={15} /></span><span className="ch-list-copy"><strong>Creator resource bundle</strong><small>Active · digital product</small></span></div></div></article><article className="ch-card ch-plan-card"><div className="ch-panel-title"><div><h2>Creator Pro</h2><p>Preview plan status</p></div></div><p><strong>$12 / month</strong><br />Monthly creator subscription</p><a className="creator-button creator-button-primary" href="/pricing">View pricing <ArrowRight size={14} /></a></article></div>
      </>}
      {section === 'Content' && <div className="ch-overview-grid"><article className="ch-card"><div className="ch-panel-title"><div><h2>Published content</h2><p>Static posts and newsletters</p></div></div><div className="ch-list">{['Building an audience without burnout','My 2026 creator workflow','A monthly newsletter for creative founders'].map((title, index) => <div className="ch-list-row" key={title}><span className="ch-list-icon"><Activity size={15} /></span><span className="ch-list-copy"><strong>{title}</strong><small>{index === 2 ? 'Newsletter · scheduled' : 'Blog · published'}</small></span><span className="ch-status success">live</span></div>)}</div></article><article className="ch-card"><div className="ch-panel-title"><div><h2>Content performance</h2><p>Last 30 days</p></div></div><div className="ch-list"><div className="ch-list-row"><span className="ch-list-copy"><strong>24,680 views</strong><small>All published content</small></span></div><div className="ch-list-row"><span className="ch-list-copy"><strong>1,842 engaged readers</strong><small>Average read completion 68%</small></span></div></div></article></div>}
      {section === 'Products' && <article className="ch-card"><div className="ch-panel-title"><div><h2>Digital products</h2><p>Static storefront inventory</p></div></div><div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Product</th><th>Price</th><th>Sales</th><th>Status</th></tr></thead><tbody>{[['Creator resource bundle','$29','186','Active'],['Brand pitch template','$18','94','Active'],['Instagram caption guide','$12','72','Draft']].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 3 ? <span className={cell === 'Active' ? 'ch-status success' : 'ch-status'}>{cell}</span> : <strong>{cell}</strong>}</td>)}</tr>)}</tbody></table></div></article>}
      {section === 'Audience' && <div className="ch-overview-grid"><article className="ch-card"><div className="ch-panel-title"><div><h2>Newsletter audience</h2><p>Static subscriber list</p></div></div><div className="ch-list">{['ada.okafor@example.com','sam.rivers@example.com','nina.bello@example.com','daniel.lee@example.com'].map((email) => <div className="ch-list-row" key={email}><span className="ch-list-icon"><Users size={15} /></span><span className="ch-list-copy"><strong>{email}</strong><small>Subscribed · 2026</small></span><span className="ch-status success">active</span></div>)}</div></article><article className="ch-card"><div className="ch-panel-title"><div><h2>Audience growth</h2><p>Monthly summary</p></div></div><div className="ch-metrics"><Metric label="Subscribers" value="2,482" icon={Users} note="+18% this month" /><Metric label="Open rate" value="64%" icon={Activity} note="+4.2 points" /></div></article></div>}
      {section === 'Settings' && <div className="ch-settings-grid"><article className="ch-card ch-form"><div className="ch-panel-title"><div><h2>Profile settings</h2><p>Static account profile</p></div></div><label>Display name<input value={user.name} readOnly /></label><label>Handle<input value="maya-chen" readOnly /></label><label>Bio<textarea rows="4" value="I share practical ideas for building a thoughtful creative business." readOnly /></label></article><article className="ch-card"><div className="ch-panel-title"><div><h2>Plan and account</h2><p>Preview settings</p></div></div><p><strong>Creator Pro</strong><br /><small>Renews on the 18th of each month</small></p><p><strong>Public profile</strong><br /><small>Enabled</small></p></article></div>}
    </>
  )
}

function AdminSection({ section }) {
  return (
    <>
      <PageHeading eyebrow="ADMINISTRATION" title={section} copy="Static platform operations view for the Vite preview." />
      {section === 'Overview' && <>
        <div className="ch-metrics"><Metric label="Creators" value="284" icon={Users} note="19 joined this month" /><Metric label="Published content" value="1,426" icon={Activity} note="Across all creators" /><Metric label="Active products" value="638" icon={Package} note="12 awaiting review" /><Metric label="Gross payments" value="$48,920" icon={CreditCard} note="Current reporting period" /></div>
        <div className="ch-overview-grid"><article className="ch-card"><div className="ch-panel-title"><div><h2>Creator management</h2><p>Recently active accounts</p></div></div><div className="ch-list"><div className="ch-list-row"><span className="ch-list-icon"><Users size={15} /></span><span className="ch-list-copy"><strong>Maya Chen</strong><small>Creator Pro · Public</small></span><span className="ch-status success">active</span></div><div className="ch-list-row"><span className="ch-list-icon"><Users size={15} /></span><span className="ch-list-copy"><strong>Alex Rivers</strong><small>Free · Public</small></span><span className="ch-status success">active</span></div></div></article><article className="ch-card"><div className="ch-panel-title"><div><h2>Payment activity</h2><p>Static Paystack preview records</p></div></div><div className="ch-list"><div className="ch-list-row"><span className="ch-list-icon"><CreditCard size={15} /></span><span className="ch-list-copy"><strong>Creator Pro subscription</strong><small>$12 · Maya Chen</small></span><span className="ch-status success">success</span></div></div></article></div>
      </>}
      {section === 'Creators' && <article className="ch-card"><div className="ch-panel-title"><div><h2>Creator accounts</h2><p>Static platform members</p></div></div><div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Creator</th><th>Email</th><th>Plan</th><th>Visibility</th><th>Status</th></tr></thead><tbody>{[['Maya Chen','maya@example.com','Pro','Public','Active'],['Alex Rivers','alex@example.com','Free','Public','Active'],['Nia Jones','nia@example.com','Pro','Private','Review']].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 4 ? <span className={cell === 'Active' ? 'ch-status success' : 'ch-status pending'}>{cell}</span> : <strong>{cell}</strong>}</td>)}</tr>)}</tbody></table></div></article>}
      {section === 'Content' && <article className="ch-card"><div className="ch-panel-title"><div><h2>Platform content</h2><p>Static moderation view</p></div></div><div className="ch-list">{['Building an audience without burnout','Creator product launch checklist','How to plan a weekly newsletter'].map((title) => <div className="ch-list-row" key={title}><span className="ch-list-icon"><Activity size={15} /></span><span className="ch-list-copy"><strong>{title}</strong><small>Maya Chen · blog post</small></span><span className="ch-status success">published</span></div>)}</div></article>}
      {section === 'Products' && <article className="ch-card"><div className="ch-panel-title"><div><h2>Platform products</h2><p>Static marketplace inventory</p></div></div><div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Product</th><th>Creator</th><th>Price</th><th>Status</th></tr></thead><tbody>{[['Creator resource bundle','Maya Chen','$29','Active'],['Brand pitch template','Alex Rivers','$18','Active'],['Creator Notion system','Nia Jones','$24','Review']].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 3 ? <span className={cell === 'Active' ? 'ch-status success' : 'ch-status pending'}>{cell}</span> : <strong>{cell}</strong>}</td>)}</tr>)}</tbody></table></div></article>}
      {section === 'Payments' && <article className="ch-card"><div className="ch-panel-title"><div><h2>Payment activity</h2><p>Static Paystack records</p></div></div><div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Type</th><th>Status</th></tr></thead><tbody>{[['CH-10482','maya@example.com','$12','Creator Pro','Success'],['CH-10481','alex@example.com','$29','Digital product','Success'],['CH-10480','nia@example.com','$18','Digital product','Pending']].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 4 ? <span className={cell === 'Success' ? 'ch-status success' : 'ch-status pending'}>{cell}</span> : <strong>{cell}</strong>}</td>)}</tr>)}</tbody></table></div></article>}
      {section === 'Settings' && <div className="ch-settings-grid"><article className="ch-card"><div className="ch-panel-title"><div><h2>Payment provider</h2><p>Static platform configuration</p></div></div><p><strong>Paystack</strong><br /><small>Configured for preview purposes</small></p><p><strong>Currency</strong><br /><small>USD</small></p></article><article className="ch-card"><div className="ch-panel-title"><div><h2>Platform totals</h2><p>Static reporting summary</p></div></div><p><strong>284 creators</strong><br /><small>19 joined this month</small></p><p><strong>2,482 newsletter subscribers</strong></p></article></div>}
    </>
  )
}
