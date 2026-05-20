import { create } from 'zustand'
import { Card, Order } from '@/types'

interface CardsStore {
  // البطاقات
  cards: Card[]
  setCards: (cards: Card[]) => void
  selectedCards: Set<number>
  toggleCardSelection: (cardId: number) => void
  clearSelection: () => void

  // الطلب الحالي
  currentOrder: Order | null
  setCurrentOrder: (order: Order | null) => void

  // الإعدادات
  cardPrice: number
  setCardPrice: (price: number) => void

  // الحالة
  isLoading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useCardsStore = create<CardsStore>((set, get) => ({
  cards: [],
  setCards: (cards) => set({ cards }),

  selectedCards: new Set(),
  toggleCardSelection: (cardId) => {
    const selected = new Set(get().selectedCards)
    if (selected.has(cardId)) {
      selected.delete(cardId)
    } else {
      selected.add(cardId)
    }
    set({ selectedCards: selected })
  },
  clearSelection: () => set({ selectedCards: new Set() }),

  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),

  cardPrice: 100,
  setCardPrice: (price) => set({ cardPrice: price }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),
}))
