import { useCallback, useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  X,
  XCircle,
  Banknote,
  Clock3,
  CreditCard,
  Download,
  History,
  Plus,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { userApi } from '../services/api'

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const walletFundingVatRate = 0.075
const walletFundingVat = 100
const dateLabel = (value) => new Date(value).toLocaleString()

function WalletLayout({ children }) {
  return (
    <div className="page-wrapper">
      <div className="page-container wallet-page-container">{children}</div>
      <footer className="simple-footer">
        <span>© 2026 Cardzip. All rights reserved.</span>
        <div className="footer-right">
          <a href="#privacy">Privacy policy</a><a href="#terms">Terms of service</a>
          <span className="green-dot-status">● All systems operational</span>
        </div>
      </footer>
    </div>
  )
}

function WalletHeader({ breadcrumb, title, subtitle, onNavigate }) {
  return (
    <div className="page-header-row reveal">
      <div><div className="breadcrumb">{breadcrumb}</div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>
      {onNavigate && <button type="button" className="btn-secondary-pill" onClick={() => onNavigate('/wallet')}><ArrowLeft size={14} /><span>Wallet overview</span></button>}
    </div>
  )
}

function mapTransaction(transaction) {
  const credit = transaction.type === 'credit'
  return {
    reference: transaction.referenceId || transaction._id,
    title: transaction.description || transaction.type,
    category: transaction.referenceType || transaction.type,
    date: dateLabel(transaction.createdAt),
    amount: `${credit ? '+' : '-'}${formatNaira(transaction.amount)}`,
    direction: credit ? 'credit' : 'debit',
    status: transaction.status.toUpperCase(),
    balance: formatNaira(transaction.balanceAfter),
  }
}

function HistoryTable({ rows, type = 'activity' }) {
  if (type === 'withdrawals') {
    return (
      <div className="wallet-table-scroll"><table className="orders-table wallet-table">
        <thead><tr><th>REFERENCE</th><th>DESTINATION</th><th>DATE</th><th>AMOUNT</th><th>RISK / STATUS</th><th>DETAILS</th></tr></thead>
        <tbody>{rows.map((item) => <tr key={item.reference}>
          <td className="order-num">{item.reference}</td>
          <td><span className="item-title">{item.bankName}</span><span className="item-sub">{item.accountName} · {item.accountNumber.slice(-4).padStart(item.accountNumber.length, '•')}</span></td>
          <td className="date-txt">{item.date}</td><td className="price-txt">{formatNaira(item.amount)}</td>
          <td><span className={`status-pill ${item.riskStatus === 'clear' ? item.status.toLowerCase() : 'failed'}`}>{item.riskStatus === 'clear' ? 'CLEAR TO WITHDRAW' : 'FAILED'} · {item.status.toUpperCase()}</span></td>
          <td className="withdrawal-history-details">
            {item.riskReason && <span className="withdrawal-history-reason"><strong>Wallet check:</strong> {item.riskReason}</span>}
            {item.reviewReason && <span className="withdrawal-history-reason"><strong>Admin decision:</strong> {item.reviewReason}</span>}
            {Number(item.refundedAmount) > 0 && <span className="withdrawal-history-refund"><strong>Refunded to wallet:</strong> {formatNaira(item.refundedAmount)}</span>}
            {item.payoutReference && <span className="withdrawal-history-reason"><strong>Transfer reference:</strong> {item.payoutReference}</span>}
            {!item.riskReason && !item.reviewReason && !Number(item.refundedAmount) && !item.payoutReference && '—'}
          </td>
        </tr>)}</tbody>
      </table></div>
    )
  }

  return (
    <div className="wallet-table-scroll"><table className="orders-table wallet-table">
      <thead><tr><th>TRANSACTION</th><th>TYPE</th><th>DATE</th><th>AMOUNT</th><th>BALANCE</th><th>STATUS</th></tr></thead>
      <tbody>{rows.map((item) => <tr key={item.reference}>
        <td><span className="item-title">{item.title}</span><span className="item-sub">{item.reference}</span></td>
        <td className="date-txt">{item.category}</td><td className="date-txt">{item.date}</td>
        <td className={`price-txt wallet-amount ${item.direction}`}>{item.amount}</td><td className="price-txt">{item.balance}</td>
        <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
      </tr>)}</tbody>
    </table></div>
  )
}

function HistoryCard({ children, tabs, activeTab, onNavigate, actionLabel = 'View all activity' }) {
  return (
    <section className="orders-table-card wallet-history-card reveal">
      <div className="table-top-bar"><div className="tabs-list">{tabs.map((tab) => (
        <button key={tab.label} type="button" className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => onNavigate(tab.path)}>{tab.label}</button>
      ))}</div><button type="button" className="wallet-text-link" onClick={() => onNavigate('/balance-history')}>{actionLabel}<ArrowRight size={14} /></button></div>
      {children}
    </section>
  )
}

