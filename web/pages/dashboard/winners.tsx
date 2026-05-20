'use client'

import React, { useEffect, useState } from 'react'
import { getWinners, getDrawStats } from '@/lib/winners'
import { Winner } from '@/types'
import Link from 'next/link'

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [drawStats, setDrawStats] = useState<{ totalWinners: number; totalDraws: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWinners = async () => {
      try {
        setIsLoading(true)
        const [winnersData, statsData] = await Promise.all([
          getWinners(),
          getDrawStats(),
        ])
        setWinners(winnersData)
        setDrawStats(statsData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadWinners()
    // تحديث كل 30 ثانية
    const interval = setInterval(loadWinners, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* الرأس */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
            🏆 الفائزون
          </h1>
          <p className="text-gray-600 text-lg">
            شاهد سجل الفائزين السابقين والجوائز الرائعة
          </p>
        </div>

        {/* ا��إحصائيات */}
        {drawStats && !isLoading && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-6 rounded-lg border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm mb-2">إجمالي الفائزين</p>
              <p className="text-3xl font-bold text-yellow-600">{drawStats.totalWinners}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-6 rounded-lg border-l-4 border-orange-500">
              <p className="text-gray-600 text-sm mb-2">عدد السحبات</p>
              <p className="text-3xl font-bold text-orange-600">{drawStats.totalDraws}</p>
            </div>
          </div>
        )}

        {/* التحميل */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            <p className="mt-4 text-gray-600 font-medium">جاري تحميل الفائزين...</p>
          </div>
        )}

        {/* الخطأ */}
        {error && !isLoading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-right">
            <p className="font-bold mb-2">❌ حدث خطأ</p>
            <p>{error}</p>
          </div>
        )}

        {/* لا توجد بيانات */}
        {!isLoading && winners.length === 0 && !error && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 p-12 rounded-lg text-center">
            <p className="text-4xl mb-4">🎲</p>
            <p className="text-gray-700 text-lg font-medium mb-4">
              لم يتم السحب بعد
            </p>
            <p className="text-gray-600 mb-6">
              سيتم إضافة الفائزين هنا بعد كل سحبة. استرخ وانتظر!
            </p>
            <Link
              href="/dashboard/cards"
              className="inline-block px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              اختر بطاقاتك الآن
            </Link>
          </div>
        )}

        {/* قائمة الفائزين */}
        {!isLoading && winners.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 سجل الفائزين</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  {/* الترتيب */}
                  <div className={`${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                      : 'bg-gradient-to-r from-purple-400 to-purple-600'
                  } text-white p-4 text-center`}>
                    <p className="text-sm opacity-75">الترتيب</p>
                    <p className="text-3xl font-bold">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</p>
                  </div>

                  {/* المعلومات */}
                  <div className="p-6">
                    {/* اسم الفائز */}
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">الفائز</p>
                      <p className="text-xl font-bold text-gray-800">
                        {(winner as any).users?.full_name || 'مستخدم'}
                      </p>
                    </div>

                    {/* رقم البطاقة */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-gray-600 text-xs mb-1">رقم البطاقة الفائزة</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {(winner as any).cards?.card_number || winner.card_id}
                      </p>
                    </div>

                    {/* الجائزة */}
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">الجائزة</p>
                      <p className="text-lg font-bold text-yellow-600">
                        🎁 {winner.prize}
                      </p>
                    </div>

                    {/* التاريخ */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-600 text-xs">
                        📅{' '}
                        {new Date(winner.announced_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الروابط السريعة */}
        <div className="mt-12 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-center">
          <p className="text-gray-700 font-medium mb-4">هل تريد المزيد من الفرص للفوز؟</p>
          <Link
            href="/dashboard/cards"
            className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition font-bold"
          >
            🎯 اختر بطاقاتك الآن
          </Link>
        </div>
      </div>
    </div>
  )
}
