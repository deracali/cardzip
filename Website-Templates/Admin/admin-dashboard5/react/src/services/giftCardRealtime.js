import { io } from 'socket.io-client'
import { API_ORIGIN, getUserToken } from './api'

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
  const token = getUserToken()
  if (typeof window === 'undefined' || !token) return () => {}

  const socket = io(API_ORIGIN, { auth: { token } })
  socket.on('giftCardTrade:changed', (trade) => {
    onChange(trade)
    if (trade?.status === 'successful') window.dispatchEvent(new Event('cardzip-wallet-changed'))
  })
  let connectedOnce = false
  socket.on('connect', () => {
    if (connectedOnce) onReconnect?.()
    connectedOnce = true
  })

  return () => socket.disconnect()
}