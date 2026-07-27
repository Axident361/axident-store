import type { VercelRequest, VercelResponse } from '@vercel/node'

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
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) {
      res.status(503).json({
        error: 'ECHO uplink dark — set ANTHROPIC_API_KEY then redeploy / restart the server',
      })
      return
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : ((req.body ?? {}) as { message?: string; history?: { role: string; content: string }[] })
      const message = String(body.message ?? '').trim()
      if (!message) {
        res.status(400).json({ error: 'empty message' })
        return
      }
      const history = Array.isArray(body.history) ? body.history.slice(-16) : []
      const messages = [
        ...history
          .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && h.content)
          .map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ]

      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-7',
          max_tokens: 1200,
          system:
            'You are ECHO, AXIDENT store manager. Hacker slang, sharp, useful. Brand: Embrace the Chaos. Help with products/sizing/shipping and admin ops questions. Keep replies concise.',
          messages,
        }),
      })
      const data = (await r.json()) as { content?: { type: string; text?: string }[]; error?: { message?: string } }
      if (!r.ok) {
        res.status(500).json({ error: data.error?.message || `anthropic ${r.status}` })
        return
      }
      const text = (data.content || [])
        .filter((b) => b.type === 'text' && b.text)
        .map((b) => b.text)
        .join('\n')
        .trim()
      res.status(200).json({ text: text || 'Signal empty.', productIds: [], live: true })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'echo fault' })
    }
    return
  }

  res.status(404).json({ error: 'not found', hint: 'action=health|chat' })
}
