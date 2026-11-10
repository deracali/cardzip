import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import CardzipLoader from '../components/CardzipLoader';

const PAGE_SIZE = 20;
const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Successful', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

const formatCurrency = (amount, currency = 'NGN') => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: currency || 'NGN',
  maximumFractionDigits: 2,
}).format(Number(amount) || 0);

const formatDate = (value) => value
  ? new Date(value).toLocaleString()
  : '—';

function AddMoneyPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    todayInflow: 0,
    todayAttempts: 0,
    todaySuccessful: 0,
    todayFailed: 0,
    todayPending: 0,
    successRate: 0,
    failedRate: 0,
    pendingRate: 0,
  });
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrentRequest = true;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (status) query.set('status', status);
    if (search) query.set('search', search);

    const loadPayments = async () => {
      try {
        const result = await adminApi.walletFunding(`?${query.toString()}`);
        if (!isCurrentRequest) return;
        setError('');
        setPayments(Array.isArray(result?.data) ? result.data : []);
        setStats((current) => ({ ...current, ...result?.stats }));
        setTotalPages(Math.max(1, Number(result?.pagination?.totalPages) || 1));
      } catch (requestError) {
        if (!isCurrentRequest) return;
        setError(requestError?.message || 'Unable to load Paystack wallet deposits.');
        setPayments([]);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };
    void loadPayments();
    return () => {
      isCurrentRequest = false;
    };
  }, [page, refreshKey, search, status]);

  const applySearch = (event) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setLoading(true);
    setPage(1);
    setSearch(nextSearch);
    if (nextSearch === search && page === 1) setRefreshKey((key) => key + 1);
  };

  const chooseStatus = (nextStatus) => {
    setLoading(true);
    setPage(1);
    setStatus(nextStatus);
    if (nextStatus === status && page === 1) setRefreshKey((key) => key + 1);
  };

  const statsCards = [
    { label: "Today's Inflow", value: formatCurrency(stats.todayInflow), detail: `${stats.todaySuccessful} successful top-ups` },
    { label: 'Success Rate', value: `${Number(stats.successRate) || 0}%`, detail: `${stats.todaySuccessful} successful` },
    { label: 'Failed Rate', value: `${Number(stats.failedRate) || 0}%`, detail: `${stats.todayFailed} failed` },
    { label: 'Pending Rate', value: `${Number(stats.pendingRate) || 0}%`, detail: `${stats.todayPending} pending` },
  ];

  return (
    <main className="add-money-page">
      <header className="add-money-header">
        <div>
          <h1>Add Money</h1>
          <p>Paystack wallet funding attempts and today’s performance.</p>
        </div>
        <button
          className="add-money-refresh"
          type="button"
          onClick={() => {
            setLoading(true);
            setRefreshKey((key) => key + 1);
          }}
          disabled={loading}
        >
          <span aria-hidden="true">↻</span> {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      <section className="stats-grid add-money-stats" aria-label="Today's Paystack stats">
        {statsCards.map((item) => (
          <article className="add-money-stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail} of {stats.todayAttempts} attempts</small>
          </article>
        ))}
      </section>

      <section className="add-money-history">
        <div className="add-money-toolbar">
          <div className="filter-tabs" role="group" aria-label="Filter deposits by status">
            {FILTERS.map((filter) => (
              <button
                className={`filter-btn${status === filter.value ? ' active' : ''}`}
                type="button"
                key={filter.value || 'all'}
                aria-pressed={status === filter.value}
                onClick={() => chooseStatus(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <form className="add-money-search" onSubmit={applySearch}>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search reference, name or email"
              aria-label="Search wallet top-ups"
            />
            <button type="submit" className="add-money-search-button">Search</button>
          </form>
        </div>

        {error && <div className="add-money-error" role="alert">{error}</div>}
        <div className="add-money-table-wrap">
          <table className="deposit-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>VAT</th>
                <th>Total Charged</th>
                <th>Channel</th>
                <th>Provider Fee</th>
                <th>Status</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="add-money-empty"><CardzipLoader compact label="Loading wallet top-ups" /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="10" className="add-money-empty">{error ? 'Could not load top-ups.' : 'No wallet top-ups found.'}</td></tr>
              ) : payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="add-money-reference">{payment.reference || payment.providerReference || '—'}</td>
                  <td>
                    <span className="add-money-customer">{payment.user?.name || 'Unknown user'}</span>
                    <small className="add-money-email">{payment.user?.email || '—'}</small>
                  </td>
                  <td>{formatCurrency(payment.amount, payment.currency)}</td>
                  <td>{formatCurrency(payment.vatAmount, payment.currency)}</td>
                  <td>{formatCurrency(Number(payment.amount || 0) + Number(payment.vatAmount || 0), payment.currency)}</td>
                  <td>{payment.channel || 'Paystack'}</td>
                  <td>{payment.providerFee == null ? '—' : formatCurrency(payment.providerFee, payment.currency)}</td>
                  <td>
                    <span className={`badge-pill ${payment.status === 'completed' ? 'successful' : payment.status}`}>
                      {payment.status === 'completed' ? 'Successful' : payment.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td className="add-money-details">{payment.failureReason || payment.providerReference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="add-money-pagination">
          <span>Page {page} of {totalPages}</span>
          <div>
            <button type="button" onClick={() => {
              setLoading(true);
              setPage((current) => Math.max(1, current - 1));
            }} disabled={page <= 1 || loading}>Previous</button>
            <button type="button" onClick={() => {
              setLoading(true);
              setPage((current) => Math.min(totalPages, current + 1));
            }} disabled={page >= totalPages || loading}>Next</button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default AddMoneyPage;
