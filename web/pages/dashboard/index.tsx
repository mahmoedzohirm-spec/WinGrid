'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function DashboardHome() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* الرأس */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <h1 className="text-3xl font-bold">👋 مرحباً {user?.fullName}</h1>
          <p className="text-blue-100 mt-1">لوحة تحكم المستخدم</p>
        </div>
      </header>

      {/* المحتوى */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اختيار البطاقات */}
          <Link href="/dashboard/cards">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-8 rounded-lg cursor-pointer hover:shadow-lg transition transform hover:scale-105">
              <div className="text-5xl mb-4">🎫</div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">اختر البطاقات</h2>
              <p className="text-blue-600">
                استعرض البطاقات المتاحة واختر ما يناسبك
              </p>
            </div>
          </Link>

          {/* الطلبات */}
          <Link href="/dashboard/my-orders">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-8 rounded-lg cursor-pointer hover:shadow-lg transition transform hover:scale-105">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">طلباتي</h2>
              <p className="text-green-600">متابعة حالة طلباتك والإيصالات</p>
            </div>
          </Link>

          {/* الفائزون */}
          <Link href="/dashboard/winners">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 p-8 rounded-lg cursor-pointer hover:shadow-lg transition transform hover:scale-105">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">الفائزون</h2>
              <p className="text-yellow-600">شاهد سجل الفائزين السابقين</p>
            </div>
          </Link>

          {/* البيانات */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-8 rounded-lg">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">بيانات الحساب</h2>
            <div className="text-purple-600 space-y-2">
              <p>البريد: {user?.email}</p>
              <p>الهاتف: {user?.phone}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
