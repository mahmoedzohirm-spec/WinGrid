'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getPendingOrders, updateOrderStatus } from '@/lib/cards'
import { useAdminStore } from '@/store/adminStore'
import { Order } from '@/types'

export default function ReceiptVerifier() {
  const {
    pendingOrders,
    setPendingOrders,
    selectedOrder,
    setSelectedOrder,
    isLoading,
    setLoading,
  } = useAdminStore()

  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const orders = await getPendingOrders()
        setPendingOrders(orders)
        if (orders.length > 0 && !selectedOrder) {
          setSelectedOrder(orders[0])
        }
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
    // تحديث كل 15 ثانية
    const interval = setInterval(loadOrders, 15000)
    return () => clearInterval(interval)
  }, [setLoading, setPendingOrders])

  const handleApprove = async () => {
    if (!selectedOrder) return

    try {
      setIsProcessing(true)
      await updateOrderStatus(selectedOrder.id, 'approved')
      toast.success('تم قبول الطلب بنجاح!')

      // إزالة الطلب من القائمة
      const updated = pendingOrders.filter((o) => o.id !== selectedOrder.id)
      setPendingOrders(updated)
      setSelectedOrder(updated[0] || null)
      setRejectionReason('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedOrder) return

    if (!rejectionReason.trim()) {
      toast.error('يجب إدخال سبب الرفض')
      return
    }

    try {
      setIsProcessing(true)
      await updateOrderStatus(
        selectedOrder.id,
        'rejected',
        rejectionReason
      )
      toast.success('تم رفض الطلب')

      // إزالة الطلب من القائمة
      const updated = pendingOrders.filter((o) => o.id !== selectedOrder.id)
      setPendingOrders(updated)
      setSelectedOrder(updated[0] || null)
      setRejectionReason('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (pendingOrders.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-8 rounded-lg text-center">
        <p className="text-3xl mb-2">✓</p>
        <p className="text-green-700 font-semibold">لا توجد طلبات معلقة للمراجعة</p>
        <p className="text-green-600 text-sm mt-1">جميع الطلبات تم التحقق منها</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* قائمة الطلبات */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 text-white">
          <h3 className="font-bold text-lg">⏳ الطلبات الم��لقة</h3>
          <p className="text-sm mt-1">{pendingOrders.length} طلب</p>
        </div>
        <div className="overflow-y-auto max-h-96">
          {pendingOrders.map((order: Order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`w-full p-4 text-right border-b transition ${
                selectedOrder?.id === order.id
                  ? 'bg-yellow-50 border-l-4 border-l-yellow-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <p className="font-semibold text-gray-800">الطلب #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.total_price} ر.س
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString('ar-SA')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* تفاصيل الطلب والإيصال */}
      {selectedOrder && (
        <div className="lg:col-span-2">
          {/* معلومات المستخدم */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">👤 معلومات العميل</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">الاسم:</span>
                <span className="font-semibold text-gray-800">
                  {(selectedOrder as any).users?.full_name || 'غير متوفر'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">الهاتف:</span>
                <span className="font-mono text-gray-800">
                  {(selectedOrder as any).users?.phone || 'غير متوفر'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">البريد:</span>
                <span className="font-mono text-sm text-gray-800">
                  {(selectedOrder as any).users?.email || 'غير متوفر'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المبلغ:</span>
                <span className="text-xl font-bold text-green-600">
                  {selectedOrder.total_price} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* معاينة الإيصال */}
          {selectedOrder.receipt_url && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">📸 الإيصال</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {selectedOrder.receipt_url.endsWith('.pdf') ? (
                  <embed
                    src={selectedOrder.receipt_url}
                    type="application/pdf"
                    className="w-full h-64"
                  />
                ) : (
                  <img
                    src={selectedOrder.receipt_url}
                    alt="الإيصال"
                    className="w-full max-h-96 object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* الإجراءات */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">⚙️ الإجراءات</h3>

            {/* سبب الرفض */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب الرفض (إذا رفضت)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="اكتب السبب هنا..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                rows={3}
                disabled={isProcessing}
              />
            </div>

            {/* الأزرار */}
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'جاري...' : '✓ قبول'}
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'جاري...' : '✗ رفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
