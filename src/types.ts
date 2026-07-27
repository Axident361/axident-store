export type ProductCategory = 'tees' | 'hoodies' | 'jackets' | 'accessories'

export interface Product {
  id: string
  name: string
  codename: string
  category: ProductCategory
  price: number
  description: string
  colors: string[]
  sizes: string[]
  tags: string[]
  featured?: boolean
  accent: string
  pattern: 'grid' | 'circuit' | 'glitch' | 'spray' | 'scan'
}

export interface CartItem {
  productId: string
  size: string
  quantity: number
}

export type Page = 'home' | 'shop' | 'about' | 'admin'

export interface ChatMessage {
  id: string
  role: 'bot' | 'user' | 'system'
  text: string
  productIds?: string[]
  timestamp: number
}
