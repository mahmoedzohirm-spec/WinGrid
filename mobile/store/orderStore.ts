import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import supabase from '../lib/supabase';
import axios from 'axios';

interface CartItem {
  cardId: string;
  price: number;
  quantity: number;
  type: string;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  receiptFileName?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStore {
  // Cart state
  cart: CartItem[];
  cartTotal: number;
  
  // Orders state
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Cart actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (cardId: string) => void;
  updateCartQuantity: (cardId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  
  // Order actions
  createOrder: (userId: string) => Promise<Order>;
  fetchUserOrders: (userId: string) => Promise<void>;
  uploadReceipt: (orderId: string, filePath: string, fileName: string) => Promise<string>;
  updateOrderStatus: (orderId: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  clearError: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // Cart state
  cart: [],
  cartTotal: 0,
  
  // Orders state
  orders: [],
  currentOrder: null,
  loading: false,
  uploading: false,
  error: null,
  
  // Cart actions
  addToCart: (item) => {
    set((state) => {
      const existingItem = state.cart.find((i) => i.cardId === item.cardId);
      let newCart;
      
      if (existingItem) {
        newCart = state.cart.map((i) =>
          i.cardId === item.cardId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newCart = [...state.cart, item];
      }
      
      return {
        cart: newCart,
        cartTotal: get().getCartTotal(),
      };
    });
  },
  
  removeFromCart: (cardId) => {
    set((state) => ({
      cart: state.cart.filter((i) => i.cardId !== cardId),
      cartTotal: get().getCartTotal(),
    }));
  },
  
  updateCartQuantity: (cardId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(cardId);
      return;
    }
    
    set((state) => ({
      cart: state.cart.map((i) =>
        i.cardId === cardId ? { ...i, quantity } : i
      ),
      cartTotal: get().getCartTotal(),
    }));
  },
  
  clearCart: () => {
    set({ cart: [], cartTotal: 0 });
  },
  
  getCartTotal: () => {
    const state = get();
    return state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  // Order actions
  createOrder: async (userId) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const totalAmount = state.getCartTotal();
      
      if (state.cart.length === 0) {
        throw new Error('العربة فارغة');
      }
      
      // Create order via API for security
      const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await axios.post(`${appUrl}/api/mobile/orders`, {
        userId,
        items: state.cart,
        totalAmount,
      });
      
      const order: Order = {
        id: response.data.id,
        userId,
        items: state.cart,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({
        currentOrder: order,
        loading: false,
      });
      
      // Clear cart after successful order
      get().clearCart();
      
      return order;
    } catch (err: any) {
      const errorMessage = err.message || 'خطأ في إنشاء الطلب';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },
  
  fetchUserOrders: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      const orders: Order[] = (data || []).map((o: any) => ({
        id: o.id,
        userId: o.userId,
        items: o.items || [],
        totalAmount: o.totalAmount,
        status: o.status,
        receiptUrl: o.receiptUrl,
        receiptFileName: o.receiptFileName,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }));
      
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'خطأ في جلب الطلبات', loading: false });
    }
  },
  
  uploadReceipt: async (orderId, filePath, fileName) => {
    set({ uploading: true, error: null });
    try {
      // Read file as base64
      const fileContent = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // Upload via API for security
      const response = await axios.post(
        `${appUrl}/api/mobile/orders/${orderId}/receipt`,
        {
          file: fileContent,
          fileName,
          mimeType: 'image/jpeg',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Update local order
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                receiptUrl: response.data.receiptUrl,
                receiptFileName: fileName,
              }
            : o
        ),
        uploading: false,
      }));
      
      return response.data.receiptUrl;
    } catch (err: any) {
      const errorMessage = err.message || 'خطأ في رفع الإيصال';
      set({ error: errorMessage, uploading: false });
      throw err;
    }
  },
  
  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'خطأ في تحديث الطلب', loading: false });
      throw err;
    }
  },
  
  clearError: () => set({ error: null }),
}));
