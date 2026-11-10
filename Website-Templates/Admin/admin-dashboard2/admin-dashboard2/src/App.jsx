import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  Cpu,
  CreditCard,
  Database,
  FileText,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Upload,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const navigation = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Consumption', href: '/consumption', icon: BarChart3 },
  { label: 'Playground', href: '/playground', icon: Workflow },
  { label: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { label: 'Audit Logs', href: '/audit', icon: ShieldCheck, badge: 'LIVE' },
  { label: 'API Keys', href: '/api-keys', icon: KeyRound },
  { label: 'Workspaces', href: '/workspaces', icon: Users },
]

const pageTitles = {
  '/': ['AI Overview', 'Your models, spend, and platform activity at a glance.'],
  '/consumption': ['Consumption', 'Understand usage, latency, and spend across your models.'],
  '/playground': ['Prompt Playground', 'Build, compare, and evaluate model prompts.'],
  '/knowledge': ['Knowledge Base', 'Manage the documents connected to your AI agents.'],
  '/audit': ['Audit Logs', 'Review model requests and trace events across your workspace.'],
  '/api-keys': ['API Keys', 'Manage credentials used by your applications.'],
  '/workspaces': ['Workspaces', 'Organize your agents, people, and data.'],
  '/billing': ['Billing & plans', 'Review your usage allowance and plan details.'],
  '/checkout': ['Plan checkout', 'Review a plan change before connecting payment.'],
}

const models = [
  { name: 'GPT-4o', provider: 'OpenAI', requests: '8,420', tokens: '6.8M', cost: '$128.40', color: 'cyan', share: 38 },
  { name: 'Claude 3.5', provider: 'Anthropic', requests: '5,180', tokens: '4.1M', cost: '$92.20', color: 'violet', share: 29 },
  { name: 'Gemini 1.5 Pro', provider: 'Google', requests: '3,620', tokens: '3.2M', cost: '$64.80', color: 'blue', share: 21 },
  { name: 'Llama 3.1', provider: 'Meta', requests: '2,290', tokens: '1.9M', cost: '$28.90', color: 'green', share: 12 },
]

const documents = [
  { name: 'pricing-guide-2025.pdf', chunks: '1,284', store: 'Pinecone', status: 'Indexed', updated: 'Today, 9:42 AM' },
  { name: 'support-handbook.pdf', chunks: '642', store: 'Qdrant', status: 'Indexed', updated: 'Today, 8:16 AM' },
  { name: 'product-faq-v3.pdf', chunks: '3,098', store: 'Pinecone', status: 'Embedding', updated: 'Yesterday' },
  { name: 'onboarding-checklist.pdf', chunks: '—', store: 'Pinecone', status: 'Failed', updated: 'Yesterday' },
]

const auditEvents = [
  { time: '10:24:31', model: 'gpt-4o', prompt: 'Customer support answer', tokens: '1,248', cost: '$0.0186', latency: '412 ms', status: '200 OK', trace: 'tr_8f12c9' },
  { time: '10:23:08', model: 'claude-3.5', prompt: 'Summarize return policy', tokens: '2,890', cost: '$0.0241', latency: '684 ms', status: '200 OK', trace: 'tr_a73b20' },
  { time: '10:21:55', model: 'gpt-4o', prompt: 'Classify support ticket', tokens: '842', cost: '$0.0128', latency: '328 ms', status: '200 OK', trace: 'tr_41cdaa' },
  { time: '10:19:12', model: 'gemini-1.5-pro', prompt: 'Extract order details', tokens: '520', cost: '$0.0061', latency: '241 ms', status: '200 OK', trace: 'tr_94d01b' },
  { time: '10:16:42', model: 'gpt-4o', prompt: 'Product recommendation', tokens: '1,908', cost: '$0.0284', latency: '506 ms', status: '429 Rate limit', trace: 'tr_273fa1' },
]

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  )
}

function PanelTitle({ icon: Icon, label, detail, action }) {
  return (
    <div className="panel-title">
      <div className="panel-title-main">
        {Icon && <span className="panel-icon"><Icon size={15} /></span>}
        <h2>{label}</h2>
        {detail && <span className="panel-detail">{detail}</span>}
      </div>
      {action}
    </div>
  )
}

