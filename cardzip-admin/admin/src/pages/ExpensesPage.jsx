import { useEffect, useState } from 'react'
import { BadgeDollarSign, CalendarDays, CheckCircle2, CircleDollarSign, RefreshCw } from 'lucide-react'
import { adminApi } from '../services/api'

const formatNgn = (value) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 2,
}).format(Number(value || 0))

const getPeriods = () => {
  const now = new Date()
  return {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    year: String(now.getFullYear()),
  }
}

const serviceExpenses = [
  {
    type: 'render',
    title: 'Render backend services',
    cadence: 'Monthly',
    reference: '$7 USD / month',
    period: 'month',
  },
  {
    type: 'google_console',
    title: 'Google Console services',
    cadence: 'Yearly',
    reference: 'Annual console/service payment',
    period: 'year',
  },
  {
    type: 'ios_developer',
    title: 'Apple iOS Developer Program',
    cadence: 'Yearly',
    reference: 'Annual developer program renewal',
    period: 'year',
  },
  {
    type: 'website_domain',
    title: 'Website domain',
    cadence: 'Yearly',
    reference: 'Annual domain renewal',
    period: 'year',
  },
]

export default function ExpensesPage() {
  const [periods] = useState(getPeriods)
  const [staff, setStaff] = useState([])
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [salaryAmounts, setSalaryAmounts] = useState({})
  const [serviceAmounts, setServiceAmounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadExpenses = async () => {
    const result = await adminApi.companyExpenses()
    setStaff(Array.isArray(result.data.staff) ? result.data.staff : [])
    setExpenses(Array.isArray(result.data.expenses) ? result.data.expenses : [])
    setSummary(result.data.summary || null)

    const currentPayroll = (result.data.expenses || []).filter((expense) =>
      expense.expenseType === 'staff_salary' && expense.periodKey === periods.month && expense.staff?._id)
    setSalaryAmounts((current) => {
      const amounts = { ...current }
      currentPayroll.forEach((expense) => { amounts[expense.staff._id] = String(expense.amountNgn) })
      return amounts
    })
    setServiceAmounts((current) => {
      const amounts = { ...current }
      serviceExpenses.forEach(({ type, period }) => {
        const expense = (result.data.expenses || []).find((item) =>
          item.expenseType === type && item.periodKey === periods[period])
        if (expense) amounts[type] = String(expense.amountNgn)
      })
      return amounts
    })
  }

  useEffect(() => {
    let mounted = true
    adminApi.companyExpenses()
      .then((result) => {
        if (!mounted) return
        setStaff(Array.isArray(result.data.staff) ? result.data.staff : [])
        const rows = Array.isArray(result.data.expenses) ? result.data.expenses : []
        setExpenses(rows)
        setSummary(result.data.summary || null)
        const payrollAmounts = {}
        rows.filter((expense) => expense.expenseType === 'staff_salary' && expense.periodKey === periods.month && expense.staff?._id)
          .forEach((expense) => { payrollAmounts[expense.staff._id] = String(expense.amountNgn) })
        setSalaryAmounts(payrollAmounts)
        const currentServiceAmounts = {}
        serviceExpenses.forEach(({ type, period }) => {
          const expense = rows.find((item) => item.expenseType === type && item.periodKey === periods[period])
          if (expense) currentServiceAmounts[type] = String(expense.amountNgn)
        })
        setServiceAmounts(currentServiceAmounts)
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || 'Could not load company expenses.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [periods])

  const paidExpenseFor = (type, period, staffId) => expenses.find((expense) =>
    expense.expenseType === type
      && expense.periodKey === periods[period]
      && (!staffId || expense.staff?._id === staffId))

  const recordPayment = async (key, body) => {
    const amount = Number(body.amountNgn)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid expense amount in NGN before marking it paid.')
      setNotice('')
      return
    }
    setPaying(key)
    setError('')
    setNotice('')
    try {
      const result = await adminApi.payCompanyExpense({ ...body, amountNgn: amount })
      setExpenses((current) => [result.data.expense, ...current])
      setSummary(result.data.summary)
      setNotice(`${result.data.expense.label} was recorded as paid.`)
    } catch (requestError) {
      setError(requestError.message || 'Could not record this payment.')
    } finally {
      setPaying('')
    }
  }

  return (
    <section className="expenses-page">
      <header className="page-header expenses-header">
        <div>
          <span className="expenses-kicker"><CircleDollarSign size={15} /> COMPANY FINANCES</span>
          <h1 className="page-title">Expenses tracker</h1>
          <p className="page-subtitle">Record payroll and service payments. Paid expenses are deducted from company profit.</p>
        </div>
        <button type="button" className="btn-secondary expenses-refresh" disabled={loading || Boolean(paying)} onClick={() => {
          setLoading(true)
          setError('')
          loadExpenses()
            .catch((requestError) => setError(requestError.message || 'Could not refresh company expenses.'))
            .finally(() => setLoading(false))
        }}>
          <RefreshCw size={15} className={loading ? 'expenses-spin' : ''} /> Refresh
        </button>
      </header>

      {error && <div className="expenses-alert error" role="alert">{error}</div>}
      {notice && <div className="expenses-alert success" role="status"><CheckCircle2 size={16} />{notice}</div>}

      <div className="expenses-summary-grid">
        <article className="expenses-summary-card"><span>Gross company profit</span><strong>{formatNgn(summary?.grossCompanyProfit)}</strong><small>Before recorded expenses</small></article>
        <article className="expenses-summary-card expense-outflow"><span>Paid expenses</span><strong>{formatNgn(summary?.paidExpenses)}</strong><small>All-time expense outflow</small></article>
        <article className="expenses-summary-card net-profit"><span>Available company profit</span><strong>{formatNgn(summary?.netCompanyProfit)}</strong><small>Gross profit minus paid expenses</small></article>
      </div>

      <section className="section-card expenses-service-section">
        <div className="expenses-section-heading">
          <div><h2>Backend and platform services</h2><p>Enter the amount charged in NGN. Render’s reference price is shown in USD; use the actual NGN amount charged.</p></div>
        </div>
        <div className="expenses-service-grid">
          {serviceExpenses.map((service) => {
            const periodKey = periods[service.period]
            const paidExpense = paidExpenseFor(service.type, service.period)
            const key = `${service.type}:${periodKey}`
            return (
              <article className="expenses-service-card" key={service.type}>
                <div className="expenses-service-icon"><BadgeDollarSign size={19} /></div>
                <div className="expenses-service-title"><h3>{service.title}</h3><span><CalendarDays size={13} /> {service.cadence} · {periodKey}</span></div>
                <p>{service.reference}</p>
                <label htmlFor={`expense-${service.type}`}>Amount paid (NGN)</label>
                <div className="expenses-amount-field"><span>₦</span><input id={`expense-${service.type}`} inputMode="decimal" type="number" min="0.01" step="0.01" value={serviceAmounts[service.type] || ''} disabled={Boolean(paidExpense)} onChange={(event) => setServiceAmounts((current) => ({ ...current, [service.type]: event.target.value }))} placeholder="Enter amount" /></div>
                {paidExpense
                  ? <div className="expenses-paid-tag"><CheckCircle2 size={15} /> Paid {formatNgn(paidExpense.amountNgn)}</div>
                  : <button type="button" className="btn-primary expenses-pay-button" disabled={Boolean(paying) || loading} onClick={() => void recordPayment(key, { expenseType: service.type, periodKey, amountNgn: serviceAmounts[service.type] })}>{paying === key ? 'Recording payment…' : 'Mark as paid'}</button>}
              </article>
            )
          })}
        </div>
      </section>

      <section className="section-card expenses-payroll-section">
        <div className="expenses-section-heading">
          <div><h2>Staff salaries</h2><p>Set the monthly salary for each active staff account and record payment for {periods.month}.</p></div>
          <span className="expenses-count">{staff.length} active staff</span>
        </div>
        <div className="table-responsive">
          <table className="staff-table expenses-payroll-table">
            <thead><tr><th>Staff member</th><th>Department</th><th>Monthly salary (NGN)</th><th>Payment</th></tr></thead>
            <tbody>
              {staff.map((person) => {
                const paidExpense = paidExpenseFor('staff_salary', 'month', person._id)
                const key = `staff_salary:${person._id}:${periods.month}`
                return <tr key={person._id}>
                  <td><strong>{person.name}</strong><small>{person.email}</small></td>
                  <td>{person.department || 'Operations'}</td>
                  <td><div className="expenses-amount-field"><span>₦</span><input aria-label={`Monthly salary for ${person.name}`} inputMode="decimal" type="number" min="0.01" step="0.01" value={salaryAmounts[person._id] || ''} disabled={Boolean(paidExpense)} onChange={(event) => setSalaryAmounts((current) => ({ ...current, [person._id]: event.target.value }))} placeholder="Enter salary" /></div></td>
                  <td>{paidExpense
                    ? <span className="expenses-paid-tag"><CheckCircle2 size={14} /> Paid {formatNgn(paidExpense.amountNgn)}</span>
                    : <button type="button" className="btn-primary expenses-pay-button" disabled={Boolean(paying) || loading} onClick={() => void recordPayment(key, { expenseType: 'staff_salary', staffId: person._id, periodKey: periods.month, amountNgn: salaryAmounts[person._id] })}>{paying === key ? 'Recording…' : 'Mark paid'}</button>}</td>
                </tr>
              })}
              {!loading && staff.length === 0 && <tr><td colSpan="4" className="staff-empty-row">No active staff accounts were found.</td></tr>}
              {loading && <tr><td colSpan="4" className="staff-empty-row">Loading staff and salary records…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card expenses-history-section">
        <div className="expenses-section-heading">
          <div><h2>Paid expense history</h2><p>Recorded salary and service payments deducted from company profit.</p></div>
          <span className="expenses-count">{expenses.length} records</span>
        </div>
        <div className="table-responsive">
          <table className="staff-table expenses-history-table">
            <thead><tr><th>Expense</th><th>Period</th><th>Paid by</th><th>Date paid</th><th>Amount</th></tr></thead>
            <tbody>
              {expenses.map((expense) => <tr key={expense._id}>
                <td><strong>{expense.label}</strong>{expense.staff?.email && <small>{expense.staff.email}</small>}</td>
                <td>{expense.periodKey}</td>
                <td>{expense.paidBy?.name || 'Administrator'}</td>
                <td>{new Date(expense.paidAt).toLocaleDateString('en-NG')}</td>
                <td className="expenses-history-amount">{formatNgn(expense.amountNgn)}</td>
              </tr>)}
              {!loading && expenses.length === 0 && <tr><td colSpan="5" className="staff-empty-row">No expenses have been marked paid yet.</td></tr>}
            </tbody>
          </table>
        </div>
        {expenses.length >= 500 && <p className="expenses-history-note">Showing the latest 500 expenses.</p>}
      </section>
    </section>
  )
}
