import type { Page } from '../types'

interface NavbarProps {
  page: Page
  onNavigate: (page: Page) => void
  cartCount: number
  onOpenCart: () => void
  onOpenChat: () => void
}

export function Navbar({ page, onNavigate, cartCount, onOpenCart, onOpenChat }: NavbarProps) {
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
          <div className="sys-status" title="System status">
            <span className="sys-dot" />
            ONLINE
          </div>
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
