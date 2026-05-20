'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllCards } from '@/lib/cards'
import { useAuthStore } from '@/store/authStore'
import { useCardsStore } from '@/store/cardsStore'
import CardGrid from '@/components/Cards/CardGrid'
import { Card } from '@/types'

export default function CardsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { cards, setCards, selectedCards, cardPrice } = useCardsStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const loadCards = async () => {
      try {
        setIsLoading(true)
        const cardsData = await getAllCards()
        setCards(cardsData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadCards()
  }, [isAuthenticated, router, setCards])

  const handleCheckout = () => {
    router.push('/dashboard/checkout')
  }

  if (!isAuthenticated) return null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">جاري تحميل البطاقات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-red-700 text-center max-w-md">
          <p className="text-lg font-bold mb-2">❌ حدث خطأ</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            إعادة محاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <CardGrid
        cards={cards}
        cardPrice={cardPrice}
        onCheckout={handleCheckout}
      />
    </div>
  )
}
