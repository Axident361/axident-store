import { getProductById } from '../data/products'
import type { CartApi } from '../hooks/useCart'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  cart: CartApi
}

export function CartDrawer({ open, onClose, cart }: CartDrawerProps) {
  if (!open) return null

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <p className="section-label">LOADOUT</p>
            <h2>CART</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </header>

        <div className="cart-items">
          {cart.items.length === 0 && (
            <p className="empty-cart">Cart empty. Jack into the catalog and inject gear.</p>
          )}
          {cart.items.map((item) => {
            const product = getProductById(item.productId)
            if (!product) return null
            return (
              <div key={`${item.productId}-${item.size}`} className="cart-line">
                <div>
                  <strong>{product.name}</strong>
                  <p>
                    {item.size} · ${product.price}
                  </p>
                </div>
                <div className="cart-line-actions">
                  <button
                    type="button"
                    onClick={() => cart.updateQuantity(item.productId, item.size, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => cart.updateQuantity(item.productId, item.size, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => cart.removeItem(item.productId, item.size)}
                  >
                    RM
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <footer className="cart-footer">
          <div className="cart-total">
            <span>TOTAL</span>
            <strong>${cart.total.toFixed(2)}</strong>
          </div>
          <button
            type="button"
            className="neon-btn"
            disabled={cart.items.length === 0}
            onClick={() => {
              alert('CHECKOUT HANDSHAKE (DEMO)\nNo real payment — cart stays local.')
            }}
          >
            CHECKOUT
          </button>
          {cart.items.length > 0 && (
            <button type="button" className="neon-btn secondary" onClick={cart.clearCart}>
              PURGE CART
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}
