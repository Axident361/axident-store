import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  highlighted?: boolean
  onSelect: (product: Product) => void
}

export function ProductCard({ product, highlighted, onSelect }: ProductCardProps) {
  return (
    <article
      className={`product-card pattern-${product.pattern}${highlighted ? ' highlighted' : ''}`}
      style={{ ['--accent' as string]: product.accent }}
    >
      <button type="button" className="product-card-btn" onClick={() => onSelect(product)}>
        <div className="product-visual" aria-hidden="true">
          <div className="product-visual-inner">
            <span className="product-codename">{product.codename}</span>
            <span className="product-glyph">◈</span>
          </div>
          {product.featured && <span className="product-featured">HOT DROP</span>}
        </div>
        <div className="product-info">
          <div className="product-top">
            <h3>{product.name}</h3>
            <span className="product-price">${product.price}</span>
          </div>
          <p className="product-cat">{product.category}</p>
          <div className="product-tags">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </button>
    </article>
  )
}
