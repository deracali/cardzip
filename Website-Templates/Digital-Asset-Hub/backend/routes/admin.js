import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import AdminUser from '../src/models/AdminUser.js'
import AdminRecord from '../src/models/AdminRecord.js'
import AdminSettings from '../src/models/AdminSettings.js'
import ClientUser from '../src/models/ClientUser.js'
import { clearAdminSession, requireAdmin, setAdminSession } from '../src/middleware/adminAuth.js'

const router = Router()
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false })
const recordKinds = new Set(['trade', 'bill', 'card', 'customer', 'support'])
const statuses = new Set(['pending', 'processing', 'completed', 'flagged', 'rejected', 'open', 'resolved', 'active', 'suspended'])

router.post('/login', loginLimit, async (request, response) => {
  const { email, password } = request.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || password.length > 128) {
    return response.status(400).json({ error: 'Enter the administrator email and password.' })
  }
  const admin = await AdminUser.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!admin || !admin.active || !(await bcrypt.compare(password, admin.passwordHash))) {
    return response.status(401).json({ error: 'Email or password is incorrect.' })
  }
  setAdminSession(response, admin.id)
  return response.json({ admin: admin.toJSON() })
})

router.post('/logout', (_request, response) => {
  clearAdminSession(response)
  return response.json({ success: true })
})

router.get('/session', requireAdmin, (request, response) => response.json({ admin: request.admin.toJSON() }))

router.use(requireAdmin)

router.get('/overview', async (_request, response) => {
  const [counts, records] = await Promise.all([
    AdminRecord.aggregate([
      {
        $group: {
          _id: '$kind',
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'processing', 'open', 'flagged']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    AdminRecord.find().sort({ createdAt: -1 }).limit(8).lean(),
  ])
  const byKind = Object.fromEntries(counts.map(({ _id, total, pending }) => [_id, { total, pending }]))
  response.json({
    metrics: {
      trades: byKind.trade?.total || 0,
      bills: byKind.bill?.total || 0,
      cards: byKind.card?.total || 0,
      customers: byKind.customer?.total || 0,
      pending: counts.reduce((total, item) => total + item.pending, 0),
    },
    recent: records,
  })
})

router.get('/records/:kind', async (request, response) => {
  if (!recordKinds.has(request.params.kind)) return response.status(404).json({ error: 'Admin page not found.' })
  const records = await AdminRecord.find({ kind: request.params.kind }).sort({ createdAt: -1 }).limit(300).lean()
  response.json({ records })
})

router.patch('/records/:id', async (request, response) => {
  const { status, active } = request.body ?? {}
  if ((status !== undefined && !statuses.has(status)) || (active !== undefined && typeof active !== 'boolean')
    || Object.keys(request.body ?? {}).length === 0
    || Object.keys(request.body).some((key) => !['status', 'active'].includes(key))) {
    return response.status(400).json({ error: 'Update a valid record status or active state.' })
  }
  const changes = {}
  if (status !== undefined) changes.status = status
  if (active !== undefined) changes.active = active
  const record = await AdminRecord.findByIdAndUpdate(request.params.id, { $set: changes }, { new: true, runValidators: true })
  if (!record) return response.status(404).json({ error: 'Admin record not found.' })
  if (record.kind === 'customer' && (status === 'active' || status === 'suspended')) {
    await ClientUser.findOneAndUpdate({ email: record.email }, { $set: { active: status === 'active' } })
  }
  response.json({ record })
})

router.get('/settings', async (_request, response) => {
  const settings = await AdminSettings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean()
  response.json({ settings })
})

router.put('/settings', async (request, response) => {
  const { supportEmail, maintenanceMode, rates } = request.body ?? {}
  if (typeof supportEmail !== 'string' || supportEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)
    || typeof maintenanceMode !== 'boolean' || !Array.isArray(rates) || rates.length > 50
    || rates.some((rate) => typeof rate.asset !== 'string' || !rate.asset.trim() || rate.asset.length > 60
      || !Number.isFinite(rate.payoutRate) || rate.payoutRate < 0
      || typeof rate.currency !== 'string' || !/^[A-Z]{3,8}$/.test(rate.currency))) {
    return response.status(400).json({ error: 'Provide a valid support email, maintenance state, and rate list.' })
  }
  const settings = await AdminSettings.findOneAndUpdate(
    { key: 'main' },
    { $set: { supportEmail: supportEmail.trim(), maintenanceMode, rates } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  response.json({ settings })
})

export default router