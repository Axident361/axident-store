import { useEffect, useState } from 'react'
import type { Product } from '../types'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onAdd: (productId: string, size: string) => void
}

export function ProductModal({ product, onClose, onAdd }: ProductModalProps) {
  const [size, setSize] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product) return
    setSize(product.sizes[0] ?? '')
    setAdded(false)
  }, [product])

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product, onClose])

  if (!product) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        style={{ ['--accent' as string]: product.accent }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={`modal-visual pattern-${product.pattern}`}>
          <span className="product-codename">{product.codename}</span>
          <span className="product-glyph large">◈</span>
        </div>
        <div className="modal-body">
          <p className="section-label">{product.category}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          <p className="modal-price">${product.price}</p>
          <p className="modal-desc">{product.description}</p>
          <p className="modal-meta">
            Colors: {product.colors.join(' · ')}
            <br />
            Tags: {product.tags.join(' · ')}
          </p>
          <label className="size-label" htmlFor="size-select">
            SIZE
          </label>
          <div className="size-row">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={size === s ? 'size-chip active' : 'size-chip'}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="neon-btn"
            disabled={!size}
            onClick={() => {
              onAdd(product.id, size)
              setAdded(true)
            }}
          >
            {added ? 'INJECTED ✓' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  )
}
