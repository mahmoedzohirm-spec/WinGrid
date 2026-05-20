// ===== المستخدم =====
export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  createdAt: string
  updatedAt?: string
}

// ===== حالة المصادقة =====
export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
}

// ===== البطاقة =====
export interface Card {
  id: number
  card_number: number
  status: 'available' | 'pending' | 'sold' | 'reserved'
  user_id?: string
  purchased_at?: string
}

// ===== الطلب =====
export interface Order {
  id: string
  user_id: string
  total_price: number
  payment_method: string
  receipt_url?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  rejection_reason?: string
  created_at: string
  updated_at: string
  cards?: Card[]
}

// ===== الفائز =====
export interface Winner {
  id: string
  card_id: number
  user_id: string
  prize: string
  announced_at: string
}

// ===== الإعدادات =====
export interface Settings {
  card_price: number
  total_cards: number
  draw_number: number
}

// ===== حالة المسابقة =====
export interface RaffleStatus {
  totalCards: number
  soldCards: number
  availableCards: number
  pendingOrders: number
  completedOrders: number
}

// ===== استجابة API =====
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
