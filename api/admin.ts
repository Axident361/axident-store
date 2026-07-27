import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const COOKIE = 'axident_admin_session'
const TTL = 1000 * 60 * 60 * 12

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ANTHROPIC_API_KEY || 'axident-dev-session-secret-change-me'
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'axident-chaos'
}

function b64url(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromB64url(input: string) {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64')
}

function sign(payload: string) {
  return b64url(createHmac('sha256', secret()).update(payload).digest())
}

function createToken() {
  const exp = Date.now() + TTL
  const nonce = randomBytes(8).toString('hex')
  const payload = b64url(JSON.stringify({ role: 'admin', exp, nonce }))
  return `${payload}.${sign(payload)}`
}

function verifyToken(token?: string | null) {
  if (!token || !token.includes('.')) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = sign(payload)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
    const data = JSON.parse(fromB64url(payload).toString('utf8')) as { role?: string; exp?: number }
    return data.role === 'admin' && typeof data.exp === 'number' && Date.now() <= data.exp
  } catch {
    return false
  }
}

function parseCookies(header?: string) {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    const k = part.slice(0, i).trim()
    const v = part.slice(i + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

function getToken(req: VercelRequest) {
  const cookies = parseCookies(req.headers.cookie)
  if (cookies[COOKIE]) return cookies[COOKIE]
  const auth = req.headers.authorization
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7).trim()
  return null
}

function isAuthed(req: VercelRequest) {
  return verifyToken(getToken(req))
}

function cookie(token: string, maxAge = TTL / 1000) {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  const parts = [`${COOKIE}=${encodeURIComponent(token)}`, 'Path=/', `Max-Age=${Math.floor(maxAge)}`, 'HttpOnly', 'SameSite=Lax']
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

function clearCookie() {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  const parts = [`${COOKIE}=`, 'Path=/', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax']
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

function passwordsMatch(input: string, expected: string) {
  const a = Buffer.from(String(input || ''))
  const b = Buffer.from(String(expected || ''))
  if (a.length !== b.length) {
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32))
    return false
  }
  return timingSafeEqual(a, b)
}

// Lightweight in-memory ops data for admin dashboard (demo)
type Inv = { productId: string; codename: string; name: string; size: string; stock: number; reserved: number; location: string; category: string; price: number }
type Ord = { id: string; status: string; customer: string; total: number; createdAt: string; channel: string; notes?: string; items: { productId: string; size: string; qty: number; price: number }[] }

const g = globalThis as typeof globalThis & { __axAdmin?: { inv: Inv[]; orders: Ord[] } }
function state() {
  if (!g.__axAdmin) {
    g.__axAdmin = {
      inv: [
        { productId: 'neon-void-tee', codename: 'NV-01', name: 'Neon Void Tee', size: 'M', stock: 24, reserved: 2, location: 'NODE-A1', category: 'tees', price: 48 },
        { productId: 'ghost-protocol-hoodie', codename: 'GP-07', name: 'Ghost Protocol Hoodie', size: 'L', stock: 12, reserved: 1, location: 'NODE-A2', category: 'hoodies', price: 98 },
        { productId: 'blade-runner-jacket', codename: 'BR-2049', name: 'Blade Runner Jacket', size: 'M', stock: 2, reserved: 0, location: 'VAULT-7', category: 'jackets', price: 220 },
        { productId: 'hologram-cap', codename: 'HC-09', name: 'Hologram Cap', size: 'OS', stock: 0, reserved: 0, location: 'DOCK-3', category: 'accessories', price: 36 },
        { productId: 'signal-jammer-tee', codename: 'SJ-12', name: 'Signal Jammer Tee', size: 'XL', stock: 18, reserved: 1, location: 'NODE-B1', category: 'tees', price: 42 },
        { productId: 'data-rain-hoodie', codename: 'DR-33', name: 'Data Rain Hoodie', size: 'L', stock: 7, reserved: 1, location: 'NODE-A2', category: 'hoodies', price: 110 },
      ],
      orders: [
        { id: 'ORD-8841', status: 'paid', customer: 'runner_77@void.net', total: 134, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), channel: 'web', items: [{ productId: 'ghost-protocol-hoodie', size: 'L', qty: 1, price: 98 }, { productId: 'hologram-cap', size: 'OS', qty: 1, price: 36 }] },
        { id: 'ORD-8837', status: 'packed', customer: 'nova.k@sector7.io', total: 220, createdAt: new Date(Date.now() - 9 * 3600000).toISOString(), channel: 'web', items: [{ productId: 'blade-runner-jacket', size: 'M', qty: 1, price: 220 }] },
        { id: 'ORD-8812', status: 'pending', customer: 'custom@axident.local', total: 45, createdAt: new Date(Date.now() - 45 * 60000).toISOString(), channel: 'custom-drip', notes: '1-of-1 pending art', items: [{ productId: 'zero-day-tee', size: 'M', qty: 1, price: 45 }] },
      ],
    }
  }
  return g.__axAdmin
}

function rows() {
  return state().inv.map((r) => {
    const available = Math.max(0, r.stock - r.reserved)
    const reorderPoint = Math.max(3, Math.round(r.stock * 0.25) || 3)
    const status = available <= 0 ? 'OUT' : available <= reorderPoint ? 'LOW' : 'OK'
    return { ...r, available, reorderPoint, status }
  })
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const action = String(req.query.action || req.query.a || '').toLowerCase()
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : ((req.body ?? {}) as Record<string, unknown>)

  try {
    if (req.method === 'POST' && action === 'login') {
      const password = String(body.password ?? '')
      if (!passwordsMatch(password, adminPassword())) {
        res.status(401).json({ ok: false, error: 'Invalid credentials' })
        return
      }
      res.setHeader('Set-Cookie', cookie(createToken()))
      res.status(200).json({ ok: true, role: 'admin' })
      return
    }

    if (req.method === 'POST' && action === 'logout') {
      res.setHeader('Set-Cookie', clearCookie())
      res.status(200).json({ ok: true })
      return
    }

    if (req.method === 'GET' && action === 'session') {
      res.status(200).json({ ok: true, authenticated: isAuthed(req) })
      return
    }

    if (req.method === 'GET' && action === 'dashboard') {
      if (!isAuthed(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' })
        return
      }
      const inv = rows()
      const low = inv.filter((r) => r.status === 'LOW').length
      const out = inv.filter((r) => r.status === 'OUT').length
      const orders = state().orders
      res.status(200).json({
        ok: true,
        generatedAt: new Date().toISOString(),
        snapshot: {
          generatedAt: new Date().toISOString(),
          storeName: 'AXIDENT',
          slogan: 'Embrace the Chaos',
          policies: { freeShippingThreshold: 150, returnWindowDays: 30, standardShipDays: '3-6', expressShipDays: '1-2', currency: 'USD' },
          metrics: {
            revenueToday: 354,
            revenue7d: 2414,
            ordersToday: 2,
            orders7d: 26,
            avgOrderValue: 92.85,
            conversionRate: 3.4,
            cartAbandonRate: 61.2,
            activeVisitors: 17,
            emailListSize: 1284,
            lowStockSkus: low,
            outOfStockSkus: out,
            topSellers: [
              { productId: 'ghost-protocol-hoodie', units: 4, revenue: 392 },
              { productId: 'blade-runner-jacket', units: 2, revenue: 440 },
            ],
          },
          alerts: [
            out ? `${out} SKU(s) hard-zero - restock or unpublish` : null,
            low ? `${low} SKU(s) under reorder point` : null,
            '1 custom drip job(s) need design lock',
          ].filter(Boolean),
          tasks: [
            'Clear paid queue -> pack station',
            'Restock zeroed SKUs from VAULT-7',
            'Approve custom drip art for ORD pending',
          ],
        },
        inventory: { generatedAt: new Date().toISOString(), count: inv.length, rows: inv },
        orders: { generatedAt: new Date().toISOString(), count: orders.length, orders },
      })
      return
    }

    if (req.method === 'POST' && action === 'orders') {
      if (!isAuthed(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' })
        return
      }
      const order = state().orders.find((o) => o.id === String(body.orderId ?? ''))
      if (!order) {
        res.status(400).json({ ok: false, error: 'Order not found' })
        return
      }
      order.status = String(body.status ?? order.status)
      res.status(200).json({ ok: true, order })
      return
    }

    if (req.method === 'POST' && action === 'stock') {
      if (!isAuthed(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' })
        return
      }
      const row = state().inv.find((r) => r.productId === String(body.productId ?? '') && r.size === String(body.size ?? ''))
      if (!row) {
        res.status(400).json({ ok: false, error: 'SKU not found' })
        return
      }
      row.stock = Math.max(0, Math.floor(Number(body.stock ?? 0)))
      res.status(200).json({ ok: true, sku: row, reason: String(body.reason ?? 'admin dashboard') })
      return
    }

    res.status(404).json({ error: 'not found', hint: 'action=login|logout|session|dashboard|orders|stock' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'admin fault' })
  }
}
