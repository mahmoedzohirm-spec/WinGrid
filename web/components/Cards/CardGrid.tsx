'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/types'
import CardItem from './CardItem'
import { useCardsStore } from '@/store/cardsStore'

interface CardGridProps {
  cards: Card[]
  cardPrice: number
  onCheckout?: () => void
}

export default function CardGrid({ cards, cardPrice, onCheckout }: CardGridProps) {
  const { selectedCards, toggleCardSelection, clearSelection } = useCardsStore()
  const [filteredCards, setFilteredCards] = useState<Card[]>(cards)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredCards(cards)
    } else {
      setFilteredCards(cards.filter((card) => card.status === filterStatus))
    }
  }, [cards, filterStatus])

  const totalPrice = selectedCards.size * cardPrice
  const availableCount = cards.filter((c) => c.status === 'available').length
  const soldCount = cards.filter((c) => c.status === 'sold').length
  const pendingCount = cards.filter((c) => c.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 text-gray-800">
            🎯 اختر البطاقات المفضلة
          </h1>
          <p className="text-center text-gray-600 text-lg">
            اختر عدد البطاقات التي تريدها وسيتم حساب المبلغ تلقائياً
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">متاح</p>
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">قيد المراجعة</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-500">
            <p className="text-gray-600 text-sm">مباع</p>
            <p className="text-2xl font-bold text-gray-600">{soldCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">المختارة</p>
            <p className="text-2xl font-bold text-blue-600">{selectedCards.size}</p>
          </div>
        </div>

        {/* فلتر الحالة */}
        <div className="mb-8 flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterStatus('available')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'available'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            المتاح فقط
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            قيد المراجعة
          </button>
          <button
            onClick={() => setFilterStatus('sold')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'sold'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            المباعة
          </button>
        </div>

        {/* شبكة البطاقات */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-32">
          {filteredCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              isSelected={selectedCards.has(card.id)}
              onSelect={toggleCardSelection}
            />
          ))}
        </div>

        {/* ملخص السلة - ثابت أسفل الصفحة */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 items-center">
              {/* عدد البطاقات */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">عدد البطاقات</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">
                  {selectedCards.size}
                </p>
              </div>

              {/* شريط التقدم */}
              <div className="hidden md:block">
                <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
                    style={{
                      width: `${(selectedCards.size / (cards.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* السعر */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">المبلغ الإجمالي</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  {totalPrice} ر.س
                </p>
              </div>

              {/* الأزرار */}
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  disabled={selectedCards.size === 0}
                  className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-bold rounded-lg transition text-sm md:text-base"
                >
                  مسح
                </button>
                <button
                  onClick={onCheckout}
                  disabled={selectedCards.size === 0}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-sm md:text-base"
                >
                  دفع
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