function RemoteHistory({ type }) {
  const [rows, setRows] = useState([])
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [range, setRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRows = useCallback(async (page = 1) => {
    const query = new URLSearchParams({ page: String(page), limit: '20' })
    if (range === 'month') query.set('month', new Date().toISOString().slice(0, 7))
    if (range === '30' || range === '90') {
      const from = new Date()
      from.setDate(from.getDate() - Number(range))
      query.set('from', from.toISOString())
    }
    let result
    if (type === 'withdrawals') result = await userApi.withdrawals(`?${query.toString()}`)
    else {
      if (type === 'deposits') query.set('type', 'credit')
      result = await userApi.walletHistory(`?${query.toString()}`)
    }
    return {
      rows: type === 'withdrawals' ? result.data : result.data.map(mapTransaction),
      pagination: result.pagination,
    }
  }, [range, type])

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchRows(page)
      setRows(result.rows)
      setPageInfo({ ...result.pagination, totalPages: Math.max(1, result.pagination.totalPages) })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [fetchRows])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetchRows(1)
      .then((result) => {
        if (!active) return
        setRows(result.rows)
        setPageInfo({ ...result.pagination, totalPages: Math.max(1, result.pagination.totalPages) })
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [fetchRows])

  return (
    <>
      <div className="wallet-history-filters">
        <label className="wallet-history-range-control" htmlFor={`wallet-history-range-${type}`}>
          <span>Date range</span><select id={`wallet-history-range-${type}`} className="wallet-history-range-select" value={range} onChange={(event) => setRange(event.target.value)}>
          <option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="month">This month</option><option value="all">All time</option>
          </select>
        </label>
        <span>{pageInfo.totalItems} records</span>
      </div>
      {error && <p className="wallet-notice error" role="alert">{error}</p>}
      {loading ? <p>Loading wallet history…</p> : rows.length ? <HistoryTable rows={rows} type={type === 'withdrawals' ? 'withdrawals' : 'activity'} /> : <p>No transactions found for this period.</p>}
      <div className="pagination-controls">
        <button type="button" disabled={loading || pageInfo.page <= 1} onClick={() => load(pageInfo.page - 1)}>Previous</button>
        <span>Page {pageInfo.page} of {pageInfo.totalPages}</span>
        <button type="button" disabled={loading || pageInfo.page >= pageInfo.totalPages} onClick={() => load(pageInfo.page + 1)}>Next</button>
      </div>
    </>
  )
}

export default function WalletPage({ onNavigate }) {
  const [balance, setBalance] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([userApi.wallet(), userApi.walletHistory('?page=1&limit=5')])
      .then(([wallet, history]) => {
        setBalance(wallet.data)
        setRecent(history.data.map(mapTransaction))
      })
      .catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <WalletLayout>
      <WalletHeader breadcrumb="Home / Wallet" title="Your money, at a glance." subtitle="Manage your Cardzip balance, add funds and review all your activity." />
      {error && <p className="wallet-notice error" role="alert">{error}</p>}
      <section className="wallet-hero reveal">
        <div className="wallet-hero-top"><div className="wallet-balance-label"><Wallet size={17} /> Available balance</div><span className="wallet-secure-tag"><ShieldCheck size={14} /> Secure wallet</span></div>
        <div className="wallet-balance-value">{balance !== null ? formatNaira(balance.balance) : 'Loading…'}</div>
        <p className="wallet-hero-note">Cardzip {balance?.currency || 'NGN'} wallet · {balance ? `Updated ${dateLabel(balance.updatedAt)}` : 'Loading balance'}</p>
        <div className="wallet-actions">
          <button type="button" className="wallet-primary-action" onClick={() => onNavigate('/add-money')}><Plus size={17} /> Add money</button>
          <button type="button" className="wallet-secondary-action" onClick={() => onNavigate('/withdraw')}><ArrowUpRight size={16} /> Withdraw</button>
          <button type="button" className="wallet-tertiary-action" onClick={() => onNavigate('/balance-history')}><History size={16} /> Full history</button>
        </div><div className="wallet-hero-decoration" aria-hidden="true" />
      </section>
      <div className="wallet-quick-grid">
        <button type="button" className="wallet-quick-card reveal" onClick={() => onNavigate('/add-money-history')}><span className="wallet-quick-icon incoming"><ArrowDownLeft size={18} /></span><span><strong>Money in</strong><small>Deposit history</small></span><ArrowRight size={16} /></button>
        <button type="button" className="wallet-quick-card reveal" onClick={() => onNavigate('/withdrawal-history')}><span className="wallet-quick-icon outgoing"><ArrowUpRight size={18} /></span><span><strong>Money out</strong><small>Withdrawal history</small></span><ArrowRight size={16} /></button>
        <button type="button" className="wallet-quick-card reveal" onClick={() => onNavigate('/balance-history')}><span className="wallet-quick-icon balance"><History size={18} /></span><span><strong>All activity</strong><small>Full wallet ledger</small></span><ArrowRight size={16} /></button>
      </div>
      <HistoryCard tabs={[{ id: 'all', label: 'Recent activity', path: '/balance-history' }, { id: 'deposits', label: 'Money in', path: '/add-money-history' }, { id: 'withdrawals', label: 'Withdrawals', path: '/withdrawal-history' }]} activeTab="all" onNavigate={onNavigate}>
        {recent.length ? <HistoryTable rows={recent} /> : <p>No wallet activity yet.</p>}
      </HistoryCard>
      <div className="wallet-security-note reveal"><ShieldCheck size={17} /><span>Your wallet and transactions are protected with Cardzip security.</span></div>
    </WalletLayout>
  )
}

