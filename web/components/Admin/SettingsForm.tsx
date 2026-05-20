'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function SettingsForm() {
  const [cardPrice, setCardPrice] = useState<number>(100)
  const [totalCards, setTotalCards] = useState<number>(100)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        const json = await res.json()
        if (json.success && json.data) {
          setCardPrice(json.data.card_price || 100)
          setTotalCards(json.data.total_cards || 100)
        }
      } catch (err) {
        // ignore
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_price: cardPrice, total_cards: totalCards }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('تم حفظ الإعدادات')
      } else {
        toast.error('فشل في حفظ الإعدادات')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">إعدادات المسابقة</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">سعر البطاقة (ر.س)</label>
          <input type="number" value={cardPrice} onChange={(e) => setCardPrice(Number(e.target.value))} className="w-full p-3 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">إجمالي البطاقات</label>
          <input type="number" value={totalCards} onChange={(e) => setTotalCards(Number(e.target.value))} className="w-full p-3 border rounded" />
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">{isLoading ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        </div>
      </div>
    </div>
  )
}
