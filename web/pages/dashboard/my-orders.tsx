'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getUserOrders } from '@/lib/cards'
import { Order } from '@/types'
import Link from 'next/link'

export default function MyOrders() {
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    const loadOrders = async () => {
      try {
        setIsLoading(true)
        const userOrders = await getUserOrders(user.id)
        setOrders(userOrders)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
    // تحديث كل 10 ثوانٍ
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'completed':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      case 'completed':
        return '🎉'
      default:
        return '📋'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة'
      case 'approved':
        return 'مقبول'
      case 'rejected':
        return 'مرفوض'
      case 'completed':
        return 'مكتمل'
      default:
        return 'غير معروف'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 text-lg font-medium mb-4">يجب تسجيل الدخول أولاً</p>
          <Link href="/auth/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* الرأس */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-800">
            📋 طلباتي
          </h1>
          <p className="text-gray-600">
            متابعة حالة طلباتك والإيصالات
          </p>
        </div>

        {/* رسالة التحميل */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">جاري تحميل الطلبات...</p>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && !isLoading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-right">
            <p className="font-bold mb-2">❌ حدث خطأ</p>
            <p>{error}</p>
          </div>
        )}

        {/* قائمة الطلبات فارغة */}
        {!isLoading && orders.length === 0 && !error && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-8 rounded-lg text-center">
            <p className="text-3xl mb-4">📭</p>
            <p className="text-gray-700 text-lg font-medium mb-4">
              لا توجد طلبات بعد
            </p>
            <p className="text-gray-600 mb-6">
              ابدأ برحلتك الآن باختيار بعض البطاقات الرائعة!
            </p>
            <Link
              href="/dashboard/cards"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              اختر البطاقات
            </Link>
          </div>
        )}

        {/* قائمة الطلبات */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`border-2 rounded-lg overflow-hidden shadow-md transition ${
                  getStatusColor(order.status)
                }`}
              >
                {/* رأس الطلب */}
                <button
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                  className="w-full p-6 flex items-center justify-between hover:opacity-80 transition"
                >
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {getStatusIcon(order.status)}
                      </span>
                      <span className="text-lg font-bold">
                        الطلب #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-sm opacity-75">
                      {new Date(order.created_at).toLocaleDateString('ar-SA')} -{' '}
                      {new Date(order.created_at).toLocaleTimeString('ar-SA')}
                    </p>
                  </div>

                  <div className="text-left flex flex-col items-end">
                    <p className="text-2xl font-bold mb-1">
                      {order.total_price} ر.س
                    </p>
                    <p className="text-sm opacity-75">
                      {getStatusLabel(order.status)}
                    </p>
                  </div>

                  <span className="ml-4 text-2xl">
                    {expandedOrder === order.id ? '▼' : '▶'}
                  </span>
                </button>

                {/* التفاصيل */}
                {expandedOrder === order.id && (
                  <div className="border-t-2 border-current border-opacity-20 p-6 space-y-4">
                    {/* معلومات الطلب */}
                    <div>
                      <h3 className="font-bold mb-3">📦 تفاصيل الطلب</h3>
                      <div className="space-y-2 text-sm opacity-75">
                        <div className="flex justify-between">
                          <span>رقم الطلب:</span>
                          <span className="font-mono">{order.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>طريقة الدفع:</span>
                          <span>
                            {order.payment_method === 'bank_transfer'
                              ? '🏦 تحويل بنكي'
                              : order.payment_method === 'stc_pay'
                              ? '📱 STC Pay'
                              : '🍎 Apple Pay'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>الحالة:</span>
                          <span>
                            {getStatusIcon(order.status)}{' '}
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* البطاقات المختارة */}
                    {(order as any).order_cards &&
                      (order as any).order_cards.length > 0 && (
                        <div>
                          <h3 className="font-bold mb-3">🎫 البطاقات المختارة</h3>
                          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {(order as any).order_cards.map(
                              (oc: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-white bg-opacity-50 p-2 rounded text-center font-bold text-sm"
                                >
                                  {oc.card_id}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* الإيصال */}
                    {order.receipt_url && (
                      <div>
                        <h3 className="font-bold mb-3">📸 الإيصال</h3>
                        <div className="border border-current border-opacity-30 rounded-lg overflow-hidden">
                          {order.receipt_url.endsWith('.pdf') ? (
                            <embed
                              src={order.receipt_url}
                              type="application/pdf"
                              className="w-full h-48"
                            />
                          ) : (
                            <img
                              src={order.receipt_url}
                              alt="الإيصال"
                              className="w-full max-h-48 object-contain"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* سبب الرفض */}
                    {order.rejection_reason && (
                      <div className="bg-red-100 bg-opacity-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-2">⚠️ سبب الرفض</h3>
                        <p className="text-sm">{order.rejection_reason}</p>
                      </div>
                    )}

                    {/* الأزرار */}
                    <div className="flex gap-2 pt-4">
                      {order.status === 'pending' && (
                        <Link
                          href="/dashboard/cards"
                          className="flex-1 py-2 bg-blue-600 bg-opacity-50 hover:bg-opacity-75 text-center rounded-lg transition font-medium"
                        >
                          متابعة التسوق
                        </Link>
                      )}
                      {order.status === 'rejected' && (
                        <Link
                          href="/dashboard/checkout"
                          className="flex-1 py-2 bg-yellow-600 bg-opacity-50 hover:bg-opacity-75 text-center rounded-lg transition font-medium"
                        >
                          إعادة المحاولة
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
