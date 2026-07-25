import type { Product, ProductCategory } from '../types'

export interface InventorySku {
  productId: string
  size: string
  stock: number
  reserved: number
  reorderPoint: number
  location: string
  lastRestockAt: string
}

export interface OrderRecord {
  id: string
  status: 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  customer: string
  items: { productId: string; size: string; qty: number; price: number }[]
  total: number
  createdAt: string
  channel: 'web' | 'custom-drip' | 'wholesale'
  notes?: string
}

export interface StoreMetrics {
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

function seedInventory(products: Product[]): InventorySku[] {
  const rows: InventorySku[] = []
  const base: Record<string, number> = {
    'neon-void-tee': 42,
    'ghost-protocol-hoodie': 28,
    'blade-runner-jacket': 9,
    'signal-jammer-tee': 55,
    'data-rain-hoodie': 18,
    'chrome-district-jacket': 12,
    'hologram-cap': 64,
    'night-market-beanie': 37,
    'zero-day-tee': 40,
    'firewall-hoodie': 22,
    'sector-7-jacket': 7,
    'deck-runner-gloves': 31,
  }
  const locations = ['NODE-A1', 'NODE-A2', 'NODE-B1', 'VAULT-7', 'DOCK-3']
  let i = 0
  for (const p of products) {
    for (const size of p.sizes) {
      const sizeBias = size === 'M' || size === 'L' ? 1.2 : size === 'XXL' || size === 'OS' ? 0.7 : 1
      const stock = Math.max(0, Math.round((base[p.id] ?? 20) * sizeBias * (0.55 + (i % 5) * 0.1)))
      const reorderPoint = Math.max(3, Math.round(stock * 0.25))
      rows.push({
        productId: p.id,
        size,
        stock,
        reserved: Math.min(stock, Math.floor(stock * 0.08)),
        reorderPoint,
        location: locations[i % locations.length],
        lastRestockAt: new Date(Date.now() - (i % 12) * 86400000).toISOString(),
      })
      i += 1
    }
  }
  if (rows[2]) rows[2].stock = 2
  if (rows[10]) rows[10].stock = 0
  if (rows[18]) rows[18].stock = 1
  return rows
}

function seedOrders(): OrderRecord[] {
  const now = Date.now()
  return [
    {
      id: 'ORD-8841',
      status: 'paid',
      customer: 'runner_77@void.net',
      items: [
        { productId: 'ghost-protocol-hoodie', size: 'L', qty: 1, price: 98 },
        { productId: 'hologram-cap', size: 'OS', qty: 1, price: 36 },
      ],
      total: 134,
      createdAt: new Date(now - 2 * 3600000).toISOString(),
      channel: 'web',
      notes: 'Gift wrap + blacklight card',
    },
    {
      id: 'ORD-8837',
      status: 'packed',
      customer: 'nova.k@sector7.io',
      items: [{ productId: 'blade-runner-jacket', size: 'M', qty: 1, price: 220 }],
      total: 220,
      createdAt: new Date(now - 9 * 3600000).toISOString(),
      channel: 'web',
    },
    {
      id: 'ORD-8829',
      status: 'shipped',
      customer: 'glitch@night.market',
      items: [
        { productId: 'signal-jammer-tee', size: 'XL', qty: 2, price: 42 },
        { productId: 'deck-runner-gloves', size: 'L/XL', qty: 1, price: 32 },
      ],
      total: 116,
      createdAt: new Date(now - 30 * 3600000).toISOString(),
      channel: 'web',
    },
    {
      id: 'ORD-8812',
      status: 'pending',
      customer: 'custom@axident.local',
      items: [{ productId: 'zero-day-tee', size: 'M', qty: 1, price: 45 }],
      total: 45,
      createdAt: new Date(now - 45 * 60000).toISOString(),
      channel: 'custom-drip',
      notes: '1-of-1 back print pending design approval',
    },
    {
      id: 'ORD-8790',
      status: 'refunded',
      customer: 'echo.fan@mail.void',
      items: [{ productId: 'night-market-beanie', size: 'OS', qty: 1, price: 28 }],
      total: 28,
      createdAt: new Date(now - 4 * 86400000).toISOString(),
      channel: 'web',
      notes: 'Wrong size - exchange offered',
    },
  ]
}

export function createStoreState(products: Product[]) {
  const inventory = seedInventory(products)
  const orders = seedOrders()
  const emailListSize = 1284
  let activeVisitors = 17

  const productMap = () => new Map(products.map((p) => [p.id, p]))
  const available = (sku: InventorySku) => Math.max(0, sku.stock - sku.reserved)

  function metrics(): StoreMetrics {
    const paidish = orders.filter((o) =>
      ['paid', 'packed', 'shipped', 'delivered'].includes(o.status),
    )
    const revenue7d = paidish.reduce((s, o) => s + o.total, 0) + 1840
    const revenueToday = paidish
      .filter((o) => Date.now() - new Date(o.createdAt).getTime() < 86400000)
      .reduce((s, o) => s + o.total, 0)
    const ordersToday = orders.filter(
      (o) => Date.now() - new Date(o.createdAt).getTime() < 86400000,
    ).length
    const units: Record<string, { units: number; revenue: number }> = {}
    for (const o of paidish) {
      for (const it of o.items) {
        units[it.productId] ??= { units: 0, revenue: 0 }
        units[it.productId].units += it.qty
        units[it.productId].revenue += it.qty * it.price
      }
    }
    const topSellers = Object.entries(units)
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)
    const low = inventory.filter((s) => available(s) > 0 && available(s) <= s.reorderPoint).length
    const out = inventory.filter((s) => available(s) <= 0).length
    return {
      revenueToday,
      revenue7d,
      ordersToday,
      orders7d: paidish.length + 23,
      avgOrderValue: Math.round((revenue7d / Math.max(1, paidish.length + 23)) * 100) / 100,
      conversionRate: 3.4,
      cartAbandonRate: 61.2,
      activeVisitors,
      emailListSize,
      lowStockSkus: low,
      outOfStockSkus: out,
      topSellers,
    }
  }

