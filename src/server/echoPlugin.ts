import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleAdminApi } from './adminApi'
import { runEchoChat, type ChatTurn } from './runEchoChat'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(payload)
}

export function echoApiPlugin(): Plugin {
  return {
    name: 'axident-echo-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''

        if (url.startsWith('/api/admin')) {
          const handled = await handleAdminApi(req, res)
          if (handled) return
        }

        if (!url.startsWith('/api/echo')) return next()

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET' && url.split('?')[0] === '/api/echo/health') {
          sendJson(res, 200, {
            ok: true,
            live: Boolean(process.env.ANTHROPIC_API_KEY),
            store: 'AXIDENT',
            agent: 'ECHO',
          })
          return
        }

        if (req.method !== 'POST' || url.split('?')[0] !== '/api/echo/chat') {
          sendJson(res, 404, { error: 'not found' })
          return
        }

        try {
          const raw = await readBody(req)
          const parsed = JSON.parse(raw || '{}') as {
            message?: string
            history?: ChatTurn[]
          }
          const message = (parsed.message ?? '').trim()
          if (!message) {
            sendJson(res, 400, { error: 'empty message' })
            return
          }
          const result = await runEchoChat(message, parsed.history ?? [])
          sendJson(res, 200, result)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'echo fault'
          const status = msg.includes('uplink dark') ? 503 : 500
          sendJson(res, status, { error: msg })
        }
      })
    },
  }
}
