import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  createSessionToken,
  getAdminPassword,
  passwordsMatch,
  sessionCookie,
} from '../lib/adminAuth'

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
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
    const password = String(body.password ?? '')
    if (!passwordsMatch(password, getAdminPassword())) {
      res.status(401).json({ ok: false, error: 'Invalid credentials' })
      return
    }
    const token = createSessionToken()
    res.setHeader('Set-Cookie', sessionCookie(token))
    res.status(200).json({ ok: true, role: 'admin' })
  } catch {
    res.status(400).json({ ok: false, error: 'Bad request' })
  }
}