function StatCard({ label, value, change, note, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone || ''}`}><Icon size={15} /></span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span className="stat-change"><ArrowUpRight size={12} /> {change}</span>
        <span>{note}</span>
      </div>
    </article>
  )
}

function UsageChart({ compact = false }) {
  return (
    <div className={compact ? 'chart-wrap chart-wrap-compact' : 'chart-wrap'}>
      <div className="chart-legend">
        <span><i className="legend-dot cyan" /> GPT-4o</span>
        <span><i className="legend-dot violet" /> Claude 3.5</span>
        <span><i className="legend-dot blue" /> Gemini 1.5 Pro</span>
      </div>
      <svg className="usage-chart" viewBox="0 0 640 220" role="img" aria-label="Model token consumption trending upward over the last 24 hours">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#27d4e5" stopOpacity=".18" />
            <stop offset="100%" stopColor="#27d4e5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 75, 120, 165, 205].map((y) => <line key={y} x1="36" x2="630" y1={y} y2={y} className="chart-grid" />)}
        <path d="M36 177 L75 163 L108 169 L143 150 L176 157 L210 137 L244 145 L278 125 L312 133 L346 111 L381 119 L416 99 L450 108 L486 83 L520 91 L555 67 L590 72 L628 54 L628 205 L36 205 Z" fill="url(#chartFill)" />
        <polyline points="36,177 75,163 108,169 143,150 176,157 210,137 244,145 278,125 312,133 346,111 381,119 416,99 450,108 486,83 520,91 555,67 590,72 628,54" className="chart-line chart-line-cyan" />
        <polyline points="36,185 75,178 108,181 143,169 176,174 210,163 244,168 278,151 312,158 346,144 381,148 416,136 450,140 486,122 520,127 555,111 590,115 628,101" className="chart-line chart-line-violet" />
        <polyline points="36,193 75,188 108,190 143,183 176,185 210,176 244,180 278,171 312,174 346,164 381,168 416,157 450,161 486,148 520,153 555,139 590,144 628,130" className="chart-line chart-line-blue" />
        <text x="36" y="218" className="chart-label">12 AM</text>
        <text x="179" y="218" className="chart-label">6 AM</text>
        <text x="326" y="218" className="chart-label">12 PM</text>
        <text x="476" y="218" className="chart-label">6 PM</text>
        <text x="590" y="218" className="chart-label">Now</text>
      </svg>
    </div>
  )
}

function ModelBars() {
  const items = [
    { name: 'Maya', amount: '$42', height: 91 },
    { name: 'Devon', amount: '$36', height: 76 },
    { name: 'Priya', amount: '$29', height: 61 },
    { name: 'Leo', amount: '$24', height: 49 },
    { name: 'Sam', amount: '$16', height: 34 },
    { name: 'Jo', amount: '$11', height: 24 },
  ]
  return (
    <div className="bar-chart">
      {items.map((item, index) => (
        <div className="bar-column" key={item.name}>
          <span className="bar-amount">{item.amount}</span>
          <div className="bar-track"><span className={index === 0 ? 'bar-fill bar-fill-active' : 'bar-fill'} style={{ height: `${item.height}%` }} /></div>
          <span className="bar-label">{item.name}</span>
        </div>
      ))}
    </div>
  )
}

function ModelTable() {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Model</th><th>Requests</th><th>Tokens used</th><th>Cost</th><th>Usage</th></tr></thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.name}>
              <td><span className={`model-dot ${model.color}`} />{model.name}<small>{model.provider}</small></td>
              <td>{model.requests}</td><td>{model.tokens}</td><td>{model.cost}</td>
              <td><div className="table-progress"><span className={model.color} style={{ width: `${model.share}%` }} /></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KnowledgeTable({ limit, onToast }) {
  const visibleDocuments = limit ? documents.slice(0, limit) : documents
  return (
    <div className="table-scroll">
      <table className="data-table document-table">
        <thead><tr><th>Document</th><th>Chunks</th><th>Vector store</th><th>Status</th>{!limit && <th>Updated</th>}<th /></tr></thead>
        <tbody>
          {visibleDocuments.map((document) => (
            <tr key={document.name}>
              <td><span className="file-icon"><FileText size={14} /></span>{document.name}</td>
              <td>{document.chunks}</td><td><span className="store-pill">{document.store}</span></td>
              <td><span className={`status-pill status-${document.status.toLowerCase()}`}><i />{document.status}</span></td>
              {!limit && <td className="muted-cell">{document.updated}</td>}
              <td><button className="icon-button table-more" aria-label={`More options for ${document.name}`} onClick={() => onToast?.(`${document.name} · ${document.status}`)}><MoreHorizontal size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AuditTable({ detailed = false, events = auditEvents }) {
  return (
    <div className="table-scroll">
      <table className="data-table audit-table">
        <thead><tr><th>Timestamp</th><th>Model used</th><th>Prompt</th><th>Tokens</th><th>Cost</th><th>Response time</th><th>Status</th><th>Trace</th></tr></thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.trace}>
              <td className="mono">{event.time}</td><td>{event.model}</td><td>{event.prompt}</td><td>{event.tokens}</td>
              <td>{event.cost}</td><td>{event.latency}</td>
              <td><span className={event.status.startsWith('200') ? 'status-pill status-indexed' : 'status-pill status-failed'}><i />{event.status}</span></td>
              <td><details className="trace-details"><summary aria-label={`Show trace ${event.trace}`}><ChevronDown size={14} /></summary><span>{detailed ? event.trace : `Request ID: ${event.trace}`}</span></details></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OverviewPage({ onNavigate, onToast }) {
  const [selectedPrompt, setSelectedPrompt] = useState('Customer Support Agent v2')
  const prompts = ['Customer Support Agent v2', 'Code Reviewer Pro', 'SQL Generator v1', 'Onboarding Concierge', 'Legal Summarizer']
  return (
    <>
      <PageHeading eyebrow="WORKSPACE / PRODUCTION" title="Consumption & cost analytics" description="A clear view of your model usage over the last 24 hours." action={<a className="button button-outline" href="/consumption">View report <ArrowRight size={14} /></a>} />
      <section className="stat-grid" aria-label="Workspace metrics">
        <StatCard label="Total API spend" value="$240.50" change="12.4%" note="vs last 7 days" icon={CircleDollarSign} tone="cyan" />
        <StatCard label="Tokens used" value="14.2M" change="8.1%" note="429K tokens" icon={Zap} tone="violet" />
        <StatCard label="Avg. latency" value="320ms" change="6.8%" note="p95 610ms" icon={Gauge} tone="blue" />
        <StatCard label="Active agents" value="12" change="2 new" note="this week" icon={BrainCircuit} tone="green" />
      </section>

      <section className="analytics-grid">
        <article className="panel consumption-panel">
          <PanelTitle icon={Activity} label="Daily token consumption by model" detail="Last 24 hours" action={<button className="select-button" onClick={() => onNavigate('/consumption')}>Today <ChevronDown size={13} /></button>} />
          <UsageChart />
        </article>
        <article className="panel breakdown-panel">
          <PanelTitle icon={Users} label="Cost breakdown per user" detail="This month" />
          <ModelBars />
        </article>
      </section>

      <section className="panel playground-preview">
        <PanelTitle icon={Sparkles} label="Prompt & model playground" detail={<span className="status-pill status-indexed"><i /> 3 deployed</span>} action={<a className="text-link" href="/playground">Open playground <ArrowRight size={13} /></a>} />
        <div className="playground-preview-grid">
          <div className="prompt-list">
            <label className="search-field prompt-search"><Search size={14} /><input aria-label="Search prompts" placeholder="Search prompts..." /></label>
            {prompts.map((prompt, index) => (
              <button key={prompt} className={`prompt-item ${selectedPrompt === prompt ? 'is-selected' : ''}`} onClick={() => setSelectedPrompt(prompt)}>
                <span className="prompt-name">{prompt}</span><span className="prompt-meta">{index === 0 ? 'prod' : 'draft'} · updated {index + 2}h ago</span>
              </button>
            ))}
            <button className="new-prompt-button" onClick={() => onNavigate('/playground')}><Plus size={13} /> New system prompt</button>
          </div>
          <div className="prompt-preview">
            <div className="prompt-preview-heading"><div><strong>{selectedPrompt}</strong><span>gpt-4o · <span className="text-success">good</span></span></div><span className="preview-time">updated 2h ago</span></div>
            <div className="prompt-code">You are a helpful support agent. Be friendly and concise.<br /><br />Use only the information in the provided context. If you don't know an answer, ask a clarifying question instead of guessing.</div>
            <div className="prompt-config"><span>Primary model<strong>gpt-4o · 2024-08-06</strong></span><span>Fallback<strong>claude-3-5-sonnet</strong></span></div>
            <div className="prompt-actions"><a className="button button-primary" href="/playground">Open in playground <ArrowRight size={13} /></a><button className="button button-quiet" onClick={() => onNavigate('/audit')}>View evaluations</button></div>
          </div>
          <aside className="parameter-panel">
            <strong>Parameters</strong>
            <label>Temperature <span>0.7</span><input type="range" min="0" max="1" defaultValue="70" /></label>
            <label>Top P <span>1.0</span><input type="range" min="0" max="100" defaultValue="100" /></label>
            <label>Max tokens <span>4096</span><input type="range" min="0" max="100" defaultValue="65" /></label>
            <div className="stream-toggle"><span>Streaming</span><span className="text-success">ON</span></div>
            <div className="stream-toggle"><span>JSON mode</span><span className="text-success">ENABLED</span></div>
          </aside>
        </div>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <PanelTitle icon={Database} label="Knowledge base" detail="4 documents" action={<a className="text-link" href="/knowledge">View all <ArrowRight size={13} /></a>} />
          <KnowledgeTable limit={2} onToast={onToast} />
        </article>
        <article className="panel">
          <PanelTitle icon={ShieldCheck} label="Recent audit events" detail="Live" action={<a className="text-link" href="/audit">View logs <ArrowRight size={13} /></a>} />
          <div className="recent-event-list">
            {auditEvents.slice(0, 3).map((event) => <div className="recent-event" key={event.trace}><span className="event-dot" /><span><strong>{event.model}</strong><small>{event.prompt}</small></span><time>{event.time}</time></div>)}
          </div>
        </article>
      </section>
    </>
  )
}

function ConsumptionPage() {
  return (
    <>
      <PageHeading eyebrow="ANALYTICS" title="Consumption" description="Track token volume, model mix, and spend for your workspace." action={<button className="button button-outline" onClick={() => window.print()}><ArrowDownRight size={14} /> Export report</button>} />
      <section className="stat-grid">
        <StatCard label="Total spend" value="$240.50" change="12.4%" note="vs last period" icon={CircleDollarSign} tone="cyan" />
        <StatCard label="Input tokens" value="9.84M" change="5.2%" note="vs last period" icon={ArrowDownRight} tone="violet" />
        <StatCard label="Output tokens" value="4.36M" change="9.7%" note="vs last period" icon={ArrowUpRight} tone="blue" />
        <StatCard label="Requests" value="19,510" change="7.3%" note="vs last period" icon={Activity} tone="green" />
      </section>
      <article className="panel large-chart-panel"><PanelTitle icon={BarChart3} label="Token consumption" detail="Last 24 hours" action={<button className="select-button">Last 24 hours <ChevronDown size={13} /></button>} /><UsageChart /></article>
      <article className="panel"><PanelTitle icon={Cpu} label="Usage by model" detail="Current billing period" /><ModelTable /></article>
      <div className="notice-card"><CircleDollarSign size={17} /><span><strong>Daily spend cap: $50.00</strong><small>Current daily spend is $18.42. Your workspace will notify admins at 80% of the limit.</small></span><a href="/billing" className="text-link">Manage billing <ArrowRight size={13} /></a></div>
    </>
  )
}

function PlaygroundPage({ onToast }) {
  const [prompt, setPrompt] = useState('You are a helpful customer support assistant. Answer clearly using the provided context.')
  const [model, setModel] = useState('GPT-4o')
  const [previewVisible, setPreviewVisible] = useState(false)
  const [temperature, setTemperature] = useState('0.7')
  return (
    <>
      <PageHeading eyebrow="BUILD" title="Prompt playground" description="Experiment with prompts and model settings before deploying an agent." action={<button className="button button-outline" onClick={() => onToast('Prompt saved to this browser preview.') }><Check size={14} /> Save prompt</button>} />
      <div className="playground-page-grid">
        <aside className="panel saved-prompts">
          <PanelTitle icon={FileText} label="Saved prompts" action={<button className="icon-button" aria-label="Add prompt" onClick={() => { setPrompt(''); setPreviewVisible(false) }}><Plus size={16} /></button>} />
          {['Customer Support Agent v2', 'Code Reviewer Pro', 'SQL Generator v1', 'Onboarding Concierge'].map((name, index) => <button key={name} className={`prompt-item ${index === 0 ? 'is-selected' : ''}`} onClick={() => { setPrompt(`You are ${name}. Be concise and use the provided context.`); setPreviewVisible(false) }}><span className="prompt-name">{name}</span><span className="prompt-meta">{index === 0 ? 'Production' : 'Draft'} · gpt-4o</span></button>)}
        </aside>
        <section className="panel prompt-editor">
          <PanelTitle icon={Terminal} label="System prompt" detail="Draft" action={          <button className="icon-button" aria-label="Copy prompt" onClick={async () => {
            try {
              await navigator.clipboard.writeText(prompt)
              onToast('Prompt copied to clipboard.')
            } catch {
              onToast('Clipboard access is unavailable. Select the prompt text to copy it.')
            }
          }}><Copy size={15} /></button>} />
          <label className="field-label" htmlFor="model-select">Model</label>
          <div className="select-wrap"><select id="model-select" value={model} onChange={(event) => setModel(event.target.value)}><option>GPT-4o</option><option>Claude 3.5 Sonnet</option><option>Gemini 1.5 Pro</option><option>Llama 3.1</option></select><ChevronDown size={14} /></div>
          <label className="field-label" htmlFor="prompt-text">Instructions</label>
          <textarea id="prompt-text" className="prompt-textarea" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows="9" />
          <div className="playground-settings">
            <label htmlFor="temperature">Temperature <span>{temperature}</span><input id="temperature" type="range" min="0" max="1" step="0.1" value={temperature} onChange={(event) => setTemperature(event.target.value)} /></label>
            <label htmlFor="max-tokens">Max output tokens <span>2,048</span><input id="max-tokens" type="range" min="256" max="4096" defaultValue="2048" /></label>
          </div>
          <div className="editor-actions"><button className="button button-primary" onClick={() => { setPreviewVisible(true); onToast('Request preview ready. Connect a model provider to run a live evaluation.') }}><Zap size={14} /> Preview request</button><button className="button button-quiet" onClick={() => { setPrompt(''); setPreviewVisible(false) }}>Clear prompt</button></div>
          {previewVisible && <div className="preview-output" role="status"><span className="status-pill status-embedding"><i /> Request preview</span><p>This is a local preview only. Connect a model provider to run <strong>{model}</strong> and return a live response.</p></div>}
        </section>
        <aside className="panel context-panel"><PanelTitle icon={Settings2} label="Request context" /><p className="field-hint">Add sample input to see how your prompt will be sent.</p><label className="field-label" htmlFor="context-text">User message</label><textarea id="context-text" className="context-textarea" rows="7" placeholder="How can I return an item I ordered last week?" /><div className="context-summary"><span>Provider status</span><strong><i className="offline-dot" /> Not connected</strong></div><a href="/api-keys" className="button button-outline full-button">Configure API keys <ArrowRight size={14} /></a></aside>
      </div>
    </>
  )
}

function KnowledgePage({ onToast }) {
  const [fileNames, setFileNames] = useState([])
  return (
    <>
      <PageHeading eyebrow="DATA" title="Knowledge base" description="Upload and monitor the documents available to your AI agents." action={<label className="button button-primary upload-button"><Upload size={14} /> Upload documents<input type="file" accept=".pdf,.txt,.md,.docx,.csv" multiple onChange={(event) => { const files = Array.from(event.target.files || []); setFileNames(files.map((file) => file.name)); if (files.length) onToast(`${files.length} file${files.length === 1 ? '' : 's'} selected for preview. Connect storage to index documents.`) }} /></label>} />
      {fileNames.length > 0 && <div className="notice-card"><Check size={16} /><span><strong>Files selected for preview</strong><small>{fileNames.join(', ')}</small></span><button className="icon-button" aria-label="Clear selected files" onClick={() => setFileNames([])}><X size={15} /></button></div>}
      <div className="knowledge-layout">
        <section className="panel">
          <PanelTitle icon={Database} label="Documents" detail={`${documents.length} files`} action={<button className="select-button"><span className="status-dot" /> All statuses <ChevronDown size={13} /></button>} />
          <KnowledgeTable onToast={onToast} />
          <div className="table-footer"><span>Showing 1–4 of 4 documents</span><button className="text-link" onClick={() => onToast('All available documents are shown.')}>View all <ArrowRight size={13} /></button></div>
        </section>
        <aside className="panel upload-panel">
          <div className="upload-illustration"><Upload size={21} /></div>
          <h2>Drop files here</h2>
          <p>PDF, TXT, CSV, DOCX · up to 25 MB</p>
          <label className="button button-outline upload-button">Browse files<input type="file" accept=".pdf,.txt,.md,.docx,.csv" multiple onChange={(event) => { const files = Array.from(event.target.files || []); setFileNames(files.map((file) => file.name)); if (files.length) onToast(`${files.length} file${files.length === 1 ? '' : 's'} selected for preview. Connect storage to index documents.`) }} /></label>
          <div className="provider-tags"><span>Pinecone</span><span>Qdrant</span><span>pgvector</span></div>
          <small className="muted-cell">Uploads are preview-only until a storage provider is configured.</small>
        </aside>
      </div>
      <section className="stat-grid knowledge-stats"><StatCard label="Indexed documents" value="3" change="1" note="processing" icon={FileText} tone="cyan" /><StatCard label="Total chunks" value="5,024" change="8.4%" note="this month" icon={Database} tone="violet" /><StatCard label="Storage used" value="128 MB" change="14 MB" note="this month" icon={Gauge} tone="blue" /><StatCard label="Last sync" value="9:42 AM" change="Healthy" note="today" icon={Clock3} tone="green" /></section>
    </>
  )
}

function AuditPage() {
  const [query, setQuery] = useState('')
  const filteredEvents = auditEvents.filter((event) => `${event.model} ${event.prompt} ${event.status} ${event.trace}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <PageHeading eyebrow="GOVERNANCE" title="Audit logs" description="Trace requests from prompt to response with searchable event records." action={<button className="button button-primary" onClick={() => window.print()}><ArrowDownRight size={14} /> Export logs</button>} />
      <section className="stat-grid">
        <StatCard label="Requests today" value="18,420" change="7.2%" note="vs yesterday" icon={Activity} tone="cyan" />
        <StatCard label="Successful" value="99.2%" change="0.4%" note="vs yesterday" icon={ShieldCheck} tone="green" />
        <StatCard label="Avg. response" value="412ms" change="6.1%" note="vs yesterday" icon={Clock3} tone="blue" />
        <StatCard label="Policy blocks" value="12" change="3 new" note="today" icon={Check} tone="violet" />
      </section>
      <section className="panel audit-panel">
        <PanelTitle icon={ShieldCheck} label="Real-time AI audit & trace logs" detail={<span className="status-pill status-indexed"><i /> Streaming · 24h</span>} action={<div className="table-actions"><label className="search-field table-search"><Search size={14} /><input placeholder="Filter events..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="select-button">All models <ChevronDown size={13} /></button><button className="select-button">24 hours <ChevronDown size={13} /></button></div>} />
        <AuditTable detailed events={filteredEvents} />
        {filteredEvents.length === 0 && <p className="empty-state">No events match “{query}”.</p>}
      </section>
      <section className="panel audit-detail"><PanelTitle icon={Terminal} label="Trace preview" detail="Select a row to inspect the full request" /><div className="trace-preview-grid"><div><span>INPUT PROMPT · gpt-4o</span><pre>{'{"role":"user","content":"Where can I find my order?"}'}</pre></div><div><span>MODEL RESPONSE · 412 ms</span><pre>{'{"role":"assistant","content":"You can find order status in your account under Orders."}'}</pre></div></div></section>
    </>
  )
}