export function AddMoneyPage({ onNavigate }) {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState(null)
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const presets = ['5000', '10000', '20000', '50000']
  const numericAmount = Number(amount.replace(/[₦,\s]/g, ''))
  const validAmount = Number.isSafeInteger(numericAmount) && numericAmount >= 100
  const fundingVat = validAmount ? Math.round(numericAmount * walletFundingVatRate) + walletFundingVat : 0
  const totalFundingCost = numericAmount + fundingVat

  useEffect(() => { userApi.wallet().then((result) => setBalance(result.data)).catch((error) => setNotice(error.message)) }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 100) {
      setNotice('Enter a whole-number amount of at least ₦100.')
      return
    }
    setSubmitting(true)
    setNotice('')
    try {
      const result = await userApi.initializeFunding({ amount: numericAmount })
      window.location.assign(result.data.authorizationUrl)
    } catch (error) {
      setNotice(error.message)
      setSubmitting(false)
    }
  }

  return (
    <WalletLayout>
      <WalletHeader breadcrumb="Home / Wallet / Add Money" title="Add money to your wallet" subtitle="Choose an amount and pay securely through Paystack." onNavigate={onNavigate} />
      <div className="wallet-form-layout"><form className="wallet-form-card reveal" onSubmit={submit}>
        <div className="wallet-section-heading"><span className="wallet-step-number">01</span><div><h2>Choose an amount</h2><p>Minimum top-up is ₦100. Maximum top-up is ₦5,000,000.</p></div></div>
        <div className="wallet-presets">{presets.map((preset) => <button key={preset} type="button" className={`wallet-preset ${amount === preset ? 'selected' : ''}`} onClick={() => { setAmount(preset); setNotice('') }}>₦{Number(preset).toLocaleString()}</button>)}</div>
        <label className="wallet-field-label" htmlFor="wallet-amount">Other amount</label>
        <div className="wallet-amount-input"><span>₦</span><input id="wallet-amount" inputMode="numeric" value={amount} onChange={(event) => { setAmount(event.target.value.replace(/\D/g, '')); setNotice('') }} placeholder="Enter amount" /></div>
        <div className="wallet-section-heading wallet-method-heading"><span className="wallet-step-number">02</span><div><h2>Payment method</h2><p>Paystack provides secure card checkout. Your wallet is credited only after server-side verification.</p></div></div>
        <div className="wallet-method-options"><div className="wallet-method-option selected"><CreditCard size={20} /><span><strong>Paystack</strong><small>Visa · Mastercard · Verve</small></span><span className="wallet-radio"><i /></span></div></div>
        {fundingVat > 0 && <div className="wallet-funding-costs" aria-live="polite">
          <div><span>Wallet credit</span><strong>{formatNaira(numericAmount)}</strong></div>
          <div><span>VAT</span><strong>{formatNaira(fundingVat)}</strong></div>
          <div className="wallet-funding-total"><span>Total to pay</span><strong>{formatNaira(totalFundingCost)}</strong></div>
        </div>}
        {notice && <div className="wallet-notice error" role="alert">{notice}</div>}
        <button type="submit" disabled={submitting} className="btn-emerald-submit wallet-submit"><span>{submitting ? 'Connecting to Paystack…' : `Pay ${formatNaira(totalFundingCost)}`}</span><ArrowUpRight size={16} /></button>
        <span className="wallet-form-footnote"><ShieldCheck size={14} /> Your wallet is not credited until Paystack confirms your payment.</span>
      </form><aside className="wallet-side-column">
        <div className="wallet-summary-card reveal"><span className="wallet-summary-icon"><Wallet size={19} /></span><span className="wallet-summary-label">Current balance</span><strong>{balance !== null ? formatNaira(balance.balance) : 'Loading…'}</strong><span className="wallet-summary-caption">Your verified balance after payment is confirmed.</span></div>
        <div className="wallet-info-card reveal"><h3>Payment security</h3><p>Cardzip never receives or stores your full card details. Payment confirmation is checked directly with Paystack.</p><button type="button" className="wallet-text-link" onClick={() => onNavigate('/add-money-history')}>View deposit history <ArrowRight size={14} /></button></div>
      </aside></div>
    </WalletLayout>
  )
}

