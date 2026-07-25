interface HeroProps {
  onShop: () => void
  onChat: () => void
}

export function Hero({ onShop, onChat }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-glitch-bg" aria-hidden="true" />
      <div className="hero-copy">
        <p className="section-label">EMBRACE THE CHAOS v5.0</p>
        <h1 className="hero-title">
          <span data-text="AXIDENT">AXIDENT</span>
        </h1>
        <p className="hero-tagline">
          From every accident lies the opportunity to create something extraordinary. Cyberpunk
          streetwear — tees, hoodies, hats, and gear for the neon underground.
        </p>
        <div className="hero-actions">
          <button type="button" className="neon-btn" onClick={onShop}>
            SHOP THE DROP
          </button>
          <button type="button" className="neon-btn secondary" onClick={onChat}>
            TALK TO ECHO
          </button>
        </div>
        <ul className="hero-meta">
          <li>100% PREMIUM</li>
          <li>LTD DROPS</li>
          <li>FREE SHIP $150+</li>
        </ul>
      </div>
      <div className="hero-panel" aria-hidden="true">
        <div className="hero-panel-frame">
          <div className="hero-panel-grid" />
          <p className="hero-panel-code">&gt; INITIALIZING QUANTUM FIREWALL...</p>
          <p className="hero-panel-code dim">&gt; LOADING CHAOS MATRIX...</p>
          <p className="hero-panel-code dim">&gt; SYNCING DROP CATALOG...</p>
          <p className="hero-panel-code ok">&gt; AXIDENT ONLINE — EMBRACE THE CHAOS</p>
          <div className="hero-tags">
            <span>VOID</span>
            <span>CHAOS</span>
            <span>DRIP</span>
          </div>
        </div>
      </div>
    </section>
  )
}
