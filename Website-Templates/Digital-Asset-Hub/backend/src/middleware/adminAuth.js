import jwt from 'jsonwebtoken'
import AdminUser from '../models/AdminUser.js'

const cookieName = 'dah_admin_session'

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  }
}

export function setAdminSession(response, adminId) {
  const token = jwt.sign({ sub: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' })
  response.cookie(cookieName, token, cookieOptions())
}

export function clearAdminSession(response) {
  response.clearCookie(cookieName, cookieOptions())
}

export async function requireAdmin(request, response, next) {
  const token = request.cookies?.[cookieName]
  if (!token) return response.status(401).json({ error: 'Sign in as an administrator to continue.' })
  let claims
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    clearAdminSession(response)
    return response.status(401).json({ error: 'Your session expired. Sign in again.' })
  }
  if (claims.role !== 'admin') return response.status(403).json({ error: 'Administrator access is required.' })
  try {
    const admin = await AdminUser.findById(claims.sub)
    if (!admin || !admin.active) {
      clearAdminSession(response)
      return response.status(401).json({ error: 'This administrator account is not active.' })
    }
    request.admin = admin
    return next()
  } catch (error) {
    return next(error)
  }
}