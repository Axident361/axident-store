import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  clearSessionCookie,
  createSessionToken,
  getAdminPassword,
  isAuthedRequest,
  passwordsMatch,
  sessionCookie,
} from './lib/adminAuth'
import { getStore } from './lib/runEchoChat'

function setNoStore(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setNoStore(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const action = String(req.query.action || req.query.a || '').toLowerCase()
  const body =
    typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : ((req.body ?? {}) as Record<string, unknown>)

  try {
    if (req.method === 'POST' && action === 'login') {
      const password = String(body.password ?? '')
      if (!passwordsMatch(password, getAdminPassword())) {
        res.status(401).json({ ok: false, error: 'Invalid credentials' })
        return
      }
      res.setHeader('Set-Cookie', sessionCookie(createSessionToken()))
      res.status(200).json({ ok: true, role: 'admin' })
      return
    }

    if (req.method === 'POST' && action === 'logout') {
      res.setHeader('Set-Cookie', clearSessionCookie())
      res.status(200).json({ ok: true })
      return
    }

    if (req.method === 'GET' && (action === 'session' || action === '')) {
      // default GET without action => session for convenience? require explicit
    }

    if (req.method === 'GET' && action === 'session') {
      res.status(200).json({ ok: true, authenticated: isAuthedRequest(req) })
      return
    }

    if (req.method === 'GET' && action === 'dashboard') {
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
      return
    }

    if (req.method === 'POST' && action === 'orders') {
      if (!isAuthedRequest(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' })
        return
      }
      const result = getStore().updateOrderStatus(String(body.orderId ?? ''), body.status as never)
      res.status(result.ok ? 200 : 400).json(result)
      return
    }

    if (req.method === 'POST' && action === 'stock') {
      if (!isAuthedRequest(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' })
        return
      }
      const result = getStore().setStock(
        String(body.productId ?? ''),
        String(body.size ?? ''),
        Number(body.stock ?? 0),
        String(body.reason ?? 'admin dashboard'),
      )
      res.status(result.ok ? 200 : 400).json(result)
      return
    }

    res.status(404).json({
      error: 'not found',
      hint: 'Use ?action=login|logout|session|dashboard|orders|stock',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'admin fault'
    res.status(500).json({ ok: false, error: msg })
  }
}
