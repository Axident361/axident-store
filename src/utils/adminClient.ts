export interface AdminDashboardData {
  ok: boolean
  generatedAt: string
  snapshot: {
    generatedAt: string
    storeName: string
    slogan: string
    policies: {
      freeShippingThreshold: number
      returnWindowDays: number
      standardShipDays: string
      expressShipDays: string
      currency: string
    }
    metrics: {
      revenueToday: number
      revenue7d: number
      ordersToday: number
      orders7d: number
      avgOrderValue: number
      conversionRate: number
      cartAbandonRate: number
      activeVisitors: number
      emailListSize: number
      lowStockSkus: number
      outOfStockSkus: number
      topSellers: { productId: string; units: number; revenue: number }[]
    }
    alerts: string[]
    tasks: string[]
  }
  inventory: {
    generatedAt: string
    count: number
    rows: Array<{
      productId: string
      size: string
      stock: number
      reserved: number
      available: number
      reorderPoint: number
      location: string
      name: string
      codename: string
      category: string
      price: number
      status: 'OK' | 'LOW' | 'OUT'
    }>
  }
  orders: {
    generatedAt: string
    count: number
    orders: Array<{
      id: string
      status: string
      customer: string
      total: number
      createdAt: string
      channel: string
      notes?: string
      items: Array<{ productId: string; size: string; qty: number; price: number }>
    }>
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T
}

export async function checkAdminSession(): Promise<boolean> {
  const res = await fetch('/api/admin/session', { credentials: 'include' })
  const data = await parseJson<{ authenticated?: boolean }>(res)
  return Boolean(data.authenticated)
}

export async function adminLogin(password: string): Promise<void> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const data = await parseJson<{ error?: string }>(res)
  if (!res.ok) throw new Error(data.error || 'Login failed')
}

export async function adminLogout(): Promise<void> {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const res = await fetch('/api/admin/dashboard', { credentials: 'include' })
  const data = await parseJson<AdminDashboardData & { error?: string }>(res)
  if (!res.ok) throw new Error(data.error || 'Unauthorized')
  return data
}

export async function updateAdminOrder(orderId: string, status: string): Promise<void> {
  const res = await fetch('/api/admin/orders', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, status }),
  })
  const data = await parseJson<{ error?: string; ok?: boolean }>(res)
  if (!res.ok || data.ok === false) throw new Error(data.error || 'Order update failed')
}

export async function updateAdminStock(
  productId: string,
  size: string,
  stock: number,
  reason = 'admin dashboard',
): Promise<void> {
  const res = await fetch('/api/admin/stock', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, size, stock, reason }),
  })
  const data = await parseJson<{ error?: string; ok?: boolean }>(res)
  if (!res.ok || data.ok === false) throw new Error(data.error || 'Stock update failed')
}
