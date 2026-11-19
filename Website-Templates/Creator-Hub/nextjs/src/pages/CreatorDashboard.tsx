"use client";

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowUpRight, BadgeCheck, BookOpen, CreditCard, ExternalLink, Eye, FileText,
  LayoutDashboard, LogOut, Plus, Save, Settings, ShoppingBag, Trash2, Users,
} from 'lucide-react'
import { ApiError, apiRequest } from '../services/api'
import '../dashboard.css'

type Profile = {
  _id: string
  handle: string
  displayName: string
  tagline: string
  bio: string
  avatarUrl: string
  isPublic: boolean
  plan: 'free' | 'pro'
  links: { label: string; url: string }[]
}
type ContentItem = {
  _id: string
  title: string
  type: string
  description: string
  url: string
  published: boolean
}
type Product = {
  _id: string
  title: string
  description: string
  price: number
  currency: string
  imageUrl: string
  downloadUrl: string
  active: boolean
}
type Analytics = { contentCount: number; publishedCount: number; subscribers: number; earnings: number; plan: string }
type PaymentConfig = { configured: boolean; currency: string; proAmount: number; proPlanConfigured: boolean }
type DashboardData = { profile: Profile; content: ContentItem[]; products: Product[]; analytics: Analytics; paymentConfig: PaymentConfig }
type ProductForm = { title: string; description: string; price: string; currency: string; imageUrl: string; downloadUrl: string }
type Section = 'Overview' | 'Content' | 'Products' | 'Audience' | 'Settings'
const sections: { name: Section; icon: typeof LayoutDashboard }[] = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Content', icon: FileText },
  { name: 'Products', icon: ShoppingBag },
  { name: 'Audience', icon: Users },
  { name: 'Settings', icon: Settings },
]

