import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthedRequest } from '../lib/adminAuth'
import { getStore } from '../lib/runEchoChat'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }
  if (!isAuthedRequest(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return
  }
  const store = getStore()
  res.status(200).json({
    ok: true,
    generatedAt: new Date().toISOString(),
    snapshot: store.snapshot(),
    inventory: store.inventoryList(),
    orders: store.listOrders('all'),
  })
}