function ApiKeysPage({ onToast }) {
  const [showKey, setShowKey] = useState(false)
  return (
    <>
      <PageHeading eyebrow="DEVELOPERS" title="API keys" description="Use workspace keys to authenticate requests from your applications." action={<button className="button button-primary" onClick={() => onToast('Key creation requires a connected backend. No key was created.')}><Plus size={15} /> Create API key</button>} />
      <div className="notice-card notice-warning"><ShieldCheck size={17} /><span><strong>Keep your keys secure</strong><small>Never share secret keys publicly or commit them to source control. Rotate exposed credentials immediately.</small></span></div>
      <section className="panel keys-panel">
        <PanelTitle icon={KeyRound} label="Workspace keys" detail="2 keys" />
        <div className="key-row"><span className="key-kind-icon"><Terminal size={16} /></span><span className="key-info"><strong>Production server</strong><small>Created Oct 12, 2025 · Last used 2 minutes ago</small><code>{showKey ? 'sk_demo_not-a-real-key_••••••' : 'sk_demo_••••••••••••••••••••'}</code></span><span className="key-status"><i /> Active</span><button className="button button-outline" onClick={() => setShowKey(!showKey)}>{showKey ? 'Hide' : 'Reveal demo key'}</button><button className="icon-button" aria-label="Copy demo key" onClick={() => onToast('Demo key shown here is not a real credential.')}><Copy size={15} /></button></div>
        <div className="key-row"><span className="key-kind-icon"><Terminal size={16} /></span><span className="key-info"><strong>Development</strong><small>Created Sep 08, 2025 · Last used 3 days ago</small><code>sk_demo_••••••••••••••••••••</code></span><span className="key-status"><i /> Active</span><button className="button button-outline" onClick={() => onToast('Key rotation requires a connected backend. No key was changed.')}>Rotate key</button><button className="icon-button" aria-label="More options for Development key" onClick={() => onToast('Key actions are available when a backend is connected.')}><MoreHorizontal size={16} /></button></div>
      </section>
      <article className="panel key-help"><div className="help-icon"><KeyRound size={18} /></div><div><h2>Need to connect an API provider?</h2><p>Configure provider credentials in your deployment environment. This preview does not store or reveal real secrets.</p></div><a href="/playground" className="button button-outline">Open playground <ArrowRight size={14} /></a></article>
    </>
  )
}

