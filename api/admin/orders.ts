import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthedRequest } from '../lib/adminAuth'
import { getStore } from '../lib/runEchoChat'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }
  if (!isAuthedRequest(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
    const result = getStore().updateOrderStatus(String(body.orderId ?? ''), body.status)
    res.status(result.ok ? 200 : 400).json(result)
  } catch {
    res.status(400).json({ ok: false, error: 'Bad request' })
  }
}
