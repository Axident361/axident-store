import { useCallback, useState } from 'react'
import './App.css'
import { About } from './components/About'
import { AdminPage } from './components/AdminPage'
import { CartDrawer } from './components/CartDrawer'
import { ChatBot } from './components/ChatBot'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { ProductGrid } from './components/ProductGrid'
import { ProductModal } from './components/ProductModal'
import { getProductById } from './data/products'
import { useCart } from './hooks/useCart'
import type { Page, Product } from './types'

function App() {
  const cart = useCart()
  const [page, setPage] = useState<Page>('home')
  const [cartOpen, setCartOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [highlightIds, setHighlightIds] = useState<string[]>([])

  const navigate = useCallback((next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const openProduct = useCallback((product: Product) => {
    setSelected(product)
  }, [])

  const openProductById = useCallback((id: string) => {
    const product = getProductById(id)
    if (product) {
      setSelected(product)
      setPage('shop')
    }
  }, [])

  const handleHighlight = useCallback((ids: string[]) => {
    setHighlightIds(ids)
    window.setTimeout(() => setHighlightIds([]), 5000)
  }, [])

  return (
    <div className="app-shell">
      <Navbar
        page={page}
        onNavigate={navigate}
        cartCount={cart.count}
        onOpenCart={() => setCartOpen(true)}
        onOpenChat={() => setChatOpen(true)}
        onSecretAdmin={() => navigate('admin')}
      />

      <main className="main-content">
        {page === 'home' && (
          <>
            <Hero onShop={() => navigate('shop')} onChat={() => setChatOpen(true)} />
            <ProductGrid
              title="LATEST DROPS"
              featuredOnly
              highlightIds={highlightIds}
              onSelect={openProduct}
            />
            <section className="home-cta">
              <p className="section-label">// THE CATALOG</p>
              <h2>EMBRACE THE CHAOS</h2>
              <p>
                Premium streetwear. Limited drops. Free shipping $150+. Jack into the full grid or ask
                ECHO what to wear into the void.
              </p>
              <div className="hero-actions">
                <button type="button" className="neon-btn" onClick={() => navigate('shop')}>
                  SHOP THE DROP
                </button>
                <button type="button" className="neon-btn secondary" onClick={() => navigate('about')}>
                  THE BRAND
                </button>
              </div>
            </section>
          </>
        )}

        {page === 'shop' && (
          <ProductGrid title="THE CATALOG" highlightIds={highlightIds} onSelect={openProduct} />
        )}

        {page === 'about' && <About onShop={() => navigate('shop')} />}

        {page === 'admin' && <AdminPage onExit={() => navigate('home')} />}
      </main>

      <Footer />

      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={(productId, size) => {
          cart.addItem(productId, size)
        }}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />

      {page !== 'admin' && (
        <ChatBot
          open={chatOpen}
          onToggle={() => setChatOpen((v) => !v)}
          onHighlightProducts={handleHighlight}
          onOpenProduct={openProductById}
        />
      )}
    </div>
  )
}

export default App
