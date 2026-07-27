import { useRef } from 'react'
import type { Page } from '../types'

interface NavbarProps {
  page: Page
  onNavigate: (page: Page) => void
  cartCount: number
  onOpenCart: () => void
  onOpenChat: () => void
  onSecretAdmin: () => void
}

export function Navbar({
  page,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenChat,
  onSecretAdmin,
}: NavbarProps) {
  const clicks = useRef(0)
  const timer = useRef<number | null>(null)

  const onStatusClick = () => {
    clicks.current += 1
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      clicks.current = 0
    }, 700)
    if (clicks.current >= 3) {
      clicks.current = 0
      if (timer.current) window.clearTimeout(timer.current)
      onSecretAdmin()
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button type="button" className="brand" onClick={() => onNavigate('home')}>
          <span className="brand-mark">A</span>
          <span className="brand-text">
            AXIDENT
            <small>EMBRACE THE CHAOS</small>
          </span>
        </button>

        <nav className="nav-links" aria-label="Primary">
          <button
            type="button"
            className={page === 'home' ? 'active' : ''}
            onClick={() => onNavigate('home')}
          >
            HOME
          </button>
          <button
            type="button"
            className={page === 'shop' ? 'active' : ''}
            onClick={() => onNavigate('shop')}
          >
            SHOP
          </button>
          <button
            type="button"
            className={page === 'about' ? 'active' : ''}
            onClick={() => onNavigate('about')}
          >
            ABOUT
          </button>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="sys-status sys-status-btn"
            title="System status"
            onClick={onStatusClick}
            aria-label="System online status"
          >
            <span className="sys-dot" />
            ONLINE
          </button>
          <button type="button" className="nav-chip" onClick={onOpenChat}>
            ECHO
          </button>
          <button type="button" className="nav-chip cart-chip" onClick={onOpenCart}>
            CART
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
