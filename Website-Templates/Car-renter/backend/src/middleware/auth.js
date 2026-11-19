import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function createSessionToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function setSessionCookie(response, userId) {
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
  response.cookie('voltigo_session', createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearSessionCookie(response) {
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
  response.clearCookie('voltigo_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  })
}

export async function requireAuth(request, response, next) {
  const token = request.cookies?.voltigo_session
  if (!token) return response.status(401).json({ error: 'Sign in to continue.' })

  let claims
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    clearSessionCookie(response)
    return response.status(401).json({ error: 'Your session expired. Sign in again.' })
  }

  try {
    const user = await User.findById(claims.sub)
    if (!user) {
      clearSessionCookie(response)
      return response.status(401).json({ error: 'Your account is no longer available.' })
    }
    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== 'admin') {
    return response.status(403).json({ error: 'Administrator access is required.' })
  }
  next()
}
