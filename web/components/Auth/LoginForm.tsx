'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { userLogin, AuthError } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'

export default function LoginForm() {
  const router = useRouter()
  const { setUser, setLoading } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const { user, profile } = await userLogin(email, password)

      if (user && profile) {
        // حفظ بيانات المستخدم في Store
        setUser({
          id: user.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          createdAt: profile.created_at,
        })

        // حفظ في localStorage إذا كان "تذكرني" مختاراً
        if (rememberMe) {
          localStorage.setItem('user_email', email)
        }

        toast.success('مرحباً بك!')
        router.push('/dashboard')
      }
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message)
        setErrors({ form: error.message })
      } else {
        toast.error('حدث خطأ غير متوقع')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* الرأس */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            🎰 WinGrid
          </h1>
          <p className="text-gray-600">تسجيل الدخول</p>
        </div>

        {/* رسالة الخطأ */}
        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-right">
            {errors.form}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* البريد الإلكتروني */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
              required
            />
          </div>

          {/* كلمة المرور */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                كلمة المرور
              </label>
              <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
                هل نسيت كلمة المرور؟
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
              required
            />
          </div>

          {/* تذكرني */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="mr-2 text-sm text-gray-600">
              تذكر البريد الإلكتروني
            </label>
          </div>

          {/* زر الدخول */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* الفاصل */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">أو</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* رابط التسجيل */}
        <p className="text-center text-gray-600 text-sm">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
            إنشاء حساب جديد
          </Link>
        </p>

        {/* رابط تسجيل دخول المسؤول */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm mb-3">تسجيل دخول المسؤول؟</p>
          <Link
            href="/admin/login"
            className="block w-full py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            دخول إدارية
          </Link>
        </div>
      </div>
    </div>
  )
}
