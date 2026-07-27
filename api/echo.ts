import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runEchoChat, type ChatTurn } from './lib/runEchoChat'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const action = String(req.query.action || req.query.a || '').toLowerCase()

  if (req.method === 'GET' && (action === 'health' || action === '')) {
    res.status(200).json({
      ok: true,
      live: Boolean(process.env.ANTHROPIC_API_KEY),
      store: 'AXIDENT',
      agent: 'ECHO',
    })
    return
  }

  if (req.method === 'POST' && (action === 'chat' || action === '')) {
    try {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body || '{}')
          : ((req.body ?? {}) as { message?: string; history?: ChatTurn[] })
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
    return
  }

  res.status(404).json({ error: 'not found', hint: 'Use ?action=health|chat' })
}