export function WithdrawalPage({ onNavigate }) {
  const [amount, setAmount] = useState('')
  const [account, setAccount] = useState({ bankName: '', accountName: '', accountNumber: '' })
  const [balance, setBalance] = useState(null)
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resultModal, setResultModal] = useState(null)

  useEffect(() => {
    Promise.all([userApi.wallet(), userApi.account()])
      .then(([wallet, profile]) => {
        setBalance(wallet.data)
        const saved = profile.data.user.bankAccount
        if (saved) setAccount(saved)
      })
      .catch((error) => setNotice(error.message))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    const numericAmount = Number(amount.replace(/[₦,\s]/g, ''))
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 100) {
      setNotice('Enter a whole-number withdrawal amount of at least ₦100.')
      return
    }
    if (!account.bankName || !account.accountName || !/^\d{10}$/.test(account.accountNumber)) {
      setNotice('Add a valid bank account before requesting a withdrawal.')
      return
    }
    setSubmitting(true)
    setNotice('')
    setResultModal(null)
    try {
      const result = await userApi.requestWithdrawal({ amount: numericAmount, ...account })
      const request = result.data.request
      setBalance((current) => current ? { ...current, balance: result.data.balance } : current)
      setResultModal({
        type: request.riskStatus === 'clear' ? 'success' : 'failed',
        title: request.riskStatus === 'clear' ? 'Withdrawal request submitted' : 'Withdrawal request failed',
        message: request.riskReason || (request.riskStatus === 'clear'
          ? 'Your funds are reserved while an authorized administrator reviews your payout request.'
          : 'Your withdrawal request could not pass the wallet ledger check.'),
        request,
      })
      setAmount('')
    } catch (error) {
      const request = error.data?.request
      if (request) {
        setResultModal({
          type: 'failed',
          title: 'Withdrawal request failed',
          message: request.riskReason || error.message,
          request,
        })
      } else {
        setResultModal({
          type: 'failed',
          title: 'Withdrawal could not be submitted',
          message: error.message || 'Please try again.',
          request: null,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <WalletLayout><WalletHeader breadcrumb="Home / Wallet / Withdraw" title="Withdraw to your bank" subtitle="Your wallet ledger is checked before funds are reserved for payout review." onNavigate={onNavigate} />
      <div className="wallet-form-layout"><form className="wallet-form-card reveal" onSubmit={submit}>
        <div className="wallet-withdraw-balance"><Wallet size={17} /><span>Available to withdraw</span><strong>{balance !== null ? formatNaira(balance.balance) : 'Loading…'}</strong></div>
        <label className="wallet-field-label" htmlFor="withdrawal-amount">Amount to withdraw</label>
        <div className="wallet-amount-input"><span>₦</span><input id="withdrawal-amount" inputMode="numeric" value={amount} onChange={(event) => { setAmount(event.target.value.replace(/\D/g, '')); setNotice('') }} placeholder="Enter amount" /></div>
        <div className="wallet-section-heading wallet-method-heading"><span className="wallet-step-number">01</span><div><h2>Payout bank account</h2><p>Withdrawals are only sent to your saved account.</p></div></div>
        {account.bankName ? <div className="wallet-method-option selected"><Banknote size={20} /><span><strong>{account.bankName}</strong><small>{account.accountName} · •••• {account.accountNumber.slice(-4)}</small></span></div> : <p>No payout account saved. Add one to continue.</p>}
        <button type="button" className="wallet-add-bank-link" onClick={() => onNavigate('/bank-accounts')}><Plus size={15} /> Add or manage bank accounts</button>
        {notice && <div className={`wallet-notice ${notice.startsWith('Enter ') || notice.startsWith('Add ') ? 'error' : 'info'}`} role="status">{notice}</div>}
        <button type="submit" disabled={submitting || !account.bankName} className="btn-emerald-submit wallet-submit"><span>{submitting ? 'Checking wallet ledger…' : 'Request withdrawal'}</span><ArrowUpRight size={16} /></button>
      </form><aside className="wallet-side-column"><div className="wallet-info-card reveal"><h3>Withdrawal risk checks</h3><div className="wallet-guidance-row"><ShieldCheck size={16} /><span><strong>Balance reconciliation</strong><small>Wallet balance and transaction history must agree before payout can be requested.</small></span></div><div className="wallet-guidance-row"><Clock3 size={16} /><span><strong>Review before transfer</strong><small>Eligible requests are held for an authorized admin review; submitting does not claim funds were transferred.</small></span></div></div></aside></div>
      {resultModal && <div className="wallet-result-backdrop" role="presentation" onMouseDown={(event) => {
        if (event.target === event.currentTarget) setResultModal(null)
      }}>
        <section className="wallet-result-modal" role="dialog" aria-modal="true" aria-labelledby="withdrawal-result-title">
          <div className={`wallet-result-icon ${resultModal.type}`}>
            {resultModal.type === 'success' ? <CheckCircle2 size={25} /> : <XCircle size={25} />}
          </div>
          <button type="button" className="wallet-result-close" onClick={() => setResultModal(null)} aria-label="Close withdrawal result"><X size={18} /></button>
          <h2 id="withdrawal-result-title">{resultModal.title}</h2>
          <p>{resultModal.message}</p>
          {resultModal.request && <div className="wallet-result-details">
            <div><span>Amount</span><strong>{formatNaira(resultModal.request.amount)}</strong></div>
            <div><span>Request status</span><strong className={resultModal.type}>{resultModal.request.status}</strong></div>
            <div><span>Reference</span><strong>{resultModal.request.reference}</strong></div>
          </div>}
          <button type="button" className="btn-emerald-submit wallet-result-confirm" onClick={() => setResultModal(null)}>Done</button>
        </section>
      </div>}
    </WalletLayout>
  )
}

export function BankAccountsPage({ onNavigate }) {
  const [account, setAccount] = useState({ bankName: '', accountName: '', accountNumber: '' })
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    userApi.account().then((result) => {
      if (result.data.user.bankAccount) setAccount(result.data.user.bankAccount)
    }).catch((error) => setNotice(error.message))
  }, [])
  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    try {
      const result = await userApi.saveBankAccount(account)
      setAccount(result.data)
      setNotice('Bank account saved to your Cardzip profile.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSaving(false)
    }
  }
  return <WalletLayout><WalletHeader breadcrumb="Home / Wallet / Bank Accounts" title="Bank account" subtitle="Manage the saved account used for withdrawal requests." onNavigate={onNavigate} />
    <form className="wallet-form-card reveal" onSubmit={save}>
      <label className="wallet-field-label" htmlFor="bank-name">Bank</label>
      <select id="bank-name" className="wallet-select-input" required value={account.bankName} onChange={(event) => setAccount({ ...account, bankName: event.target.value })}>
        <option value="">Select a bank</option><option>Access Bank</option><option>First Bank</option><option>Guaranty Trust Bank</option><option>United Bank for Africa</option><option>Zenith Bank</option><option>Other</option>
      </select>
      <label className="wallet-field-label" htmlFor="account-holder">Account holder name</label><input id="account-holder" className="wallet-text-input" required value={account.accountName} onChange={(event) => setAccount({ ...account, accountName: event.target.value })} autoComplete="name" />
      <label className="wallet-field-label" htmlFor="account-number">Account number</label><input id="account-number" className="wallet-text-input" required inputMode="numeric" maxLength={10} value={account.accountNumber} onChange={(event) => setAccount({ ...account, accountNumber: event.target.value.replace(/\D/g, '').slice(0, 10) })} />
      {notice && <div className={`wallet-notice ${notice.includes('saved') ? 'info' : 'error'}`} role="status">{notice}</div>}
      <button type="submit" disabled={saving} className="btn-emerald-submit wallet-submit">{saving ? 'Saving…' : 'Save bank account'}</button>
      <p className="wallet-form-footnote"><ShieldCheck size={14} /> Account details are stored on your authenticated profile. Use an account in your legal name.</p>
      <button type="button" className="wallet-text-link" onClick={() => onNavigate('/withdraw')}>Continue to withdrawal <ArrowRight size={14} /></button>
    </form>
  </WalletLayout>
}

export function AddMoneyHistoryPage({ onNavigate }) {
  return <WalletLayout><WalletHeader breadcrumb="Home / Wallet / Money In" title="Add money history" subtitle="Review confirmed Paystack wallet top-ups." onNavigate={onNavigate} />
    <HistoryCard tabs={[{ id: 'all', label: 'All activity', path: '/balance-history' }, { id: 'deposits', label: 'Money in', path: '/add-money-history' }]} activeTab="deposits" onNavigate={onNavigate} actionLabel="Full balance history"><RemoteHistory type="deposits" /></HistoryCard>
    <button type="button" className="wallet-bottom-action" onClick={() => onNavigate('/add-money')}><Plus size={16} /> Add money</button>
  </WalletLayout>
}

export function WithdrawalHistoryPage({ onNavigate }) {
  return <WalletLayout><WalletHeader breadcrumb="Home / Wallet / Withdrawals" title="Withdrawal history" subtitle="Track risk checks, payout review and transfer references." onNavigate={onNavigate} />
    <button type="button" className="wallet-bottom-action" onClick={() => onNavigate('/withdraw')}><ArrowUpRight size={16} /> Start a withdrawal</button>
    <HistoryCard tabs={[{ id: 'all', label: 'All activity', path: '/balance-history' }, { id: 'withdrawals', label: 'Withdrawals', path: '/withdrawal-history' }]} activeTab="withdrawals" onNavigate={onNavigate} actionLabel="Full balance history"><RemoteHistory type="withdrawals" /></HistoryCard>
    <div className="wallet-withdrawal-help reveal"><Clock3 size={18} /><span><strong>Transfer timing</strong><small>A request is not a completed transfer. Completed payouts include an administrator-recorded transfer reference.</small></span></div>
  </WalletLayout>
}

export function BalanceHistoryPage({ onNavigate }) {
  return <WalletLayout><WalletHeader breadcrumb="Home / Wallet / All Activity" title="Your balance history" subtitle="Your wallet ledger, with date filters and pagination." onNavigate={onNavigate} />
    <div className="wallet-ledger-tools reveal"><div><History size={18} /><span><strong>Wallet ledger</strong><small>Server-recorded wallet funding, purchases and withdrawals</small></span></div><button className="wallet-export-button" onClick={() => window.print()} type="button"><Download size={15} /> Print history</button></div>
    <HistoryCard tabs={[{ id: 'all', label: 'All activity', path: '/balance-history' }, { id: 'deposits', label: 'Money in', path: '/add-money-history' }, { id: 'withdrawals', label: 'Withdrawals', path: '/withdrawal-history' }]} activeTab="all" onNavigate={onNavigate} actionLabel="Wallet overview"><RemoteHistory type="all" /></HistoryCard>
  </WalletLayout>
}
