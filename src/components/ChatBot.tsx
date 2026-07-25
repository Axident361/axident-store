import { useEffect, useMemo, useRef, useState } from 'react'
import { getProductById } from '../data/products'
import type { ChatMessage } from '../types'
import { pingEcho, sendEchoMessage, type EchoHistoryTurn } from '../utils/echoClient'

interface ChatBotProps {
  open: boolean
  onToggle: () => void
  onHighlightProducts: (ids: string[]) => void
  onOpenProduct: (productId: string) => void
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const BOOT =
  '>> ECHO // LIVE NODE\nAXIDENT store manager online. Hacker ops deck + floor control.\nCustomers: fits, stock vibe, ship intel.\nAdmin: inventory dump, orders, metrics, restock — just say the word.'

export function ChatBot({ open, onToggle, onHighlightProducts, onOpenProduct }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: 'bot', text: BOOT, timestamp: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [live, setLive] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void pingEcho().then((s) => setLive(s.live))
  }, [open])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, typing, open])

  const history: EchoHistoryTurn[] = useMemo(
    () =>
      messages
        .filter((m) => m.role === 'user' || m.role === 'bot')
        .filter((m) => m.text !== BOOT)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
    [messages],
  )

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!text || typing) return

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const prior = history
      const reply = await sendEchoMessage(text, prior)
      setLive(Boolean(reply.live))
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          text: reply.text,
          productIds: reply.productIds,
          timestamp: Date.now(),
        },
      ])
      if (reply.productIds?.length) onHighlightProducts(reply.productIds)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'uplink dead'
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          text: `// LINK FAULT\n${msg}\nDrop ANTHROPIC_API_KEY into .env (see .env.example) and bounce the dev server.`,
          timestamp: Date.now(),
        },
      ])
      setLive(false)
    } finally {
      setTyping(false)
    }
  }

  const quick = ['inventory low stock', 'ops snapshot', 'recommend a hoodie', 'open orders']

  return (
    <div className={`chatbot${open ? ' open' : ''}`}>
      {!open && (
        <button type="button" className="chat-fab" onClick={onToggle} aria-label="Open ECHO chat">
          <span className="chat-fab-pulse" />
          ECHO
        </button>
      )}

      {open && (
        <div className="chat-panel" role="dialog" aria-label="ECHO store manager">
          <header className="chat-header">
            <div>
              <p className="section-label">LIVE UPLINK · {live ? 'KEY HOT' : 'KEY MISSING'}</p>
              <h2>ECHO // MGR</h2>
            </div>
            <button type="button" className="modal-close" onClick={onToggle} aria-label="Close chat">
              ×
            </button>
          </header>

          <div className="chat-messages" ref={listRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.role}`}>
                <pre>{msg.text}</pre>
                {msg.role === 'bot' && msg.productIds && msg.productIds.length > 0 && (
                  <div className="chat-product-links">
                    {msg.productIds.map((id) => {
                      const p = getProductById(id)
                      if (!p) return null
                      return (
                        <button key={id} type="button" onClick={() => onOpenProduct(id)}>
                          {p.codename}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="chat-bubble bot typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className="chat-quick">
            {quick.map((q) => (
              <button key={q} type="button" onClick={() => void send(q)}>
                {q}
              </button>
            ))}
          </div>

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              void send(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="jack in — inventory, orders, drip..."
              aria-label="Message ECHO"
              autoComplete="off"
            />
            <button type="submit" className="neon-btn" disabled={!input.trim() || typing}>
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