function WorkspacesPage({ onToast }) {
  const workspaceItems = [
    { name: 'Production', description: 'Live agents and customer-facing apps', initial: 'P', members: '8 members', agents: '12 agents', color: 'cyan' },
    { name: 'Staging', description: 'Pre-release testing and QA', initial: 'S', members: '4 members', agents: '5 agents', color: 'violet' },
    { name: 'Research', description: 'Experiments and model evaluations', initial: 'R', members: '3 members', agents: '2 agents', color: 'blue' },
  ]
  return (
    <>
      <PageHeading eyebrow="ORGANIZATION" title="Workspaces" description="Keep projects and access organized across your team." action={<button className="button button-primary" onClick={() => onToast('Workspace creation is ready to connect to your organization service.')}><Plus size={15} /> New workspace</button>} />
      <div className="workspace-grid">
        {workspaceItems.map((workspace, index) => <article className="panel workspace-card" key={workspace.name}><div className={`workspace-avatar ${workspace.color}`}>{workspace.initial}</div><div className="workspace-card-title"><div><h2>{workspace.name}</h2>{index === 0 && <span className="status-pill status-indexed"><i /> Current</span>}</div><button className="icon-button" aria-label={`More options for ${workspace.name}`} onClick={() => onToast(`${workspace.name} workspace options are available to workspace admins.`)}><MoreHorizontal size={17} /></button></div><p>{workspace.description}</p><div className="workspace-card-meta"><span><Users size={14} /> {workspace.members}</span><span><BrainCircuit size={14} /> {workspace.agents}</span></div><a href={index === 0 ? '/' : '/workspaces'} className="text-link">{index === 0 ? 'Open workspace' : 'View workspace'} <ArrowRight size={13} /></a></article>)}
        <button className="new-workspace-card" onClick={() => onToast('Workspace creation is ready to connect to your organization service.')}><span><Plus size={18} /></span><strong>Create a workspace</strong><small>Start a new project with its own agents and data.</small></button>
      </div>
      <section className="panel member-panel"><PanelTitle icon={Users} label="Team members" detail="8 people" action={<button className="text-link" onClick={() => onToast('Invitations require a connected organization service.')}>Invite member <Plus size={13} /></button>} /><div className="member-list">{[['Maya Chen','maya@acme.ai','Owner','MC'],['Devon Reed','devon@acme.ai','Admin','DR'],['Priya Shah','priya@acme.ai','Developer','PS'],['Leo Martin','leo@acme.ai','Viewer','LM']].map(([name,email,role,initials]) => <div className="member-row" key={email}><span className="member-avatar">{initials}</span><span className="member-info"><strong>{name}</strong><small>{email}</small></span><span className="role-pill">{role}</span></div>)}</div></section>
    </>
  )
}

