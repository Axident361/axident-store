import { useMemo, useState } from 'react'
import { categories, products } from '../data/products'
import type { Product, ProductCategory } from '../types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  title?: string
  featuredOnly?: boolean
  highlightIds?: string[]
  onSelect: (product: Product) => void
}

export function ProductGrid({
  title = 'CATALOG',
  featuredOnly = false,
  highlightIds = [],
  onSelect,
}: ProductGridProps) {
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all')

  const list = useMemo(() => {
    let items = featuredOnly ? products.filter((p) => p.featured) : products
    if (filter !== 'all') items = items.filter((p) => p.category === filter)
    return items
  }, [featuredOnly, filter])

  return (
    <section className="product-grid-section">
      <div className="grid-header">
        <div>
          <p className="section-label">DATA NODES</p>
          <h2>{title}</h2>
        </div>
        {!featuredOnly && (
          <div className="filter-row" role="tablist" aria-label="Category filter">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={filter === cat.id}
                className={filter === cat.id ? 'active' : ''}
                onClick={() => setFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-grid">
        {list.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            highlighted={highlightIds.includes(product.id)}
            onSelect={onSelect}
          />
        ))}
      </div>

      {list.length === 0 && <p className="empty-grid">No nodes in this channel.</p>}
    </section>
  )
}
