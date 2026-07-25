import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '../types'
import { getProductById } from '../data/products'

const STORAGE_KEY = 'axident-cart-v1'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((productId: string, size: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.size === size)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      }
      return [...prev, { productId, size, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)))
  }, [])

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)))
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity } : i,
      ),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const total = useMemo(
    () =>
      items.reduce((sum, i) => {
        const product = getProductById(i.productId)
        return sum + (product?.price ?? 0) * i.quantity
      }, 0),
    [items],
  )

  return { items, addItem, removeItem, updateQuantity, clearCart, count, total }
}

export type CartApi = ReturnType<typeof useCart>
