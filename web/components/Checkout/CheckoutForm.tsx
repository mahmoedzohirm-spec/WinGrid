'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { reserveCards, uploadReceipt } from '@/lib/cards'
import { useAuthStore } from '@/store/authStore'
import { useCardsStore } from '@/store/cardsStore'

export default function CheckoutForm() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { selectedCards, cards, cardPrice, setCurrentOrder, clearSelection } =
    useCardsStore()

  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCardsList = Array.from(selectedCards)
  const totalPrice = selectedCardsList.length * cardPrice

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // تحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. استخدم JPG أو PNG أو PDF')
      return
    }

    // تحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5MB')
      return
    }

    setReceiptFile(file)

    // عرض معاينة
    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error('المستخدم غير مسجل دخول')
      }

      if (selectedCardsList.length === 0) {
        throw new Error('يجب اختيار بطاقة واحدة على الأقل')
      }

      if (!receiptFile) {
        throw new Error('يجب تحميل إيصال التحويل')
      }

      // 1. حجز البطاقات وإنشاء الطلب
      toast.loading('جاري معالجة الطلب...')
      const order = await reserveCards(
        user.id,
        selectedCardsList,
        totalPrice,
        paymentMethod
      )

      // 2. تحميل الإيصال
      await uploadReceipt(order.id, receiptFile)

      setCurrentOrder(order)
      clearSelection()
      toast.success('تم إنشاء الطلب بنجاح! قيد المراجعة الآن')

      router.push(`/dashboard/order/${order.id}`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* الرأس */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-800">
            💳 إكمال الدفع
          </h1>
          <p className="text-gray-600">أكمل خطوات الدفع وتحميل الإيصال</p>
        </div>

        {/* ملخص الطلب */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">ملخص الطلب</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">عدد البطاقات:</span>
              <span className="font-bold text-lg text-blue-600">
                {selectedCardsList.length}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">البطاقات المختارة:</span>
              <span className="font-mono text-sm text-gray-700">
                {selectedCardsList.join(', ')}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">السعر للواحدة:</span>
              <span className="font-bold text-gray-700">{cardPrice} ر.س</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold pt-3 text-green-600">
              <span>المبلغ الإجمالي:</span>
              <span>{totalPrice} ر.س</span>
            </div>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-right">
            {error}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* طريقة الدفع */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              طريقة الدفع
            </label>
            <div className="space-y-3">
              {[
                { value: 'bank_transfer', label: '🏦 تحويل بنكي' },
                { value: 'stc_pay', label: '📱 STC Pay' },
                { value: 'apple_pay', label: '🍎 Apple Pay' },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="mr-3 font-medium text-gray-700">
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* تحميل الإيصال */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📸 تحميل إيصال التحويل
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition">
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="cursor-pointer block">
                {receiptFile ? (
                  <div className="text-green-600">
                    <p className="text-2xl mb-1">✓</p>
                    <p className="font-medium">{receiptFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(receiptFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-2">📁</p>
                    <p className="font-medium text-gray-700">اضغط هنا لتحميل الإيصال</p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG أو PDF (الحد الأقصى 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* معاينة الإيصال */}
          {receiptPreview && receiptPreview.startsWith('data:image') && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">معاينة:</p>
              <img
                src={receiptPreview}
                alt="معاينة الإيصال"
                className="w-full max-h-64 object-contain border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {/* تنبيه الأمان */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 text-right">
              🔒 بيانات التحويل محفوظة بأمان. سنتحقق من الإيصال في غضون 24 ساعة.
            </p>
          </div>

          {/* الزر */}
          <button
            type="submit"
            disabled={isLoading || !receiptFile}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري المعالجة...' : `دفع ${totalPrice} ر.س`}
          </button>
        </form>
      </div>
    </div>
  )
}
