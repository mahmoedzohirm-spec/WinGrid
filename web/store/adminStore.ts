import { create } from 'zustand'
import { Order, RaffleStatus } from '@/types'

interface AdminStore {
  // الإحصائيات
  raffleStats: RaffleStatus | null
  setRaffleStats: (stats: RaffleStatus) => void

  // الطلبات المعلقة
  pendingOrders: Order[]
  setPendingOrders: (orders: Order[]) => void
  selectedOrder: Order | null
  setSelectedOrder: (order: Order | null) => void

  // الإعدادات
  cardPrice: number
  setCardPrice: (price: number) => void
  totalCards: number
  setTotalCards: (total: number) => void

  // حالة السحب
  isDrawing: boolean
  setIsDrawing: (drawing: boolean) => void
  drawWinner: string | null
  setDrawWinner: (winner: string | null) => void

  // الحالة العامة
  isLoading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  raffleStats: null,
  setRaffleStats: (stats) => set({ raffleStats: stats }),

  pendingOrders: [],
  setPendingOrders: (orders) => set({ pendingOrders: orders }),
  selectedOrder: null,
  setSelectedOrder: (order) => set({ selectedOrder: order }),

  cardPrice: 100,
  setCardPrice: (price) => set({ cardPrice: price }),
  totalCards: 100,
  setTotalCards: (total) => set({ totalCards: total }),

  isDrawing: false,
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  drawWinner: null,
  setDrawWinner: (winner) => set({ drawWinner: winner }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}))