function BillingPage() {
  return (
    <>
      <PageHeading eyebrow="ACCOUNT" title="Billing & plans" description="Review plan limits and estimated usage for this workspace." action={<button className="button button-outline" onClick={() => window.print()}><FileText size={14} /> Download usage report</button>} />
      <section className="billing-overview-grid">
        <article className="panel plan-card"><div className="plan-card-top"><span className="plan-icon"><Sparkles size={18} /></span><span className="status-pill status-indexed"><i /> Active plan</span></div><p className="eyebrow">CURRENT PLAN</p><h2>Team</h2><p className="plan-description">Usage-based AI platform for teams building with models.</p><div className="plan-price"><strong>$49</strong><span>/ month base<br />plus model usage</span></div><a href="/checkout?plan=scale" className="button button-primary full-button">Review plan options <ArrowRight size={14} /></a></article>
        <article className="panel spend-card"><PanelTitle icon={CircleDollarSign} label="Monthly spend" detail="November 2026" /><div className="spend-total">$240.50 <span>of $500.00 soft limit</span></div><div className="spend-progress"><span style={{ width: '48%' }} /></div><div className="spend-foot"><span>48% of soft limit used</span><span>$259.50 remaining</span></div><div className="billing-stats"><span>Estimated total<strong>$318.20</strong></span><span>Next reset<strong>Dec 1, 2026</strong></span></div></article>
      </section>
      <section className="panel"><PanelTitle icon={FileText} label="Recent invoices" detail="No payment provider connected" /><div className="empty-billing"><CreditCard size={22} /><div><strong>Invoices will appear here</strong><p>Connect a payment provider to enable billing, payment methods, and invoice history.</p></div></div></section>
      <div className="notice-card notice-warning"><ShieldCheck size={17} /><span><strong>Payment processing is not configured</strong><small>This dashboard preview does not collect card details or charge payments. Connect a payment provider and server-side checkout before enabling plan purchases.</small></span><a className="text-link" href="/checkout">Checkout setup <ArrowRight size={13} /></a></div>
    </>
  )
}

