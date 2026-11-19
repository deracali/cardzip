"use client";

import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Activity, CreditCard, FileText, LayoutDashboard, LogOut, Package, Settings as SettingsIcon,
  ShieldCheck, UserRound, Users,
} from 'lucide-react'
import { ApiError, apiRequest } from '../services/api'
import '../dashboard.css'

type Section = 'Overview' | 'Creators' | 'Content' | 'Blog' | 'Explore' | 'Products' | 'Payments' | 'Settings'
type Creator = {
  _id: string
  handle: string
  displayName: string
  isPublic: boolean
  plan: string
  user: { _id?: string; name: string; email: string; active: boolean; plan: string; createdAt: string }
}
type AdminContent = { _id: string; title: string; type: string; published: boolean; creator?: { handle: string } }
type AdminProduct = { _id: string; title: string; active: boolean; price: number; currency: string; creator?: { handle: string } }
type BlogPost = { _id: string; title: string; slug: string; category: string; excerpt: string; body: string; coverImage: string; published: boolean }
type ExploreLink = { _id: string; title: string; description: string; url: string; category: string; imageUrl: string; active: boolean }
type PaymentRecord = { _id: string; type: string; amount: number; currency: string; status: string; customerEmail: string; reference: string; createdAt: string; creator?: { handle: string }; product?: { title: string } }
type Summary = { creators: number; activeCreators: number; content: number; products: number; subscribers: number; pendingPayments: number; grossPayments: number }
type SettingsData = { paymentProvider: { name: string; configured: boolean; currency: string; proPlanConfigured: boolean; proAmount: number }; totals: { creators: number; subscribers: number } }

