import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthedRequest } from '../../src/server/adminAuth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }
  res.status(200).json({ ok: true, authenticated: isAuthedRequest(req) })
}