function CheckoutPage() {
  return (
    <>
      <PageHeading eyebrow="BILLING / CHECKOUT" title="Review plan options" description="Check the plan details before you connect payment processing." />
      <section className="checkout-layout">
        <article className="panel checkout-card"><div className="plan-card-top"><span className="plan-icon"><Sparkles size={18} /></span><span className="status-pill status-embedding"><i /> Preview only</span></div><h2>Scale plan</h2><p>For teams running production AI workflows with higher usage needs.</p><div className="checkout-line"><span>Monthly platform fee</span><strong>$149.00</strong></div><div className="checkout-line"><span>Model usage</span><strong>Usage-based</strong></div><div className="checkout-line checkout-total"><span>Due today</span><strong>$149.00</strong></div><p className="checkout-note">Model usage is billed separately. Final totals depend on your provider rates and usage.</p><button className="button button-disabled full-button" disabled><CreditCard size={15} /> Payment provider not connected</button><a href="/billing" className="back-to-billing">Back to billing</a></article>
        <aside className="panel checkout-notice"><ShieldCheck size={22} /><h2>Checkout is not enabled yet</h2><p>No payment details are requested or stored in this preview. A secure server-side payment provider must be configured before this plan can be purchased.</p><ul><li><Check size={14} /> No card data collected</li><li><Check size={14} /> No payment attempted</li><li><Check size={14} /> No plan changes made</li></ul></aside>
      </section>
    </>
  )
}