const sections: { name: Section; icon: typeof LayoutDashboard }[] = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Creators', icon: Users },
  { name: 'Content', icon: FileText },
  { name: 'Blog', icon: FileText },
  { name: 'Explore', icon: Activity },
  { name: 'Products', icon: Package },
  { name: 'Payments', icon: CreditCard },
  { name: 'Settings', icon: SettingsIcon },
]

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>('Overview')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [creators, setCreators] = useState<Creator[]>([])
  const [content, setContent] = useState<AdminContent[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [exploreLinks, setExploreLinks] = useState<ExploreLink[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadData = useCallback(async () => {
    try {
      const session = await apiRequest<{ user: { role: string } }>('/auth/me')
      if (session.user.role !== 'admin') {
        window.location.href = '/dashboard'
        return
      }
      const [summaryResult, creatorResult, contentResult, blogResult, exploreResult, productResult, paymentResult, settingsResult] = await Promise.all([
        apiRequest<{ metrics: Summary }>('/admin/summary'),
        apiRequest<{ creators: Creator[] }>('/admin/creators'),
        apiRequest<{ content: AdminContent[] }>('/admin/content'),
        apiRequest<{ posts: BlogPost[] }>('/admin/blog'),
        apiRequest<{ links: ExploreLink[] }>('/admin/explore'),
        apiRequest<{ products: AdminProduct[] }>('/admin/products'),
        apiRequest<{ payments: PaymentRecord[] }>('/admin/payments'),
        apiRequest<SettingsData>('/admin/settings'),
      ])
      setSummary(summaryResult.metrics)
      setCreators(creatorResult.creators)
      setContent(contentResult.content)
      setBlogPosts(blogResult.posts)
      setExploreLinks(exploreResult.links)
      setProducts(productResult.products)
      setPayments(paymentResult.payments)
      setSettings(settingsResult)
      setError('')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        window.location.href = '/admin/login?next=%2Fadmin'
        return
      }
      setError(requestError instanceof Error ? requestError.message : 'Unable to load platform workspace.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  async function updateCreator(creator: Creator, changes: { active?: boolean; isPublic?: boolean; plan?: string }) {
    setError('')
    setNotice('')
    try {
      await apiRequest(`/admin/creators/${creator._id}`, { method: 'PATCH', body: JSON.stringify(changes) })
      setNotice(`Updated ${creator.displayName}.`)
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update creator.')
    }
  }

  async function updateContent(item: AdminContent) {
    setError('')
    try {
      await apiRequest(`/admin/content/${item._id}`, { method: 'PATCH', body: JSON.stringify({ published: !item.published }) })
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update content.')
    }
  }

  async function updateProduct(product: AdminProduct) {
    setError('')
    try {
      await apiRequest(`/admin/products/${product._id}`, { method: 'PATCH', body: JSON.stringify({ active: !product.active }) })
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update product.')
    }
  }

  async function createBlogPost(post: Omit<BlogPost, '_id' | 'slug'> & { slug?: string }): Promise<boolean> {
    setError('')
    try {
      await apiRequest('/admin/blog', { method: 'POST', body: JSON.stringify(post) })
      setNotice('Blog post saved.')
      await loadData()
      return true
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save blog post.')
      return false
    }
  }

  async function toggleBlogPost(post: BlogPost) {
    setError('')
    try {
      await apiRequest(`/admin/blog/${post._id}`, { method: 'PATCH', body: JSON.stringify({ published: !post.published }) })
      setNotice(`Blog post ${post.published ? 'unpublished' : 'published'}.`)
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update blog post.')
    }
  }

  async function editBlogPost(post: BlogPost, changes: Omit<BlogPost, '_id'>): Promise<boolean> {
    setError('')
    try {
      await apiRequest(`/admin/blog/${post._id}`, { method: 'PATCH', body: JSON.stringify(changes) })
      setNotice('Blog post updated.')
      await loadData()
      return true
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update blog post.')
      return false
    }
  }

  async function deleteBlogPost(post: BlogPost) {
    setError('')
    try {
      await apiRequest(`/admin/blog/${post._id}`, { method: 'DELETE' })
      setNotice(`Deleted “${post.title}”.`)
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete blog post.')
    }
  }

  async function createExploreLink(link: Omit<ExploreLink, '_id'>): Promise<boolean> {
    setError('')
    try {
      await apiRequest('/admin/explore', { method: 'POST', body: JSON.stringify(link) })
      setNotice('Explore destination saved.')
      await loadData()
      return true
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save explore destination.')
      return false
    }
  }

  async function toggleExploreLink(link: ExploreLink) {
    setError('')
    try {
      await apiRequest(`/admin/explore/${link._id}`, { method: 'PATCH', body: JSON.stringify({ active: !link.active }) })
      setNotice(`Explore destination ${link.active ? 'hidden' : 'published'}.`)
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update explore destination.')
    }
  }

  async function deleteExploreLink(link: ExploreLink) {
    setError('')
    try {
      await apiRequest(`/admin/explore/${link._id}`, { method: 'DELETE' })
      setNotice(`Deleted “${link.title}”.`)
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete explore destination.')
    }
  }

  async function createProduct(product: { creatorId: string; title: string; description: string; imageUrl: string; price: number; currency: string; downloadUrl: string }): Promise<boolean> {
    setError('')
    try {
      await apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(product) })
      setNotice('Storefront product published.')
      await loadData()
      return true
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to publish storefront product.')
      return false
    }
  }

  async function signOut() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign out.')
    }
  }

  if (loading) return <div className="ch-state">Loading platform dashboard…</div>

  return <div className="ch-shell">
    <aside className="ch-sidebar">
      <a className="creator-brand" href="/"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
      <div className="ch-workspace"><span className="ch-avatar ch-admin-avatar"><ShieldCheck size={17} /></span><span><strong>Platform Admin</strong><small>Operations console</small></span></div>
      <nav className="ch-nav" aria-label="Platform administration">
        {sections.map(({ name, icon: Icon }) => <button key={name} type="button" className={section === name ? 'active' : ''} onClick={() => { setSection(name); setNotice('') }}><Icon size={16} />{name}</button>)}
      </nav>
      <div className="ch-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer"><Activity size={15} /> Public website</a><button type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
    </aside>
    <main className="ch-main">
      <header className="ch-topbar"><div><span>CREATORHUB PLATFORM</span><strong>{section}</strong></div><span className="ch-admin-chip"><ShieldCheck size={15} /> Administrator</span></header>
      <section className="ch-content">
        {error && <p className="ch-alert" role="alert">{error}</p>}
        {notice && <p className="ch-success" role="status">{notice}</p>}
        {section === 'Overview' && <AdminOverview summary={summary} settings={settings} />}
        {section === 'Creators' && <CreatorsTable creators={creators} onUpdate={updateCreator} />}
        {section === 'Content' && <ContentTable content={content} onUpdate={updateContent} />}
        {section === 'Blog' && <BlogManager posts={blogPosts} onCreate={createBlogPost} onEdit={editBlogPost} onToggle={toggleBlogPost} onDelete={deleteBlogPost} />}
        {section === 'Explore' && <ExploreManager links={exploreLinks} onCreate={createExploreLink} onToggle={toggleExploreLink} onDelete={deleteExploreLink} />}
        {section === 'Products' && <ProductsTable products={products} creators={creators} currency={settings?.paymentProvider.currency || 'USD'} onCreate={createProduct} onUpdate={updateProduct} />}
        {section === 'Payments' && <PaymentsTable payments={payments} />}
        {section === 'Settings' && <AdminSettings settings={settings} />}
      </section>
    </main>
  </div>
}

