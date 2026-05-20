'use client'

import React from 'react'
import { Card } from '@/types'

interface CardItemProps {
  card: Card
  isSelected: boolean
  onSelect: (cardId: number) => void
}

export default function CardItem({ card, isSelected, onSelect }: CardItemProps) {
  const getStatusColor = () => {
    switch (card.status) {
      case 'available':
        return 'bg-green-50 hover:bg-green-100 border-green-300 cursor-pointer'
      case 'pending':
        return 'bg-yellow-50 border-yellow-300 opacity-75 cursor-not-allowed'
      case 'sold':
        return 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
      default:
        return 'bg-white border-gray-300'
    }
  }

  const isDisabled = card.status !== 'available'

  const getStatusLabel = () => {
    switch (card.status) {
      case 'available':
        return '✓ متاح'
      case 'pending':
        return '⏳ قيد المراجعة'
      case 'sold':
        return '✗ مباع'
      default:
        return ''
    }
  }

  const getStatusLabelColor = () => {
    switch (card.status) {
      case 'available':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'sold':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <button
      onClick={() => !isDisabled && onSelect(card.id)}
      disabled={isDisabled}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${getStatusColor()}
        ${isSelected ? 'ring-4 ring-blue-400 scale-105 shadow-lg' : ''}
        ${isDisabled ? 'cursor-not-allowed' : ''}
      `}
    >
      {/* رقم البطاقة */}
      <div className="text-3xl font-bold text-gray-800 mb-2">
        {card.card_number}
      </div>

      {/* حالة البطاقة */}
      <div className={`text-xs font-semibold ${getStatusLabelColor()}`}>
        {getStatusLabel()}
      </div>

      {/* علامة التحديد */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">
          ✓
        </div>
      )}
    </button>
  )
}
