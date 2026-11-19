import jwt from 'jsonwebtoken'
import ClientUser from '../models/ClientUser.js'

const cookieName = 'dah_client_session'

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

export function setClientSession(response, userId) {
  const token = jwt.sign({ sub: userId, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '7d' })
  response.cookie(cookieName, token, cookieOptions())
}

export function clearClientSession(response) {
  response.clearCookie(cookieName, cookieOptions())
}

export async function requireClient(request, response, next) {
  const token = request.cookies?.[cookieName]
  if (!token) return response.status(401).json({ error: 'Sign in to access your client dashboard.' })
  let claims
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    clearClientSession(response)
    return response.status(401).json({ error: 'Your session expired. Sign in again.' })
  }
  if (claims.role !== 'client') return response.status(403).json({ error: 'A client account is required.' })
  try {
    const user = await ClientUser.findById(claims.sub)
    if (!user || !user.active) {
      clearClientSession(response)
      return response.status(401).json({ error: 'This client account is not active.' })
    }
    request.client = user
    return next()
  } catch (error) {
    return next(error)
  }
}