function AdminOverview({ summary, settings }: { summary: Summary | null; settings: SettingsData | null }) {
  const values = [
    { label: 'Total creators', value: summary?.creators ?? 0, icon: Users },
    { label: 'Active creator pages', value: summary?.activeCreators ?? 0, icon: UserRound },
    { label: 'Published content', value: summary?.content ?? 0, icon: FileText },
    { label: 'Products in store', value: summary?.products ?? 0, icon: Package },
    { label: 'Newsletter subscribers', value: summary?.subscribers ?? 0, icon: Users },
    { label: 'Gross payments', value: `${settings?.paymentProvider.currency || 'USD'} ${(summary?.grossPayments ?? 0).toFixed(2)}`, icon: CreditCard },
  ]
  return <>
    <div className="ch-page-heading"><div><span className="ch-eyebrow">PLATFORM OVERVIEW</span><h1>Creator Hub operations</h1><p>Monitor creators, storefronts and platform payments.</p></div></div>
    <div className="ch-metrics">{values.map(({ label, value, icon: Icon }) => <article className="ch-card ch-metric" key={label}><span>{label}<Icon size={16} /></span><strong>{value}</strong></article>)}</div>
    <article className="ch-card ch-admin-callout"><span className="ch-list-icon"><CreditCard size={18} /></span><div><strong>Paystack payments</strong><p>{settings?.paymentProvider.configured ? `Connected · ${settings.paymentProvider.currency}` : 'Not configured yet. Add Paystack keys in the backend .env to enable paid checkout.'}</p></div><span className={`ch-status ${settings?.paymentProvider.configured ? 'success' : 'pending'}`}>{settings?.paymentProvider.configured ? 'Connected' : 'Setup required'}</span></article>
  </>
}

function CreatorsTable({ creators, onUpdate }: { creators: Creator[]; onUpdate: (creator: Creator, changes: { active?: boolean; isPublic?: boolean; plan?: string }) => void }) {
  return <TablePage eyebrow="COMMUNITY" title="Creator accounts" description="Review creator profiles, visibility and access status.">
    <div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Creator</th><th>Plan</th><th>Joined</th><th>Access</th><th>Public page</th><th>Actions</th></tr></thead><tbody>
      {creators.map((creator) => <tr key={creator._id}><td><strong>{creator.displayName}</strong><small>{creator.user?.email} · /{creator.handle}</small></td><td>{creator.user?.plan || creator.plan}</td><td>{creator.user?.createdAt ? new Date(creator.user.createdAt).toLocaleDateString() : '—'}</td><td><span className={`ch-status ${creator.user?.active ? 'success' : 'pending'}`}>{creator.user?.active ? 'Active' : 'Suspended'}</span></td><td><span className={`ch-status ${creator.isPublic ? 'success' : 'pending'}`}>{creator.isPublic ? 'Visible' : 'Hidden'}</span></td><td><div className="ch-row-actions"><button type="button" onClick={() => onUpdate(creator, { active: !creator.user?.active })}>{creator.user?.active ? 'Suspend' : 'Restore'}</button><button type="button" onClick={() => onUpdate(creator, { isPublic: !creator.isPublic })}>{creator.isPublic ? 'Hide page' : 'Show page'}</button></div></td></tr>)}
      {!creators.length && <tr><td colSpan={6} className="ch-empty">No creator accounts registered.</td></tr>}
    </tbody></table></div>
  </TablePage>
}

