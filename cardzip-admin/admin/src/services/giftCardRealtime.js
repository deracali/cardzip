import { io } from 'socket.io-client'
import { API_ORIGIN, getAdminToken } from './api'

export const subscribeToGiftCardTradeChanges = (onChange, onReconnect) => {
  const token = getAdminToken()
  if (typeof window === 'undefined' || !token) return () => {}

  const socket = io(API_ORIGIN, { auth: { token } })
  socket.on('giftCardTrade:changed', onChange)
  let connectedOnce = false
  socket.on('connect', () => {
    if (connectedOnce) onReconnect?.()
    connectedOnce = true
  })

  return () => socket.disconnect()
}