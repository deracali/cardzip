import { ArrowRight, ShoppingBag } from 'lucide-react'

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

export default function OrderAndGiftCardManager({
  orders = [],
  giftCards = [],
  orderStats = {},
  giftCardStats = {},
  loading = false,
  onViewOrders,
  onViewGiftCards,
}) {
  const latestOrder = orders[0]
  const latestGiftCard = giftCards[0]

  return (
    <div className="manager-wrapper">
      <div className="manager-card">
        <div className="section-header">
          <div className="title-row"><h3 className="section-title">E-commerce orders</h3><span className="badge-transit">{Number(orderStats.processing || 0).toLocaleString('en-NG')} processing</span></div>
          <button type="button" className="overview-inline-link" onClick={onViewOrders}>View orders <ArrowRight size={13} /></button>
        </div>
        {latestOrder ? (
          <div className="order-item-row">
            <div className="item-left"><div className="item-icon-box"><ShoppingBag size={16} /></div>
              <div className="item-details"><span className="item-title">{latestOrder.orderNumber} · {latestOrder.items?.map((item) => `${item.name} ×${item.quantity}`).join(', ') || 'Store order'}</span>
                <span className="item-subtext">{latestOrder.user?.name || latestOrder.user?.email || 'Customer'} · {formatNaira(latestOrder.total)} · {latestOrder.paymentStatus}</span></div>
            </div>
            <span className={`overview-history-status ${latestOrder.status}`}>{latestOrder.status}</span>
          </div>
        ) : <p className="overview-card-empty">{loading ? 'Loading e-commerce order history…' : 'No e-commerce orders in this period.'}</p>}
        <div className="overview-manager-footer">{Number(orderStats.total || 0).toLocaleString('en-NG')} orders · {formatNaira(orderStats.paidVolume)} paid volume</div>
      </div>

      <div className="manager-card">
        <div className="section-header">
          <div className="title-row"><h3 className="section-title">Gift card trades</h3><span className="badge-payout">{Number(giftCardStats.pending || 0).toLocaleString('en-NG')} pending</span></div>
          <button type="button" className="overview-inline-link" onClick={onViewGiftCards}>View trades <ArrowRight size={13} /></button>
        </div>
        {latestGiftCard ? (
          <div className="trade-item-row">
            <div className="item-left"><div className="itunes-icon-box">{String(latestGiftCard.type || 'GC').slice(0, 2).toUpperCase()}</div>
              <div className="item-details"><span className="item-title">{latestGiftCard.type} · {latestGiftCard.amount} {latestGiftCard.currency}</span>
                <span className="item-subtext">{latestGiftCard.user?.name || latestGiftCard.user?.email || 'Customer'} · Payout {formatNaira(latestGiftCard.ngnAmount)}</span></div>
            </div>
            <span className={`overview-history-status ${latestGiftCard.status}`}>{latestGiftCard.status}</span>
          </div>
        ) : <p className="overview-card-empty">{loading ? 'Loading gift card trade history…' : 'No gift card trades in this period.'}</p>}
        <div className="overview-manager-footer">{Number(giftCardStats.total || 0).toLocaleString('en-NG')} trades · {formatNaira(giftCardStats.payoutVolume)} successful payout volume</div>
      </div>
    </div>
  )
}