function ContentTable({ content, onUpdate }: { content: AdminContent[]; onUpdate: (item: AdminContent) => void }) {
  return <TablePage eyebrow="MODERATION" title="Creator content" description="Review creator posts and control publishing status.">
    <div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Title</th><th>Creator</th><th>Type</th><th>Status</th><th>Moderation</th></tr></thead><tbody>
      {content.map((item) => <tr key={item._id}><td>{item.title}</td><td>@{item.creator?.handle || '—'}</td><td>{item.type}</td><td><span className={`ch-status ${item.published ? 'success' : 'pending'}`}>{item.published ? 'Published' : 'Draft'}</span></td><td><button type="button" className="ch-table-action" onClick={() => onUpdate(item)}>{item.published ? 'Unpublish' : 'Publish'}</button></td></tr>)}
      {!content.length && <tr><td colSpan={5} className="ch-empty">No creator content yet.</td></tr>}
    </tbody></table></div>
  </TablePage>
}

function BlogManager({ posts, onCreate, onEdit, onToggle, onDelete }: {
  posts: BlogPost[]
  onCreate: (post: Omit<BlogPost, '_id' | 'slug'> & { slug?: string }) => Promise<boolean>
  onEdit: (post: BlogPost, changes: Omit<BlogPost, '_id'>) => Promise<boolean>
  onToggle: (post: BlogPost) => void
  onDelete: (post: BlogPost) => void
}) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (await onCreate({
      title: String(data.get('title') || ''),
      slug: String(data.get('slug') || ''),
      category: String(data.get('category') || 'CREATOR NOTES'),
      excerpt: String(data.get('excerpt') || ''),
      body: String(data.get('body') || ''),
      coverImage: String(data.get('coverImage') || ''),
      published: false,
    })) form.reset()
  }
  return <TablePage eyebrow="PUBLISHING" title="Platform blog" description="Write and publish stories that appear on the public homepage and blog.">
    <form className="ch-form ch-cms-form" onSubmit={(event) => void submit(event)}>
      <div className="ch-panel-title"><div><span className="ch-eyebrow">NEW STORY</span><h2>Create a blog post</h2></div><FileText size={18} /></div>
      <div className="ch-form-row ch-cms-two-col"><label>Title<input name="title" required maxLength={160} /></label><label>Category<input name="category" defaultValue="CREATOR NOTES" maxLength={50} /></label></div>
      <label>URL slug (optional)<input name="slug" placeholder="generated-from-title" maxLength={160} /></label>
      <label>Short description<textarea name="excerpt" required rows={2} maxLength={280} /></label>
      <label>Article body<textarea name="body" required rows={8} maxLength={20000} placeholder="Write paragraphs separated by a blank line." /></label>
      <label>Cover image URL<input name="coverImage" type="url" placeholder="https://…" /></label>
      <button className="creator-button creator-button-primary" type="submit">Save as draft</button>
    </form>
    <div className="ch-cms-list">
      {!posts.length && <p className="ch-empty">No platform blog posts yet. Create a story above to publish the first one.</p>}
      {posts.map((post) => <article className="ch-cms-entry" key={post._id}>
        <div className="ch-cms-entry-head"><div><strong>{post.title}</strong><small>/{post.slug} · {post.category}</small></div><span className={`ch-status ${post.published ? 'success' : 'pending'}`}>{post.published ? 'Published' : 'Draft'}</span></div>
        <p>{post.excerpt}</p>
        <details><summary>Edit story</summary><BlogEditForm post={post} onSave={onEdit} /></details>
        <div className="ch-row-actions"><button type="button" onClick={() => onToggle(post)}>{post.published ? 'Unpublish' : 'Publish'}</button>{post.published && <a className="ch-small-action" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">View live</a>}<button type="button" onClick={() => { if (window.confirm(`Delete “${post.title}”?`)) onDelete(post) }}>Delete</button></div>
      </article>)}
    </div>
  </TablePage>
}

