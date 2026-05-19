// ===== User Types =====
export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  createdAt: string
  updatedAt: string
}

// ===== Card Types =====
export interface Card {
  id: number
  cardNumber: number
  status: 'available' | 'pending' | 'sold' | 'reserved'
  userId?: string
  purchasedAt?: string
  createdAt: string
}

// ===== Order Types =====
export interface Order {
  id: string
  userId: string
  totalPrice: number
  paymentMethod: 'bank_transfer' | 'credit_card' | 'wallet'
  receiptUrl?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  cards?: Card[]
  selectedCards?: number[]
}

// ===== Winner Types =====
export interface Winner {
  id: string
  drawId: string
  cardId: number
  userId: string
  prize: string
  announcedAt: string
  user?: {
    fullName: string
    phone: string
  }
}

// ===== Draw Types =====
export interface Draw {
  id: string
  drawNumber: number
  totalCardsSold: number
  status: 'active' | 'completed' | 'cancelled'
  startedAt: string
  completedAt?: string
}

// ===== Settings Types =====
export interface Settings {
  id: string
  drawId: string
  cardPrice: number
  totalCards: number
  createdAt: string
  updatedAt: string
}

// ===== Raffle Status =====
export interface RaffleStatus {
  totalCards: number
  soldCards: number
  availableCards: number
  pendingOrders: number
  completedOrders: number
  currentDraw: Draw
  settings: Settings
}

// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
