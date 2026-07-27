import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'axident_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12h

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ANTHROPIC_API_KEY ||
    'axident-dev-session-secret-change-me'
  )
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'axident-chaos'
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

function sign(payload: string): string {
  return b64url(createHmac('sha256', secret()).update(payload).digest())
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS
  const nonce = randomBytes(8).toString('hex')
  const payload = b64url(JSON.stringify({ role: 'admin', exp, nonce }))
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !token.includes('.')) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = sign(payload)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
    const data = JSON.parse(fromB64url(payload).toString('utf8')) as {
      role?: string
      exp?: number
    }
    if (data.role !== 'admin') return false
    if (typeof data.exp !== 'number' || Date.now() > data.exp) return false
    return true
  } catch {
    return false
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

export function getSessionFromRequest(req: {
  headers?: { cookie?: string; authorization?: string }
}): string | null {
  const cookies = parseCookies(req.headers?.cookie)
  if (cookies[COOKIE_NAME]) return cookies[COOKIE_NAME]
  const auth = req.headers?.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()
  return null
}

export function isAuthedRequest(req: {
  headers?: { cookie?: string; authorization?: string }
}): boolean {
  return verifySessionToken(getSessionFromRequest(req))
}

export function sessionCookie(token: string, maxAgeSec = SESSION_TTL_MS / 1000): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${Math.floor(maxAgeSec)}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function passwordsMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input)
  const b = Buffer.from(expected)
  if (a.length !== b.length) {
    // still do a compare to reduce timing oracle on length alone
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32))
    return false
  }
  return timingSafeEqual(a, b)
}

export { COOKIE_NAME }