function BlogEditForm({ post, onSave }: { post: BlogPost; onSave: (post: BlogPost, changes: Omit<BlogPost, '_id'>) => Promise<boolean> }) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const saved = await onSave(post, {
      title: String(data.get('title') || ''),
      slug: String(data.get('slug') || ''),
      category: String(data.get('category') || ''),
      excerpt: String(data.get('excerpt') || ''),
      body: String(data.get('body') || ''),
      coverImage: String(data.get('coverImage') || ''),
      published: post.published,
    })
    if (saved) form.closest('details')?.removeAttribute('open')
  }
  return <form className="ch-form ch-cms-edit" onSubmit={(event) => void submit(event)}>
    <label>Title<input name="title" defaultValue={post.title} required maxLength={160} /></label>
    <div className="ch-form-row ch-cms-two-col"><label>URL slug<input name="slug" defaultValue={post.slug} required maxLength={160} /></label><label>Category<input name="category" defaultValue={post.category} maxLength={50} /></label></div>
    <label>Short description<textarea name="excerpt" defaultValue={post.excerpt} required rows={2} maxLength={280} /></label>
    <label>Article body<textarea name="body" defaultValue={post.body} required rows={7} maxLength={20000} /></label>
    <label>Cover image URL<input name="coverImage" type="url" defaultValue={post.coverImage} /></label>
    <button className="ch-small-action" type="submit">Save changes</button>
  </form>
}

function ExploreManager({ links, onCreate, onToggle, onDelete }: {
  links: ExploreLink[]
  onCreate: (link: Omit<ExploreLink, '_id'>) => Promise<boolean>
  onToggle: (link: ExploreLink) => void
  onDelete: (link: ExploreLink) => void
}) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (await onCreate({
      title: String(data.get('title') || ''),
      description: String(data.get('description') || ''),
      url: String(data.get('url') || ''),
      category: String(data.get('category') || 'FEATURED'),
      imageUrl: String(data.get('imageUrl') || ''),
      active: true,
    })) form.reset()
  }
  return <TablePage eyebrow="DISCOVERY" title="Explore destinations" description="Add featured tools, creators, campaigns and useful destinations to the public Explore page.">
    <form className="ch-form ch-cms-form" onSubmit={(event) => void submit(event)}>
      <div className="ch-panel-title"><div><span className="ch-eyebrow">NEW DESTINATION</span><h2>Add an Explore card</h2></div><Activity size={18} /></div>
      <div className="ch-form-row ch-cms-two-col"><label>Title<input name="title" required maxLength={100} /></label><label>Category<input name="category" defaultValue="FEATURED" maxLength={50} /></label></div>
      <label>Description<textarea name="description" required rows={2} maxLength={280} /></label>
      <label>Destination URL<input name="url" type="url" required placeholder="https://…" /></label>
      <label>Image URL (optional)<input name="imageUrl" type="url" placeholder="https://…" /></label>
      <button className="creator-button creator-button-primary" type="submit">Publish destination</button>
    </form>
    <div className="ch-cms-list">
      {!links.length && <p className="ch-empty">No Explore destinations yet. Add one above.</p>}
      {links.map((link) => <article className="ch-cms-entry" key={link._id}>
        <div className="ch-cms-entry-head"><div><strong>{link.title}</strong><small>{link.category} · {link.url}</small></div><span className={`ch-status ${link.active ? 'success' : 'pending'}`}>{link.active ? 'Live' : 'Hidden'}</span></div>
        <p>{link.description}</p>
        <div className="ch-row-actions"><button type="button" onClick={() => onToggle(link)}>{link.active ? 'Hide' : 'Publish'}</button><a className="ch-small-action" href={link.url} target="_blank" rel="noreferrer">Open link</a><button type="button" onClick={() => { if (window.confirm(`Delete “${link.title}”?`)) onDelete(link) }}>Delete</button></div>
      </article>)}
    </div>
  </TablePage>
}

