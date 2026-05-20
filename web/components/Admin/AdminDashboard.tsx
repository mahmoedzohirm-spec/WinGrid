'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { logout, isAdminLoggedIn } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import DashboardStats from './DashboardStats'
import ReceiptVerifier from './ReceiptVerifier'

export default function AdminDashboard() {
  const router = useRouter()
  const { setAdmin } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'stats' | 'verify' | 'settings' | 'draw'>(
    'stats'
  )

  const handleLogout = async () => {
    try {
      await logout()
      setAdmin(false)
      toast.success('تم تسجيل الخروج')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* الرأس */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🎰 لوحة تحكم WinGrid</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      </header>

      {/* التابز */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'stats', label: '📊 الإحصائيات', icon: '📊' },
              { id: 'verify', label: '✔️ التحقق من الإيصالات', icon: '✔️' },
              { id: 'settings', label: '⚙️ الإعدادات', icon: '⚙️' },
              { id: 'draw', label: '🎡 السحب', icon: '🎡' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* المحتوى */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 إحصائيات المسابقة</h2>
            <DashboardStats />
          </div>
        )}

        {activeTab === 'verify' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              ✔️ التحقق من الإيصالات
            </h2>
            <ReceiptVerifier />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-2xl mb-2">⚙️</p>
            <p className="text-gray-600 text-lg">قريباً...</p>
          </div>
        )}

        {activeTab === 'draw' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-2xl mb-2">🎡</p>
            <p className="text-gray-600 text-lg">قريباً...</p>
          </div>
        )}
      </main>
    </div>
  )
}
