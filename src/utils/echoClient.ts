export interface EchoHistoryTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface EchoChatResponse {
  text: string
  productIds?: string[]
  live?: boolean
  error?: string
}

export async function sendEchoMessage(
  message: string,
  history: EchoHistoryTurn[],
): Promise<EchoChatResponse> {
  const res = await fetch('/api/echo?action=chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })

  const data = (await res.json().catch(() => ({}))) as EchoChatResponse & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || `ECHO uplink fault (${res.status})`)
  }
  return data
}

export async function pingEcho(): Promise<{ live: boolean }> {
  try {
    const res = await fetch('/api/echo?action=health')
    const data = (await res.json()) as { live?: boolean }
    return { live: Boolean(data.live) }
  } catch {
    return { live: false }
  }
}
