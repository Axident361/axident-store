import type { IncomingMessage, ServerResponse } from 'node:http'
import { getStore } from './runEchoChat'
import {
  clearSessionCookie,
  createSessionToken,
  getAdminPassword,
  isAuthedRequest,
  passwordsMatch,
  sessionCookie,
} from './adminAuth'

export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string | string[]>,
) {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v)
  }
  res.end(payload)
}

function pathOnly(url: string | undefined): string {
  return (url || '').split('?')[0]
}

export async function handleAdminApi(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const path = pathOnly(req.url)
  if (!path.startsWith('/api/admin')) return false

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }

  if (path === '/api/admin/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req)
      const body = JSON.parse(raw || '{}') as { password?: string }
      const password = String(body.password ?? '')
      if (!passwordsMatch(password, getAdminPassword())) {
        sendJson(res, 401, { ok: false, error: 'Invalid credentials' })
        return true
      }
      const token = createSessionToken()
      sendJson(
        res,
        200,
        { ok: true, role: 'admin' },
        { 'Set-Cookie': sessionCookie(token) },
      )
    } catch {
      sendJson(res, 400, { ok: false, error: 'Bad request' })
    }
    return true
  }

  if (path === '/api/admin/logout' && req.method === 'POST') {
    sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() })
    return true
  }

  if (path === '/api/admin/session' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, authenticated: isAuthedRequest(req) })
    return true
  }

  if (path === '/api/admin/dashboard' && req.method === 'GET') {
    if (!isAuthedRequest(req)) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' })
      return true
    }
    const store = getStore()
    const snap = store.snapshot()
    const inventory = store.inventoryList()
    const orders = store.listOrders('all')
    sendJson(res, 200, {
      ok: true,
      generatedAt: new Date().toISOString(),
      snapshot: snap,
      inventory,
      orders,
    })
    return true
  }

  if (path === '/api/admin/orders' && req.method === 'POST') {
    if (!isAuthedRequest(req)) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' })
      return true
    }
    try {
      const raw = await readBody(req)
      const body = JSON.parse(raw || '{}') as { orderId?: string; status?: string }
      const result = getStore().updateOrderStatus(
        String(body.orderId ?? ''),
        body.status as never,
      )
      sendJson(res, result.ok ? 200 : 400, result)
    } catch {
      sendJson(res, 400, { ok: false, error: 'Bad request' })
    }
    return true
  }

  if (path === '/api/admin/stock' && req.method === 'POST') {
    if (!isAuthedRequest(req)) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' })
      return true
    }
    try {
      const raw = await readBody(req)
      const body = JSON.parse(raw || '{}') as {
        productId?: string
        size?: string
        stock?: number
        reason?: string
      }
      const result = getStore().setStock(
        String(body.productId ?? ''),
        String(body.size ?? ''),
        Number(body.stock ?? 0),
        String(body.reason ?? 'admin dashboard'),
      )
      sendJson(res, result.ok ? 200 : 400, result)
    } catch {
      sendJson(res, 400, { ok: false, error: 'Bad request' })
    }
    return true
  }

  sendJson(res, 404, { error: 'not found' })
  return true
}