function NotFoundPage() {
  return <section className="panel not-found"><div className="not-found-icon"><Search size={22} /></div><h1>Page not found</h1><p>This dashboard page does not exist.</p><a className="button button-primary" href="/">Back to overview <ArrowRight size={14} /></a></section>
}

function NewAgentDialog({ onClose, onToast }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="dialog panel" role="dialog" aria-modal="true" aria-labelledby="new-agent-title">
        <div className="dialog-heading"><div><span className="dialog-icon"><BrainCircuit size={18} /></span><h2 id="new-agent-title">Create an agent</h2></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={17} /></button></div>
        <form onSubmit={(event) => { event.preventDefault(); onClose(); onToast('Agent draft saved in this preview. Connect a backend to deploy it.') }}>
          <label className="field-label" htmlFor="agent-name">Agent name</label><input id="agent-name" className="text-input" placeholder="e.g. Customer support assistant" required />
          <label className="field-label" htmlFor="agent-model">Primary model</label><select id="agent-model" className="text-input"><option>GPT-4o</option><option>Claude 3.5 Sonnet</option><option>Gemini 1.5 Pro</option></select>
          <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary"><Plus size={14} /> Create draft</button></div>
        </form>
      </section>
    </div>
  )
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/+$/, '') || '/')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [newAgentOpen, setNewAgentOpen] = useState(false)
  const title = pageTitles[path]
  const activeItem = path === '/checkout' ? '/billing' : path

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(window.location.pathname.replace(/\/+$/, '') || '/')
    setSidebarOpen(false)
    setSearch('')
  }

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname.replace(/\/+$/, '') || '/')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const pageProps = { onToast: setToast }
  let page
  if (path === '/' || path === '/consumption') page = path === '/' ? <OverviewPage onNavigate={navigate} onToast={setToast} /> : <ConsumptionPage />
  else if (path === '/playground') page = <PlaygroundPage {...pageProps} />
  else if (path === '/knowledge') page = <KnowledgePage {...pageProps} />
  else if (path === '/audit') page = <AuditPage />
  else if (path === '/api-keys') page = <ApiKeysPage {...pageProps} />
  else if (path === '/workspaces') page = <WorkspacesPage {...pageProps} />
  else if (path === '/billing') page = <BillingPage />
  else if (path === '/checkout') page = <CheckoutPage />
  else page = <NotFoundPage />

  const filteredNavigation = navigation.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}><span className="brand-mark"><BrainCircuit size={19} /></span><span className="brand-copy"><strong>NeonForge</strong><small>AI control plane</small></span><span className="brand-collapse"><ChevronDown size={13} /></span></a>
        <button className="workspace-switcher" onClick={() => navigate('/workspaces')}><span className="workspace-status" /> production <ChevronDown size={14} /></button>
        <nav className="side-nav" aria-label="Main navigation">
          <span className="nav-section-label">Workspace</span>
          {navigation.map(({ label, href, icon: Icon, badge }) => <a key={href} href={href} onClick={(event) => { event.preventDefault(); navigate(href) }} className={`nav-link ${activeItem === href ? 'is-active' : ''}`}><Icon size={16} /><span>{label}</span>{badge && <small className="nav-badge">{badge}</small>}</a>)}
          <span className="nav-section-label nav-section-spaced">Account</span>
          <a href="/billing" onClick={(event) => { event.preventDefault(); navigate('/billing') }} className={`nav-link ${activeItem === '/billing' ? 'is-active' : ''}`}><CreditCard size={16} /><span>Billing</span></a>
        </nav>
        <a className="spend-widget" href="/billing" onClick={(event) => { event.preventDefault(); navigate('/billing') }}><span className="spend-widget-heading">Spend cap · daily <span>48%</span></span><span className="spend-progress"><span style={{ width: '48%' }} /></span><span className="spend-widget-foot">$18.42 <span>of $50.00</span></span></a>
        <button className="sidebar-profile" onClick={() => setToast('Signed in as devon@acme.ai · Production workspace')}><span className="profile-avatar">DC</span><span><strong>devon@acme.ai</strong><small>Workspace admin</small></span><Settings2 size={15} /></button>
      </aside>

      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div className="breadcrumbs"><span>acme</span><ChevronRight size={12} /><span>production</span><ChevronRight size={12} /><strong>{title?.[0] || 'Not found'}</strong></div></div>
          <div className="topbar-actions">
            <label className="search-field global-search"><Search size={14} /><input aria-label="Search dashboard pages" placeholder="Search prompts, models, traces...  ⌘K" value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button className="search-clear" aria-label="Clear search" onClick={() => setSearch('')}><X size={13} /></button>}</label>
            <span className="system-status"><i /> Preview mode</span>
            <button className="environment-button" onClick={() => navigate('/workspaces')}>acme / prod <ChevronDown size={12} /></button>
            <button className="button button-primary new-agent-button" onClick={() => setNewAgentOpen(true)}><Plus size={14} /> New agent</button>
            <button className="icon-button topbar-icon" aria-label="Notifications" onClick={() => setToast('You’re all caught up on workspace notifications.')}><Bell size={16} /><i /></button>
            <button className="icon-button topbar-icon" aria-label="Help" onClick={() => setToast('Help center: support@neonforge.example')}><CircleDollarSign size={16} /></button>
          </div>
          {search && <div className="search-results">{filteredNavigation.length ? filteredNavigation.map((item) => <a key={item.href} href={item.href} onClick={(event) => { event.preventDefault(); navigate(item.href) }}><item.icon size={14} />{item.label}<ArrowRight size={13} /></a>) : <span>No dashboard pages found.</span>}</div>}
        </header>
        <div className="page-content">
          {title && <div className="route-heading"><span className="route-icon">{(() => { const Icon = (navigation.find((item) => item.href === activeItem)?.icon) || Activity; return <Icon size={15} /> })()}</span><strong>{title[0]}</strong><span className="route-separator">/</span><span>{title[1]}</span></div>}
          {page}
          <footer className="app-footer"><span>NeonForge AI Console <span className="footer-version">· v2.4.1</span></span><span><a href="/billing" onClick={(event) => { event.preventDefault(); navigate('/billing') }}>Usage & billing</a><a href="/api-keys" onClick={(event) => { event.preventDefault(); navigate('/api-keys') }}>API docs</a></span></footer>
        </div>
      </main>
      {toast && <div className="toast-message" role="status"><Check size={15} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button></div>}
      {newAgentOpen && <NewAgentDialog onClose={() => setNewAgentOpen(false)} onToast={setToast} />}
    </div>
  )
}
