import Anthropic from '@anthropic-ai/sdk'
import { products } from '../data/products'
import {
  ECHO_SYSTEM_PROMPT,
  echoTools,
  executeEchoTool,
  extractProductIds,
} from './echoTools'
import { createStoreState, type StoreState } from './storeState'

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export interface EchoChatResult {
  text: string
  productIds: string[]
  live: boolean
}

// Module-level store so stock/order mutations persist across invocations in the same runtime
const globalStore = createStoreState(products)

export function getStore(): StoreState {
  return globalStore
}

export async function runEchoChat(
  message: string,
  history: ChatTurn[] = [],
  apiKey = process.env.ANTHROPIC_API_KEY,
): Promise<EchoChatResult> {
  if (!apiKey) {
    throw new Error(
      'ECHO uplink dark — set ANTHROPIC_API_KEY then redeploy / restart the server',
    )
  }

  const client = new Anthropic({ apiKey })
  const store = getStore()
  const messages: Anthropic.MessageParam[] = []

  for (const turn of history.slice(-16)) {
    if (!turn?.content || (turn.role !== 'user' && turn.role !== 'assistant')) continue
    messages.push({ role: turn.role, content: turn.content })
  }
  messages.push({ role: 'user', content: message })

  const toolPayloads: string[] = []
  let guard = 0
  let finalText = ''

  while (guard < 8) {
    guard += 1
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 16000,
      cache_control: { type: 'ephemeral' },
      system: [
        {
          type: 'text',
          text: ECHO_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: echoTools,
      messages,
    })

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'tool_use') {
      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
      )
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const call of toolUses) {
        const out = executeEchoTool(store, call.name, call.input)
        toolPayloads.push(out)
        results.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: out,
        })
      }
      messages.push({ role: 'user', content: results })
      continue
    }

    finalText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    break
  }

  if (!finalText) {
    finalText = 'Signal dropped mid-loop. Re-issue the command — inventory node is still hot.'
  }

  return {
    text: finalText,
    productIds: extractProductIds(finalText, toolPayloads),
    live: true,
  }
}
