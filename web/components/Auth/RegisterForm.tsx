'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { userRegister, AuthError } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'

export default function RegisterForm() {
  const router = useRouter()
  const { setLoading, setError } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  // حساب قوة كلمة المرور
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20
    if (/[!@#$%^&*]/.test(password)) strength += 20
    setPasswordStrength(strength)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'password') {
      calculatePasswordStrength(value)
    }

    // مسح الخطأ عند البدء بالكتابة
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await userRegister(
        formData.email,
        formData.password,
        formData.passwordConfirm,
        formData.fullName,
        formData.phone
      )

      toast.success('تم إرسال رابط التأكيد إلى بريدك الإلكتروني')
      router.push('/auth/verify-email')
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 20) return 'bg-red-500'
    if (passwordStrength <= 40) return 'bg-orange-500'
    if (passwordStrength <= 60) return 'bg-yellow-500'
    if (passwordStrength <= 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* الرأس */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            🎰 WinGrid
          </h1>
          <p className="text-gray-600">إنشاء حساب جديد</p>
        </div>

        {/* رسالة الخطأ العامة */}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* الاسم الكامل */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="محمد أحمد"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
              required
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* رقم الهاتف */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف (سعودي)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="05XXXXXXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-left"
              disabled={isLoading}
              required
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* كلمة المرور */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
              required
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">قوة كلمة المرور</span>
                  <span className="text-xs font-medium text-gray-700">{passwordStrength}%</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
              required
            />
            {errors.passwordConfirm && (
              <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>
            )}
          </div>

          {/* متطلبات كلمة المرور */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">متطلبات كلمة المرور:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <span
                  className={`mr-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}
                >
                  ✓
                </span>
                8 أحرف على الأقل
              </li>
              <li className="flex items-center">
                <span
                  className={`mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}
                >
                  ✓
                </span>
                حرف كبير واحد
              </li>
              <li className="flex items-center">
                <span
                  className={`mr-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}
                >
                  ✓
                </span>
                حرف صغير واحد
              </li>
              <li className="flex items-center">
                <span className={`mr-2 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓
                </span>
                رقم واحد
              </li>
              <li className="flex items-center">
                <span
                  className={`mr-2 ${/[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}
                >
                  ✓
                </span>
                رمز خاص (!@#$%^&*)
              </li>
            </ul>
          </div>

          {/* زر التسجيل */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جارٍ التسجيل...' : 'إنشاء حساب'}
          </button>
        </form>

        {/* الرابط للدخول */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          هل لديك حساب بالفعل؟{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