  function alerts(): string[] {
    const a: string[] = []
    const m = metrics()
    if (m.outOfStockSkus > 0) a.push(`${m.outOfStockSkus} SKU(s) hard-zero - restock or unpublish`)
    if (m.lowStockSkus > 0) a.push(`${m.lowStockSkus} SKU(s) under reorder point`)
    const pending = orders.filter((o) => o.status === 'pending' || o.status === 'paid')
    if (pending.length) a.push(`${pending.length} order(s) waiting ops action`)
    const custom = orders.filter((o) => o.channel === 'custom-drip' && o.status === 'pending')
    if (custom.length) a.push(`${custom.length} custom drip job(s) need design lock`)
    if (m.cartAbandonRate > 55) a.push('Cart abandon elevated - push recovery scripts')
    return a
  }

  return {
    snapshot() {
      activeVisitors = Math.max(3, activeVisitors + (Math.random() > 0.5 ? 1 : -1))
      return {
        generatedAt: new Date().toISOString(),
        storeName: 'AXIDENT',
        slogan: 'Embrace the Chaos',
        policies: {
          freeShippingThreshold: 150,
          returnWindowDays: 30,
          standardShipDays: '3-6',
          expressShipDays: '1-2',
          currency: 'USD',
        },
        metrics: metrics(),
        inventory: inventory.map((r) => ({ ...r })),
        openOrders: orders.filter(
          (o) => !['delivered', 'cancelled', 'refunded'].includes(o.status),
        ),
        alerts: alerts(),
        tasks: [
          'Clear paid queue -> pack station',
          'Restock zeroed SKUs from VAULT-7',
          'Approve custom drip art for ORD pending',
          'Pull 7d top sellers for next drop brief',
          'Verify free-ship threshold messaging on PDP',
        ],
      }
    },
    inventoryList(filter?: {
      category?: ProductCategory | 'all'
      lowOnly?: boolean
      outOnly?: boolean
      productId?: string
      q?: string
    }) {
      const map = productMap()
      let rows = inventory.map((sku) => {
        const p = map.get(sku.productId)!
        const avail = available(sku)
        return {
          ...sku,
          available: avail,
          name: p.name,
          codename: p.codename,
          category: p.category,
          price: p.price,
          status: (avail <= 0 ? 'OUT' : avail <= sku.reorderPoint ? 'LOW' : 'OK') as
            | 'OUT'
            | 'LOW'
            | 'OK',
        }
      })
      if (filter?.productId) rows = rows.filter((r) => r.productId === filter.productId)
      if (filter?.category && filter.category !== 'all') {
        rows = rows.filter((r) => r.category === filter.category)
      }
      if (filter?.lowOnly) rows = rows.filter((r) => r.status === 'LOW')
      if (filter?.outOnly) rows = rows.filter((r) => r.status === 'OUT')
      if (filter?.q) {
        const q = filter.q.toLowerCase()
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.codename.toLowerCase().includes(q) ||
            r.productId.includes(q) ||
            r.size.toLowerCase().includes(q),
        )
      }
      return {
        generatedAt: new Date().toISOString(),
        count: rows.length,
        rows: rows.sort((a, b) => a.available - b.available || a.name.localeCompare(b.name)),
      }
    },
    adjustStock(productId: string, size: string, delta: number, reason: string) {
      const sku = inventory.find((s) => s.productId === productId && s.size === size)
      if (!sku) return { ok: false as const, error: 'SKU not found' }
      sku.stock = Math.max(0, sku.stock + delta)
      if (delta > 0) sku.lastRestockAt = new Date().toISOString()
      return {
        ok: true as const,
        reason,
        sku: { ...sku, available: available(sku) },
        generatedAt: new Date().toISOString(),
      }
    },
    setStock(productId: string, size: string, stock: number, reason: string) {
      const sku = inventory.find((s) => s.productId === productId && s.size === size)
      if (!sku) return { ok: false as const, error: 'SKU not found' }
      sku.stock = Math.max(0, Math.floor(stock))
      sku.lastRestockAt = new Date().toISOString()
      return {
        ok: true as const,
        reason,
        sku: { ...sku, available: available(sku) },
        generatedAt: new Date().toISOString(),
      }
    },
    listOrders(status?: OrderRecord['status'] | 'open' | 'all') {
      let list = [...orders]
      if (status === 'open') {
        list = list.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status))
      } else if (status && status !== 'all') {
        list = list.filter((o) => o.status === status)
      }
      return {
        generatedAt: new Date().toISOString(),
        count: list.length,
        orders: list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      }
    },
    updateOrderStatus(orderId: string, status: OrderRecord['status']) {
      const o = orders.find((x) => x.id === orderId)
      if (!o) return { ok: false as const, error: 'Order not found' }
      o.status = status
      return { ok: true as const, order: { ...o }, generatedAt: new Date().toISOString() }
    },
    catalogBrief() {
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        codename: p.codename,
        category: p.category,
        price: p.price,
        sizes: p.sizes,
        colors: p.colors,
        tags: p.tags,
        featured: !!p.featured,
        description: p.description,
      }))
    },
    searchProducts(q: string) {
      const query = q.toLowerCase()
      const hits = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.codename.toLowerCase().includes(query) ||
          p.category.includes(query) ||
          p.tags.some((t) => t.includes(query) || query.includes(t)) ||
          p.description.toLowerCase().includes(query),
      )
      return {
        generatedAt: new Date().toISOString(),
        count: hits.length,
        products: hits.map((p) => ({
          id: p.id,
          name: p.name,
          codename: p.codename,
          category: p.category,
          price: p.price,
          tags: p.tags,
          featured: !!p.featured,
        })),
      }
    },
    metrics,
  }
}

export type StoreState = ReturnType<typeof createStoreState>
