import type { Product } from '../types'

export const products: Product[] = [
  {
    id: 'neon-void-tee',
    name: 'Neon Void Tee',
    codename: 'NV-01',
    category: 'tees',
    price: 48,
    description:
      'Heavyweight cotton with reflective magenta circuit print. Built for midnight runs through rain-slick alleys.',
    colors: ['void black', 'magenta'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['street', 'neon', 'graffiti', 'casual'],
    featured: true,
    accent: '#ff00aa',
    pattern: 'circuit',
  },
  {
    id: 'ghost-protocol-hoodie',
    name: 'Ghost Protocol Hoodie',
    codename: 'GP-07',
    category: 'hoodies',
    price: 98,
    description:
      'Oversized fleece with cyan scanline hood lining. Hidden pocket for your deck. Stay untraceable.',
    colors: ['charcoal', 'cyan'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['stealth', 'hacker', 'warm', 'street'],
    featured: true,
    accent: '#00f0ff',
    pattern: 'scan',
  },
  {
    id: 'blade-runner-jacket',
    name: 'Blade Runner Jacket',
    codename: 'BR-2049',
    category: 'jackets',
    price: 220,
    description:
      'Weathered tech fabric with fluorescent purple shoulder tags. Collar that cuts the skyline. Limited drop.',
    colors: ['night brown', 'purple'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['premium', '2049', 'outerwear', 'iconic'],
    featured: true,
    accent: '#b026ff',
    pattern: 'glitch',
  },
  {
    id: 'signal-jammer-tee',
    name: 'Signal Jammer Tee',
    codename: 'SJ-12',
    category: 'tees',
    price: 42,
    description:
      'Glitch typography front, barcode spine. Fluorescent green ink that pops under blacklight.',
    colors: ['black', 'acid green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['glitch', 'party', 'neon', 'casual'],
    accent: '#39ff14',
    pattern: 'glitch',
  },
  {
    id: 'data-rain-hoodie',
    name: 'Data Rain Hoodie',
    codename: 'DR-33',
    category: 'hoodies',
    price: 110,
    description:
      'Matrix-inspired cascade print down the sleeves. Softshell interior, graffiti tag on the cuff.',
    colors: ['deep black', 'green'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    tags: ['hacker', 'matrix', 'street', 'warm'],
    featured: true,
    accent: '#39ff14',
    pattern: 'grid',
  },
  {
    id: 'chrome-district-jacket',
    name: 'Chrome District Jacket',
    codename: 'CD-88',
    category: 'jackets',
    price: 185,
    description:
      'Metallic sheen panels, cyan zipper pulls, spray-paint logo on the back. For the upper city or the underpass.',
    colors: ['chrome', 'cyan'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['chrome', 'street', 'premium', 'outerwear'],
    accent: '#00f0ff',
    pattern: 'spray',
  },
  {
    id: 'hologram-cap',
    name: 'Hologram Cap',
    codename: 'HC-09',
    category: 'accessories',
    price: 36,
    description:
      'Iridescent brim, AXIDENT embroidery in magenta. Adjustable strap with chip-tag charm.',
    colors: ['black', 'holo'],
    sizes: ['OS'],
    tags: ['accessory', 'street', 'logo', 'daily'],
    featured: true,
    accent: '#ff00aa',
    pattern: 'scan',
  },
  {
    id: 'night-market-beanie',
    name: 'Night Market Beanie',
    codename: 'NM-21',
    category: 'accessories',
    price: 28,
    description:
      'Rib-knit with fluorescent purple pom and woven "NO SIGNAL" label. Market-ready.',
    colors: ['black', 'purple'],
    sizes: ['OS'],
    tags: ['accessory', 'warm', 'graffiti', 'daily'],
    accent: '#b026ff',
    pattern: 'spray',
  },
  {
    id: 'zero-day-tee',
    name: 'Zero Day Tee',
    codename: 'ZD-00',
    category: 'tees',
    price: 45,
    description:
      'Exploit-themed artwork, monospaced body copy on the back. Soft black cotton, true street cut.',
    colors: ['void', 'cyan'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['hacker', 'code', 'casual', 'street'],
    accent: '#00f0ff',
    pattern: 'grid',
  },
  {
    id: 'firewall-hoodie',
    name: 'Firewall Hoodie',
    codename: 'FW-55',
    category: 'hoodies',
    price: 105,
    description:
      'Double-layer hood, magenta drawcords, heat-reactive print that flares under body heat.',
    colors: ['black', 'magenta'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['hacker', 'premium', 'warm', 'street'],
    accent: '#ff00aa',
    pattern: 'circuit',
  },
  {
    id: 'sector-7-jacket',
    name: 'Sector 7 Jacket',
    codename: 'S7-77',
    category: 'jackets',
    price: 195,
    description:
      'Utility pockets, green-line piping, removable hood. Built for sector patrols and gallery openings.',
    colors: ['olive black', 'green'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['utility', 'outerwear', 'street', 'premium'],
    accent: '#39ff14',
    pattern: 'circuit',
  },
  {
    id: 'deck-runner-gloves',
    name: 'Deck Runner Gloves',
    codename: 'DG-14',
    category: 'accessories',
    price: 32,
    description:
      'Touchscreen-compatible fingertips, cyan knuckle strips, graffiti palm tags. Half-finger option.',
    colors: ['black', 'cyan'],
    sizes: ['S/M', 'L/XL'],
    tags: ['accessory', 'hacker', 'tech', 'street'],
    accent: '#00f0ff',
    pattern: 'grid',
  },
]

export const categories: { id: Product['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'ALL DROPS' },
  { id: 'tees', label: 'TEES' },
  { id: 'hoodies', label: 'HOODIES' },
  { id: 'jackets', label: 'JACKETS' },
  { id: 'accessories', label: 'GEAR' },
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}