export default function CreatorDashboard() {
  const [section, setSection] = useState<Section>('Overview')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [subscribers, setSubscribers] = useState<{ email: string; createdAt: string }[]>([])
  const [contentForm, setContentForm] = useState({ title: '', type: 'blog', description: '', url: '' })
  const [productForm, setProductForm] = useState<ProductForm>({ title: '', description: '', price: '', currency: 'USD', imageUrl: '', downloadUrl: '' })

  const loadData = useCallback(async () => {
    try {
      const [dashboard, paymentConfig] = await Promise.all([
        apiRequest<Omit<DashboardData, 'paymentConfig'>>('/creators/me'),
        apiRequest<PaymentConfig>('/payments/config'),
      ])
      setData({ ...dashboard, paymentConfig })
      setProductForm((current) => ({ ...current, currency: paymentConfig.currency }))
      setError('')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        window.location.href = '/login?next=%2Fdashboard'
        return
      }
      setError(requestError instanceof Error ? requestError.message : 'Unable to load creator workspace.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  useEffect(() => {
    if (section !== 'Audience') return
    apiRequest<{ subscribers: { email: string; createdAt: string }[] }>('/creators/me/subscribers')
      .then((result) => setSubscribers(result.subscribers))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load your audience.'))
  }, [section])

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setNotice('')
    setError('')
    try {
      let links: { label: string; url: string }[]
      try {
        links = JSON.parse(String(form.get('links') || '[]')) as { label: string; url: string }[]
      } catch {
        throw new Error('Links must be valid JSON, for example [{"label":"Portfolio","url":"https://example.com"}].')
      }
      await apiRequest('/creators/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: form.get('displayName'),
          tagline: form.get('tagline'),
          bio: form.get('bio'),
          avatarUrl: form.get('avatarUrl'),
          isPublic: form.get('isPublic') === 'on',
          links,
        }),
      })
      setNotice('Your profile settings are saved.')
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function addContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      await apiRequest('/content', { method: 'POST', body: JSON.stringify(contentForm) })
      setContentForm({ title: '', type: 'blog', description: '', url: '' })
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save content.')
    }
  }

  async function togglePublished(item: ContentItem) {
    try {
      await apiRequest(`/content/${item._id}`, { method: 'PATCH', body: JSON.stringify({ published: !item.published }) })
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update content.')
    }
  }

  async function deleteContent(id: string) {
    try {
      await apiRequest(`/content/${id}`, { method: 'DELETE' })
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete content.')
    }
  }

  async function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      await apiRequest('/content/products', { method: 'POST', body: JSON.stringify(productForm) })
      setProductForm({ title: '', description: '', price: '', currency: 'USD', imageUrl: '', downloadUrl: '' })
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save product.')
    }
  }

  async function deactivateProduct(id: string) {
    try {
      await apiRequest(`/content/products/${id}`, { method: 'DELETE' })
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to remove product.')
    }
  }

  async function upgradePlan() {
    setError('')
    try {
      const result = await apiRequest<{ checkoutUrl: string }>('/payments/pro/checkout', { method: 'POST', body: '{}' })
      window.location.href = result.checkoutUrl
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start Pro checkout.')
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

  if (loading) return <div className="ch-state">Loading your creator workspace…</div>
  if (!data) return <div className="ch-state"><p className="ch-alert">{error || 'Creator profile is unavailable.'}</p><a className="creator-button creator-button-primary" href="/login">Sign in</a></div>

  return (
    <div className="ch-shell">
      <aside className="ch-sidebar">
        <a className="creator-brand" href="/"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
        <div className="ch-workspace"><span className="ch-avatar">{data.profile.displayName.charAt(0)}</span><span><strong>{data.profile.displayName}</strong><small>Creator workspace</small></span></div>
        <nav className="ch-nav" aria-label="Creator workspace">
          {sections.map(({ name, icon: Icon }) => <button key={name} type="button" className={section === name ? 'active' : ''} onClick={() => { setSection(name); setNotice('') }}><Icon size={16} />{name}</button>)}
        </nav>
        <div className="ch-sidebar-bottom">
          <a href={`/${data.profile.handle}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /> View public page</a>
          <button type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>
        </div>
      </aside>
      <main className="ch-main">
        <header className="ch-topbar"><div><span>CREATOR WORKSPACE</span><strong>{section}</strong></div><a className="ch-public-link" href={`/${data.profile.handle}`} target="_blank" rel="noreferrer"><Eye size={15} /> Preview page <ArrowUpRight size={14} /></a></header>
        <section className="ch-content">
          {error && <p className="ch-alert" role="alert">{error}</p>}
          {notice && <p className="ch-success" role="status">{notice}</p>}
          {section === 'Overview' && <Overview data={data} onUpgrade={upgradePlan} />}
          {section === 'Content' && <ContentSection content={data.content} form={contentForm} setForm={setContentForm} onAdd={addContent} onToggle={togglePublished} onDelete={deleteContent} />}
          {section === 'Products' && <ProductsSection products={data.products} form={productForm} setForm={setProductForm} onAdd={addProduct} onDelete={deactivateProduct} />}
          {section === 'Audience' && <AudienceSection subscribers={subscribers} />}
          {section === 'Settings' && <SettingsSection profile={data.profile} paymentConfig={data.paymentConfig} saving={saving} onSave={saveProfile} onUpgrade={upgradePlan} />}
        </section>
      </main>
    </div>
  )
}

function Overview({ data, onUpgrade }: { data: DashboardData; onUpgrade: () => void }) {
  const metrics = [
    { label: 'Published content', value: data.analytics.publishedCount, icon: FileText },
    { label: 'Email subscribers', value: data.analytics.subscribers, icon: Users },
    { label: 'Store products', value: data.products.filter((product) => product.active).length, icon: ShoppingBag },
    { label: 'Product revenue', value: new Intl.NumberFormat(undefined, { style: 'currency', currency: data.paymentConfig.currency }).format(data.analytics.earnings), icon: CreditCard },
  ]
  return <>
    <div className="ch-page-heading"><div><span className="ch-eyebrow">YOUR CREATOR BUSINESS</span><h1>Welcome back, {data.profile.displayName.split(' ')[0]}</h1><p>Manage your page, content and digital storefront.</p></div><a className="creator-button creator-button-primary" href={`/${data.profile.handle}`} target="_blank" rel="noreferrer">View your hub <ArrowUpRight size={14} /></a></div>
    <div className="ch-metrics">{metrics.map(({ label, value, icon: Icon }) => <article className="ch-card ch-metric" key={label}><span>{label}<Icon size={16} /></span><strong>{value}</strong></article>)}</div>
    <div className="ch-overview-grid">
      <article className="ch-card ch-plan-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">YOUR PLAN</span><h2>Creator {data.profile.plan === 'pro' ? 'Pro' : 'Free'}</h2></div><BadgeCheck size={21} /></div><p>{data.profile.plan === 'pro' ? 'Your Pro subscription is active.' : 'Creator Pro is configured by the platform operator. Confirm the plan benefits before upgrading.'}</p>{data.profile.plan !== 'pro' && <><button className="creator-button creator-button-primary" type="button" onClick={onUpgrade} disabled={!data.paymentConfig.configured || !data.paymentConfig.proPlanConfigured}>Upgrade with Paystack · {new Intl.NumberFormat(undefined, { style: 'currency', currency: data.paymentConfig.currency }).format(data.paymentConfig.proAmount)}/month</button>{(!data.paymentConfig.configured || !data.paymentConfig.proPlanConfigured) && <small>Paystack keys and the monthly plan must be configured by the administrator.</small>}</>}</article>
      <article className="ch-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">PUBLIC PAGE</span><h2>creatorhub.com/{data.profile.handle}</h2></div><ExternalLink size={17} /></div><p>Your page is {data.profile.isPublic ? 'visible to everyone' : 'currently private'}.</p><a className="ch-inline-link" href={`/${data.profile.handle}`} target="_blank" rel="noreferrer">Preview your page <ArrowUpRight size={14} /></a></article>
    </div>
  </>
}

function ContentSection({ content, form, setForm, onAdd, onToggle, onDelete }: {
  content: ContentItem[]
  form: { title: string; type: string; description: string; url: string }
  setForm: (value: { title: string; type: string; description: string; url: string }) => void
  onAdd: (event: React.FormEvent<HTMLFormElement>) => void
  onToggle: (item: ContentItem) => void
  onDelete: (id: string) => void
}) {
  return <>
    <div className="ch-page-heading"><div><span className="ch-eyebrow">PUBLISHING</span><h1>Your content</h1><p>Create and publish the stories, videos and links on your public hub.</p></div></div>
    <div className="ch-content-grid">
      <form className="ch-card ch-form" onSubmit={onAdd}><div className="ch-panel-title"><div><span className="ch-eyebrow">NEW POST</span><h2>Add content</h2></div><Plus size={18} /></div>
        <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={140} required /></label>
        <label>Type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="blog">Blog</option><option value="video">Video</option><option value="podcast">Podcast</option><option value="link">Link</option></select></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={1000} rows={3} /></label>
        <label>External URL<input type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://" /></label>
        <button className="creator-button creator-button-primary" type="submit">Save draft <Save size={14} /></button>
      </form>
      <article className="ch-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">LIBRARY</span><h2>{content.length} items</h2></div><BookOpen size={18} /></div>
        {!content.length ? <p className="ch-empty">No content yet. Create your first post.</p> : <div className="ch-list">{content.map((item) => <div className="ch-list-row" key={item._id}><span className="ch-list-icon"><FileText size={16} /></span><span className="ch-list-copy"><strong>{item.title}</strong><small>{item.type} · {item.published ? 'Published' : 'Draft'}</small></span><button type="button" className="ch-small-action" onClick={() => onToggle(item)}>{item.published ? 'Unpublish' : 'Publish'}</button><button type="button" className="ch-icon-button" aria-label={`Delete ${item.title}`} onClick={() => onDelete(item._id)}><Trash2 size={15} /></button></div>)}</div>}
      </article>
    </div>
  </>
}

function ProductsSection({ products, form, setForm, onAdd, onDelete }: {
  products: Product[]
  form: ProductForm
  setForm: (value: ProductForm) => void
  onAdd: (event: React.FormEvent<HTMLFormElement>) => void
  onDelete: (id: string) => void
}) {
  return <>
    <div className="ch-page-heading"><div><span className="ch-eyebrow">DIGITAL STOREFRONT</span><h1>Your products</h1><p>Add products to your public page and accept secure Paystack payments.</p></div></div>
    <div className="ch-content-grid">
      <form className="ch-card ch-form" onSubmit={onAdd}><div className="ch-panel-title"><div><span className="ch-eyebrow">NEW LISTING</span><h2>Add a digital product</h2></div><Plus size={18} /></div>
        <label>Product name<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={120} required /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={1000} rows={3} required /></label>
        <div className="ch-form-row"><label>Price<input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label>Currency<input value={form.currency} readOnly aria-describedby="product-currency-note" maxLength={3} required /><small id="product-currency-note">Payments use the platform currency configured by the administrator.</small></label></div>
        <label>Product image URL<input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://" /></label>
        <label>Download or delivery URL<input type="url" value={form.downloadUrl} onChange={(event) => setForm({ ...form, downloadUrl: event.target.value })} placeholder="https://" required /></label>
        <button className="creator-button creator-button-primary" type="submit">Add product <ShoppingBag size={14} /></button>
      </form>
      <article className="ch-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">YOUR STORE</span><h2>{products.length} products</h2></div><ShoppingBag size={18} /></div>
        {!products.length ? <p className="ch-empty">Your store is empty.</p> : <div className="ch-list">{products.map((product) => <div className="ch-list-row" key={product._id}><span className="ch-list-icon"><ShoppingBag size={16} /></span><span className="ch-list-copy"><strong>{product.title}</strong><small>{product.currency} {product.price.toFixed(2)} · {product.active ? 'Listed' : 'Hidden'}</small></span>{product.active && <button type="button" className="ch-icon-button" aria-label={`Remove ${product.title}`} onClick={() => onDelete(product._id)}><Trash2 size={15} /></button>}</div>)}</div>}
      </article>
    </div>
  </>
}

function AudienceSection({ subscribers }: { subscribers: { email: string; createdAt: string }[] }) {
  return <>
    <div className="ch-page-heading"><div><span className="ch-eyebrow">YOUR COMMUNITY</span><h1>Email audience</h1><p>People who subscribed to your public creator page.</p></div></div>
    <article className="ch-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">SUBSCRIBERS</span><h2>{subscribers.length} readers</h2></div><Users size={18} /></div>
      {!subscribers.length ? <p className="ch-empty">Your subscriber list is ready when your audience joins.</p> : <div className="ch-table-wrap"><table className="ch-table"><thead><tr><th>Email</th><th>Subscribed</th></tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber.email}><td>{subscriber.email}</td><td>{new Date(subscriber.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
    </article>
  </>
}

function SettingsSection({ profile, paymentConfig, saving, onSave, onUpgrade }: { profile: Profile; paymentConfig: PaymentConfig; saving: boolean; onSave: (event: React.FormEvent<HTMLFormElement>) => void; onUpgrade: () => void }) {
  return <>
    <div className="ch-page-heading"><div><span className="ch-eyebrow">ACCOUNT</span><h1>Page settings</h1><p>Update your public profile and page visibility.</p></div></div>
    <div className="ch-content-grid">
      <form className="ch-card ch-form" onSubmit={onSave}><div className="ch-panel-title"><div><span className="ch-eyebrow">YOUR PROFILE</span><h2>Public page</h2></div><Settings size={18} /></div>
        <label>Creator name<input name="displayName" defaultValue={profile.displayName} maxLength={100} required /></label>
        <label>Tagline<input name="tagline" defaultValue={profile.tagline} maxLength={120} /></label>
        <label>Bio<textarea name="bio" defaultValue={profile.bio} rows={4} maxLength={500} /></label>
        <label>Avatar image URL<input name="avatarUrl" type="url" defaultValue={profile.avatarUrl} placeholder="https://" /></label>
        <label>Public links (JSON)<textarea name="links" defaultValue={JSON.stringify(profile.links, null, 2)} rows={5} /></label>
        <label className="ch-checkbox"><input type="checkbox" name="isPublic" defaultChecked={profile.isPublic} /> Make my public page visible</label>
        <button className="creator-button creator-button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'} <Save size={14} /></button>
      </form>
      <article className="ch-card"><div className="ch-panel-title"><div><span className="ch-eyebrow">MEMBERSHIP</span><h2>Creator {profile.plan === 'pro' ? 'Pro' : 'Free'}</h2></div><CreditCard size={18} /></div><p>Creator Pro is {new Intl.NumberFormat(undefined, { style: 'currency', currency: paymentConfig.currency }).format(paymentConfig.proAmount)}/month. Confirm included benefits with the platform operator before subscribing.</p>{profile.plan !== 'pro' && <button className="creator-button creator-button-primary" type="button" disabled={!paymentConfig.configured || !paymentConfig.proPlanConfigured} onClick={onUpgrade}>Continue to Paystack <ArrowUpRight size={14} /></button>}</article>
    </div>
  </>
}
