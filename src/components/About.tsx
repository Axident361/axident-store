interface AboutProps {
  onShop: () => void
}

export function About({ onShop }: AboutProps) {
  return (
    <section className="about-page">
      <p className="section-label">// THE BRAND</p>
      <h1>BORN FROM THE VOID</h1>
      <p className="about-lead">
        Axident was born from a single idea: from every accident lies the opportunity to create
        something extraordinary. We don&apos;t chase perfection — we find beauty in the chaos and wear it.
      </p>

      <div className="about-grid">
        <article>
          <h3>EMBRACE THE CHAOS</h3>
          <p>
            Streetwear coded for night markets and neon rain. Limited drops, premium blanks, graffiti
            energy — no mall filler.
          </p>
        </article>
        <article>
          <h3>PREMIUM · LTD · FREE SHIP</h3>
          <p>
            100% premium quality. Limited drops only. Free shipping on orders $150+. Talk to ECHO for
            sizing, drops, and custom drip intel.
          </p>
        </article>
        <article>
          <h3>ECHO ONLINE</h3>
          <p>
            ECHO is your always-on store manager — sharp, cyberpunk, brand-native. Ask about tees,
            hoodies, hats, shipping, or the next chaos strike.
          </p>
        </article>
      </div>

      <button type="button" className="neon-btn" onClick={onShop}>
        SHOP THE DROP
      </button>
    </section>
  )
}
