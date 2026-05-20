'use client'

import React, { useEffect } from 'react'
import { getRaffleStats } from '@/lib/cards'
import { useAdminStore } from '@/store/adminStore'

export default function DashboardStats() {
  const { raffleStats, setRaffleStats, isLoading, setLoading, error, setError } =
    useAdminStore()

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const stats = await getRaffleStats()
        setRaffleStats(stats)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    // تحديث كل 10 ثوان
    const interval = setInterval(loadStats, 10000)
    return () => clearInterval(interval)
  }, [setRaffleStats, setLoading, setError])

  if (!raffleStats) return null

  const progressPercentage =
    (raffleStats.soldCards / raffleStats.totalCards) * 100 || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* البطاقات المباعة */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-700 text-sm font-semibold">البطاقات المباعة</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {raffleStats.soldCards}
            </p>
          </div>
          <span className="text-3xl">✓</span>
        </div>
        <p className="text-green-600 text-xs mt-2">
          {progressPercentage.toFixed(1)}% من الإجمالي
        </p>
      </div>

      {/* البطاقات المتاحة */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-700 text-sm font-semibold">البطاقات المتاحة</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {raffleStats.availableCards}
            </p>
          </div>
          <span className="text-3xl">📌</span>
        </div>
        <p className="text-blue-600 text-xs mt-2">
          {((raffleStats.availableCards / raffleStats.totalCards) * 100).toFixed(
            1
          )}% من الإجمالي
        </p>
      </div>

      {/* الطلبات المعلقة */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-600 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-yellow-700 text-sm font-semibold">طلبات معلقة</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {raffleStats.pendingOrders}
            </p>
          </div>
          <span className="text-3xl">⏳</span>
        </div>
        <p className="text-yellow-600 text-xs mt-2">تحتاج مراجعة</p>
      </div>

      {/* إجمالي البطاقات */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-purple-700 text-sm font-semibold">إجمالي البطاقات</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {raffleStats.totalCards}
            </p>
          </div>
          <span className="text-3xl">🎫</span>
        </div>
        <p className="text-purple-600 text-xs mt-2">في المسابقة</p>
      </div>

      {/* شريط التقدم - يمتد على كل الصفوف */}
      <div className="lg:col-span-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">نسبة البيع</span>
            <span className="text-lg font-bold text-blue-600">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-600 h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-right">
            {raffleStats.soldCards} من {raffleStats.totalCards} بطاقة
          </p>
        </div>
      </div>
    </div>
  )
}