function ProductsTable({ products, creators, currency, onCreate, onUpdate }: {
  products: AdminProduct[]
  creators: Creator[]
  currency: string
  onCreate: (product: { creatorId: string; title: string; description: string; imageUrl: string; price: number; currency: string; downloadUrl: string }) => Promise<boolean>
  onUpdate: (item: AdminProduct) => void
}) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (await onCreate({
      creatorId: String(data.get('creatorId') || ''),
      title: String(data.get('title') || ''),
      description: String(data.get('description') || ''),
      imageUrl: String(data.get('imageUrl') || ''),
      price: Number(data.get('price')),
      currency: String(data.get('currency') || 'USD'),
      downloadUrl: String(data.get('downloadUrl') || ''),
    })) form.reset()
  }
  return <TablePage eyebrow="MARKETPLACE" title="Digital products" description="Publish platform storefront items and moderate creator marketplace listings.">
    <form className="ch-form ch-cms-form" onSubmit={(event) => void submit(event)}>
      <div className="ch-panel-title"><div><span className="ch-eyebrow">ADD TO THE PUBLIC STORE</span><h2>Create a storefront product</h2></div><Package size={18} /></div>
      <label>Creator<select name="creatorId" required defaultValue=""><option value="" disabled>Select a creator</option>{creators.map((creator) => <option key={creator._id} value={creator._id}>@{creator.handle} — {creator.displayName}</option>)}</select></label>
      <label>Product name<input name="title" required maxLength={120} /></label>
      <label>Description<textarea name="description" required rows={3} maxLength={1000} /></label>
      <div className="ch-form-row"><label>Price<input name="price" type="number" min="0.01" step="0.01" required /></label><label>Currency<input name="currency" value={currency} readOnly required /></label></div>
      <label>Product image URL (optional)<input name="imageUrl" type="url" /></label>
      <label>Digital delivery URL<input name="downloadUrl" type="url" required placeholder="https://…" /></label>
      <button className="creator-button creator-button-primary" type="submit" disabled={!creators.length}>Publish storefront product</button>
      {!creators.length && <p className="creator-info-note">Register a creator account before adding products to the storefront.</p>}
    </form>
    <div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Product</th><th>Creator</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {products.map((item) => <tr key={item._id}><td>{item.title}</td><td>@{item.creator?.handle || '—'}</td><td>{item.currency} {item.price.toFixed(2)}</td><td><span className={`ch-status ${item.active ? 'success' : 'pending'}`}>{item.active ? 'Listed' : 'Hidden'}</span></td><td><button type="button" className="ch-table-action" onClick={() => onUpdate(item)}>{item.active ? 'Hide product' : 'Restore'}</button></td></tr>)}
      {!products.length && <tr><td colSpan={5} className="ch-empty">No marketplace products yet.</td></tr>}
    </tbody></table></div>
  </TablePage>
}

function PaymentsTable({ payments }: { payments: PaymentRecord[] }) {
  return <TablePage eyebrow="REVENUE" title="Platform payments" description="Paystack transaction records for Creator Pro and creator products.">
    <div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Transaction</th><th>Creator</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>
      {payments.map((item) => <tr key={item._id}><td><strong>{item.type === 'pro' ? 'Creator Pro' : item.product?.title || 'Digital product'}</strong><small>{item.reference}</small></td><td>@{item.creator?.handle || '—'}</td><td>{item.customerEmail}</td><td>{item.currency} {(item.amount / 100).toFixed(2)}</td><td><span className={`ch-status ${item.status === 'success' ? 'success' : 'pending'}`}>{item.status}</span></td><td>{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}
      {!payments.length && <tr><td colSpan={6} className="ch-empty">No payment activity yet.</td></tr>}
    </tbody></table></div>
  </TablePage>
}

function AdminSettings({ settings }: { settings: SettingsData | null }) {
  return <TablePage eyebrow="PLATFORM CONFIGURATION" title="Settings" description="Payment credentials stay in the Express backend environment and are never shown here.">
    <div className="ch-settings-grid"><article className="ch-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">PAYMENT GATEWAY</span><h2>{settings?.paymentProvider.name || 'Paystack'}</h2></div><CreditCard size={18} /></div><p>Status: <strong>{settings?.paymentProvider.configured ? 'Configured' : 'Not configured'}</strong></p><p>Currency: <strong>{settings?.paymentProvider.currency || 'USD'}</strong></p><p>Creator Pro Paystack plan: <strong>{settings?.paymentProvider.proPlanConfigured ? 'Configured' : 'Missing plan code'}</strong></p><p>Set PAYSTACK_SECRET_KEY and PAYSTACK_PRO_PLAN_CODE in backend/.env to enable checkout.</p></article><article className="ch-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">PLATFORM TOTALS</span><h2>Community</h2></div><Users size={18} /></div><p>Registered creators: <strong>{settings?.totals.creators ?? 0}</strong></p><p>Active subscribers: <strong>{settings?.totals.subscribers ?? 0}</strong></p><p>Configure allowed website origins and a strong JWT_SECRET before production.</p></article></div>
  </TablePage>
}

function TablePage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <><div className="ch-page-heading"><div><span className="ch-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div><article className="ch-card">{children}</article></>
}
