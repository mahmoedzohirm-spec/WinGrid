import { supabase } from './supabase'
import { Card, Order } from '@/types'

// ===== جلب جميع البطاقات =====
export const getAllCards = async (): Promise<Card[]> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('card_number', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  } catch (error: any) {
    console.error('Error fetching cards:', error)
    throw new Error('فشل في جلب البطاقات')
  }
}

// ===== جلب البطاقات المتاحة فقط =====
export const getAvailableCards = async (): Promise<Card[]> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('status', 'available')
      .order('card_number', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  } catch (error: any) {
    console.error('Error fetching available cards:', error)
    throw new Error('فشل في جلب البطاقات المتاحة')
  }
}

// ===== حجز البطاقات المختارة =====
export const reserveCards = async (
  userId: string,
  cardIds: number[],
  totalPrice: number,
  paymentMethod: string
): Promise<Order> => {
  try {
    // 1. إنشاء طلب جديد
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_price: totalPrice,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw new Error(orderError.message)
    if (!orderData) throw new Error('فشل في إنشاء الطلب')

    // 2. تحديث حالة البطاقات إلى pending
    const { error: cardsError } = await supabase
      .from('cards')
      .update({ status: 'pending', user_id: userId })
      .in('id', cardIds)

    if (cardsError) throw new Error(cardsError.message)

    // 3. ربط البطاقات بالطلب
    const orderCardsData = cardIds.map((cardId) => ({
      order_id: orderData.id,
      card_id: cardId,
    }))

    const { error: linkError } = await supabase
      .from('order_cards')
      .insert(orderCardsData)

    if (linkError) throw new Error(linkError.message)

    return orderData as Order
  } catch (error: any) {
    console.error('Error reserving cards:', error)
    throw new Error('فشل في حجز البطاقات')
  }
}

// ===== تحميل الإيصال =====
export const uploadReceipt = async (
  orderId: string,
  file: File
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${orderId}-${Date.now()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    // رفع الملف إلى Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('wingrid-receipts')
      .upload(filePath, file)

    if (uploadError) throw new Error(uploadError.message)

    // الحصول على URL للملف
    const { data } = supabase.storage
      .from('wingrid-receipts')
      .getPublicUrl(filePath)

    // تحديث الطلب بـ URL الإيصال
    const { error: updateError } = await supabase
      .from('orders')
      .update({ receipt_url: data.publicUrl })
      .eq('id', orderId)

    if (updateError) throw new Error(updateError.message)

    return data.publicUrl
  } catch (error: any) {
    console.error('Error uploading receipt:', error)
    throw new Error('فشل في تحميل الإيصال')
  }
}

// ===== جلب طلبات المستخدم =====
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_cards (
          card_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  } catch (error: any) {
    console.error('Error fetching user orders:', error)
    throw new Error('فشل في جلب الطلبات')
  }
}

// ===== تحديث حالة الطلب =====
export const updateOrderStatus = async (
  orderId: string,
  status: 'pending' | 'approved' | 'rejected' | 'completed',
  rejectionReason?: string
): Promise<Order> => {
  try {
    const updateData: any = { status }
    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('فشل في تحديث الطلب')

    // إذا تم قبول الطلب، حدّث حالة البطاقات إلى 'sold'
    if (status === 'approved') {
      const { data: orderCards, error: cardsError } = await supabase
        .from('order_cards')
        .select('card_id')
        .eq('order_id', orderId)

      if (cardsError) throw new Error(cardsError.message)

      const cardIds = orderCards?.map((oc) => oc.card_id) || []

      const { error: updateCardsError } = await supabase
        .from('cards')
        .update({ status: 'sold' })
        .in('id', cardIds)

      if (updateCardsError) throw new Error(updateCardsError.message)
    }

    // إذا تم رفض الطلب، أعد البطاقات إلى 'available'
    if (status === 'rejected') {
      const { data: orderCards, error: cardsError } = await supabase
        .from('order_cards')
        .select('card_id')
        .eq('order_id', orderId)

      if (cardsError) throw new Error(cardsError.message)

      const cardIds = orderCards?.map((oc) => oc.card_id) || []

      const { error: updateCardsError } = await supabase
        .from('cards')
        .update({ status: 'available', user_id: null })
        .in('id', cardIds)

      if (updateCardsError) throw new Error(updateCardsError.message)
    }

    return data as Order
  } catch (error: any) {
    console.error('Error updating order:', error)
    throw new Error('فشل في تحديث الطلب')
  }
}

// ===== جلب إحصائيات المسابقة =====
export const getRaffleStats = async () => {
  try {
    // جلب عدد البطاقات
    const { count: totalCards, error: totalError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })

    const { count: soldCards, error: soldError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold')

    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (totalError || soldError || pendingError) {
      throw new Error('فشل في جلب الإحصائيات')
    }

    return {
      totalCards: totalCards || 0,
      soldCards: soldCards || 0,
      availableCards: (totalCards || 0) - (soldCards || 0),
      pendingOrders: pendingOrders || 0,
      completedOrders: 0,
    }
  } catch (error: any) {
    console.error('Error fetching raffle stats:', error)
    throw new Error('فشل في جلب الإحصائيات')
  }
}

// ===== جلب الطلبات المعلقة (للمسؤول) =====
export const getPendingOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (id, full_name, phone, email),
        order_cards (card_id)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  } catch (error: any) {
    console.error('Error fetching pending orders:', error)
    throw new Error('فشل في جلب الطلبات المعلقة')
  }
}

// ===== حذف طلب مرفوض بعد وقت محدد =====
export const cleanupRejectedOrders = async (hoursOld: number = 24) => {
  try {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString()

    // جلب الطلبات المرفوضة القديمة
    const { data: rejectedOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_cards(card_id)')
      .eq('status', 'rejected')
      .lt('updated_at', cutoffTime)

    if (fetchError) throw new Error(fetchError.message)

    if (!rejectedOrders || rejectedOrders.length === 0) return

    // حذف الطلبات
    const orderIds = rejectedOrders.map((o) => o.id)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIds)

    if (deleteError) throw new Error(deleteError.message)
  } catch (error: any) {
    console.error('Error cleaning up rejected orders:', error)
  }
}

// ===== Real-time subscription للبطاقات =====
export const subscribeToCardsUpdates = (callback: (cards: Card[]) => void) => {
  const subscription = supabase
    .from('cards')
    .on('*', (payload) => {
      // جلب البطاقات المحدثة
      getAllCards().then(callback).catch(console.error)
    })
    .subscribe()

  return subscription
}
