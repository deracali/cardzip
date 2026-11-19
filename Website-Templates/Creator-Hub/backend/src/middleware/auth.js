import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function setSessionCookie(response, userId) {
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
  response.cookie('creatorhub_session', jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearSessionCookie(response) {
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
  response.clearCookie('creatorhub_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  })
}

export async function requireAuth(request, response, next) {
  const token = request.cookies?.creatorhub_session
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
    if (!user || !user.active) {
      clearSessionCookie(response)
      return response.status(401).json({ error: 'This account is not active.' })
    }
    request.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}

export function requireCreator(request, response, next) {
  if (request.user?.role !== 'creator') return response.status(403).json({ error: 'A creator account is required.' })
  return next()
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== 'admin') return response.status(403).json({ error: 'Platform administrator access is required.' })
  return next()
}
