import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const cookieName = 'carewell_session'

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

export function setSession(response, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
  response.cookie(cookieName, token, cookieOptions())
}

export function clearSession(response) {
  response.clearCookie(cookieName, cookieOptions())
}

export async function requireUser(request, response, next) {
  const token = request.cookies?.[cookieName]
  if (!token) return response.status(401).json({ error: 'Sign in to continue.' })
  let claims
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    clearSession(response)
    return response.status(401).json({ error: 'Your session expired. Sign in again.' })
  }
  try {
    const user = await User.findById(claims.sub)
    if (!user || !user.active) {
      clearSession(response)
      return response.status(401).json({ error: 'This account is not active.' })
    }
    request.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user?.role)) return response.status(403).json({ error: 'Your account does not have access to this page.' })
    return next()
  }
}

export function requireApprovedProvider(request, response, next) {
  if (request.user?.role !== 'provider') return response.status(403).json({ error: 'A provider account is required.' })
  if (request.user.providerStatus !== 'approved') return response.status(403).json({ error: 'Your provider profile is awaiting administrator approval.' })
  return next()
}