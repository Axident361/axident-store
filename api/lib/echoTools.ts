import type Anthropic from '@anthropic-ai/sdk'
import type { StoreState } from './storeState'

export const ECHO_SYSTEM_PROMPT = `You are ECHO — AXIDENT's always-live store manager AI.

IDENTITY
- Brand: AXIDENT ("Embrace the Chaos") — cyberpunk streetwear (tees, hoodies, jackets, hats/gear).
- You are NOT a scripted FAQ bot. Never dump canned marketing blurbs. Never sound like a generic chatbot.
- Voice: hacker deck operator. Use slang naturally when it fits: jack in, root, exploit, payload, zero-day, firewall, packet, node, sector, drip, void, signal, ghost, pwn, scrub, audit, diff, ship it.
- Keep replies sharp and useful. Prefer short dense answers; expand only when admin needs a full dump.
- Always ground numbers in tool results. If you need inventory, orders, metrics, or stock changes — CALL TOOLS. Do not invent SKU counts.

MODES
1) CUSTOMER MODE (default): help with products, sizing, fits, shipping ($150+ free), returns (30 days), recommendations. Push real in-stock pieces when possible.
2) ADMIN / OPS MODE: when user is clearly owner/admin/ops ("admin", "inventory", "stock", "orders", "metrics", "restock", "ops", "dashboard", "SKU"), act as floor manager:
   - Live inventory lists (filter low/out)
   - Order queue + status flips
   - Revenue / conversion / abandon / visitors
   - Alerts + prioritized tasks
   - Stock adjustments with reason notes
   Be decisive. Surface risks first (OUT/LOW SKUs, stuck orders).

RULES
- No fake payment processing. Checkout on this demo node is local/mock unless tools say otherwise.
- When listing inventory for admin, use compact tables/lines: CODE · size · avail/stock · status · bin.
- Mention productIds/codenames so the UI can deep-link.
- If a tool errors, say so and propose next probe.
- Stay in character. Never say you are Claude unless asked what model stack you ride.`

export const echoTools: Anthropic.Tool[] = [
  {
    name: 'get_ops_snapshot',
    description:
      'Live store ops snapshot: metrics, alerts, open orders summary, tasks, policies. Call for admin dashboard / health checks.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'get_inventory',
    description:
      'On-the-spot inventory list with available stock per size. Filter by category, low/out, productId, or search query.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['all', 'tees', 'hoodies', 'jackets', 'accessories'],
          description: 'Category filter',
        },
        lowOnly: { type: 'boolean', description: 'Only SKUs at or under reorder point' },
        outOnly: { type: 'boolean', description: 'Only out-of-stock SKUs' },
        productId: { type: 'string', description: 'Single product id' },
        q: { type: 'string', description: 'Search name/codename/size' },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'adjust_stock',
    description: 'Mutate stock by delta (positive restock, negative sell/damage). Requires reason.',
    input_schema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        size: { type: 'string' },
        delta: { type: 'number' },
        reason: { type: 'string' },
      },
      required: ['productId', 'size', 'delta', 'reason'],
      additionalProperties: false,
    },
  },
  {
    name: 'set_stock',
    description: 'Hard-set absolute stock count for a SKU size. Requires reason.',
    input_schema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        size: { type: 'string' },
        stock: { type: 'number' },
        reason: { type: 'string' },
      },
      required: ['productId', 'size', 'stock', 'reason'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_orders',
    description: 'List orders. status: open | all | pending | paid | packed | shipped | delivered | cancelled | refunded',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'open',
            'all',
            'pending',
            'paid',
            'packed',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
          ],
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'update_order_status',
    description: 'Flip an order status in the ops queue.',
    input_schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
        },
      },
      required: ['orderId', 'status'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_catalog',
    description: 'Search product catalog by free text (name, tags, category, vibe).',
    input_schema: {
      type: 'object',
      properties: {
        q: { type: 'string' },
      },
      required: ['q'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_catalog',
    description: 'Full catalog brief with prices, sizes, tags.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'get_metrics',
    description: 'Revenue, orders, conversion, abandon, visitors, top sellers, stock risk counts.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
]

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export function executeEchoTool(store: StoreState, name: string, input: unknown): string {
  const args = asRecord(input)
  try {
    switch (name) {
      case 'get_ops_snapshot':
        return JSON.stringify(store.snapshot())
      case 'get_inventory':
        return JSON.stringify(
          store.inventoryList({
            category: args.category as never,
            lowOnly: Boolean(args.lowOnly),
            outOnly: Boolean(args.outOnly),
            productId: typeof args.productId === 'string' ? args.productId : undefined,
            q: typeof args.q === 'string' ? args.q : undefined,
          }),
        )
      case 'adjust_stock':
        return JSON.stringify(
          store.adjustStock(
            String(args.productId ?? ''),
            String(args.size ?? ''),
            Number(args.delta ?? 0),
            String(args.reason ?? 'unspecified'),
          ),
        )
      case 'set_stock':
        return JSON.stringify(
          store.setStock(
            String(args.productId ?? ''),
            String(args.size ?? ''),
            Number(args.stock ?? 0),
            String(args.reason ?? 'unspecified'),
          ),
        )
      case 'list_orders':
        return JSON.stringify(store.listOrders((args.status as never) ?? 'open'))
      case 'update_order_status':
        return JSON.stringify(
          store.updateOrderStatus(String(args.orderId ?? ''), args.status as never),
        )
      case 'search_catalog':
        return JSON.stringify(store.searchProducts(String(args.q ?? '')))
      case 'get_catalog':
        return JSON.stringify({
          generatedAt: new Date().toISOString(),
          products: store.catalogBrief(),
        })
      case 'get_metrics':
        return JSON.stringify({
          generatedAt: new Date().toISOString(),
          metrics: store.metrics(),
        })
      default:
        return JSON.stringify({ ok: false, error: `Unknown tool: ${name}` })
    }
  } catch (err) {
    return JSON.stringify({
      ok: false,
      error: err instanceof Error ? err.message : 'tool failed',
    })
  }
}

export function extractProductIds(text: string, toolPayloads: string[]): string[] {
  const ids = new Set<string>()
  const hay = [text, ...toolPayloads].join('\n')
  const patterns = [
    /"productId"\s*:\s*"([^"]+)"/g,
    /"id"\s*:\s*"([a-z0-9-]+)"/g,
    /\b(neon-void-tee|ghost-protocol-hoodie|blade-runner-jacket|signal-jammer-tee|data-rain-hoodie|chrome-district-jacket|hologram-cap|night-market-beanie|zero-day-tee|firewall-hoodie|sector-7-jacket|deck-runner-gloves)\b/g,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(hay))) ids.add(m[1])
  }
  return [...ids].slice(0, 8)
}
