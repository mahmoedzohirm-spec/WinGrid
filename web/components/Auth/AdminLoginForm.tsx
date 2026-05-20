'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { adminLogin, AuthError, isAdminLoggedIn } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'

export default function AdminLoginForm() {
  const router = useRouter()
  const { setAdmin } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const isLoggedIn = await adminLogin(password)

      if (isLoggedIn) {
        setAdmin(true)
        toast.success('مرحباً بك في لوحة التحكم')
        router.push('/admin/dashboard')
      }
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message)
        setError(error.message)
      } else {
        toast.error('حدث خطأ غير متوقع')
        setError('حدث خطأ غير متوقع')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* الرأس */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-600">تسجيل دخول المسؤول</p>
        </div>

        {/* تحذير الأمان */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700 text-right">
            ⚠️ هذه الصفحة مخصصة للمسؤولين فقط. لا تشارك كلمة المرور مع أحد.
          </p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-right">
            {error}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* كلمة المرور */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الرئيسية
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
                required
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-gray-600 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* زر الدخول */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جارٍ المعالجة...' : 'دخول الإدارة'}
          </button>
        </form>

        {/* روابط إضافية */}
        <div className="mt-6 space-y-3">
          <Link
            href="/auth/login"
            className="block text-center text-sm text-gray-600 hover:text-gray-700"
          >
            ← عودة لتسجيل الدخول العادي
          </Link>
        </div>

        {/* تنبيه الأمان */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              ✓ تنتهي جلستك تلقائياً بعد 24 ساعة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
