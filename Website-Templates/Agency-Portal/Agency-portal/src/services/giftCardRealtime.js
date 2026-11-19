const LOCAL_TRADE_EVENT = 'cardzip-gift-card-trade-changed'
const LOCAL_DATA_KEY = 'cardzip-react-local-data-v1'

export const mergeGiftCardTrades = (currentTrades, incomingTrades, limit = 2) => {
  const tradesById = new Map((currentTrades || []).map((trade) => [String(trade._id), trade]))
  const updates = Array.isArray(incomingTrades) ? incomingTrades : [incomingTrades]
  updates.forEach((trade) => {
    if (!trade?._id) return
    const id = String(trade._id)
    tradesById.set(id, { ...tradesById.get(id), ...trade })
  })
  return [...tradesById.values()]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, limit)
}

export const subscribeToGiftCardTradeChanges = (onChange, onReconnect) => {
  if (typeof window === 'undefined') return () => {}
  const handleLocalChange = (event) => {
    if (event.detail) onChange(event.detail)
  }
  const handleStorageChange = (event) => {
    if (event.key !== LOCAL_DATA_KEY || !event.newValue) return
    try {
      const state = JSON.parse(event.newValue)
      const trades = state.resources?.['/gift-cards/my']
      if (Array.isArray(trades)) onReconnect?.()
    } catch (error) {
      console.error('Could not read locally saved gift card trades:', error)
    }
  }
  window.addEventListener(LOCAL_TRADE_EVENT, handleLocalChange)
  window.addEventListener('storage', handleStorageChange)
  return () => {
    window.removeEventListener(LOCAL_TRADE_EVENT, handleLocalChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}