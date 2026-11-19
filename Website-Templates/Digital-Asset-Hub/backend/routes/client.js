import { Router } from 'express'
import AdminRecord from '../src/models/AdminRecord.js'
import { requireClient } from '../src/middleware/clientAuth.js'

const router = Router()
router.use(requireClient)

router.get('/overview', async (request, response) => {
  const records = await AdminRecord.find({ email: request.client.email, kind: { $in: ['trade', 'bill', 'card', 'support'] } })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
  response.json({
    client: { name: request.client.name, email: request.client.email, createdAt: request.client.createdAt },
    records,
    totals: {
      trades: records.filter((record) => record.kind === 'trade').length,
      bills: records.filter((record) => record.kind === 'bill').length,
      cards: records.filter((record) => record.kind === 'card').length,
      openSupport: records.filter((record) => record.kind === 'support' && record.status !== 'resolved').length,
    },
  })
})

export default router