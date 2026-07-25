import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runEchoChat, type ChatTurn } from '../../src/server/runEchoChat'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const message = String(body.message ?? '').trim()
    const history = (Array.isArray(body.history) ? body.history : []) as ChatTurn[]
    if (!message) {
      res.status(400).json({ error: 'empty message' })
      return
    }
    const result = await runEchoChat(message, history)
    res.status(200).json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'echo fault'
    const status = msg.includes('uplink dark') ? 503 : 500
    res.status(status).json({ error: msg })
  }
}
