'use client'

import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface WheelSegment {
  id: number
  label: string
  color: string
  prize: string
}

const wheelSegments: WheelSegment[] = [
  { id: 1, label: 'جائزة 1', color: '#FF6B6B', prize: '500 ريال' },
  { id: 2, label: 'جائزة 2', color: '#4ECDC4', prize: '1000 ريال' },
  { id: 3, label: 'جائزة 3', color: '#45B7D1', prize: '750 ريال' },
  { id: 4, label: 'جائزة 4', color: '#FFA07A', prize: '600 ريال' },
  { id: 5, label: 'جائزة 5', color: '#98D8C8', prize: '2000 ريال' },
  { id: 6, label: 'جائزة 6', color: '#F7DC6F', prize: '1500 ريال' },
  { id: 7, label: 'جائزة 7', color: '#BB8FCE', prize: '800 ريال' },
  { id: 8, label: 'جائزة 8', color: '#85C1E2', price: '3000 ريال' },
]

export default function LuckyWheel() {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<WheelSegment | null>(null)

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setWinner(null)

    // عشوائي بين 3 و 5 دورات كاملة
    const spins = Math.random() * 2 + 3
    // عشوائي بين 0 و 360
    const randomDegrees = Math.random() * 360
    const finalDegrees = spins * 360 + randomDegrees

    // إضافة الدوران
    const newRotation = rotation + finalDegrees
    setRotation(newRotation)

    // حساب الفائز بعد انتهاء الحركة (4 ثوان)
    setTimeout(() => {
      const normalizedRotation = newRotation % 360
      const segmentAngle = 360 / wheelSegments.length
      const winnerIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % wheelSegments.length
      setWinner(wheelSegments[winnerIndex])
      setIsSpinning(false)
    }, 4000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      {/* العنوان */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
          🎡 عجلة الحظ الرقمية
        </h1>
        <p className="text-gray-600">اضغط على الزر للسحب والفوز بجوائز رائعة!</p>
      </div>

      {/* العجلة */}
      <div className="relative mb-8">
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="drop-shadow-2xl"
        >
          {/* الحلقة الخارجية */}
          <circle
            cx="200"
            cy="200"
            r="195"
            fill="none"
            stroke="#333"
            strokeWidth="3"
          />
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="#666"
            strokeWidth="1"
          />

          {/* تطبيق الدوران */}
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '200px 200px', transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none' }}>
            {/* القطاعات */}
            {wheelSegments.map((segment, index) => {
              const angle = (360 / wheelSegments.length) * index
              const startAngle = (angle * Math.PI) / 180
              const endAngle = (((angle + 360 / wheelSegments.length) * Math.PI) / 180)
              const radius = 180

              const x1 = 200 + radius * Math.cos(startAngle)
              const y1 = 200 + radius * Math.sin(startAngle)
              const x2 = 200 + radius * Math.cos(endAngle)
              const y2 = 200 + radius * Math.sin(endAngle)

              const largeArc = 360 / wheelSegments.length > 180 ? 1 : 0

              const pathData = [
                `M 200 200`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`,
              ].join(' ')

              // نقطة النص
              const textAngle = startAngle + (endAngle - startAngle) / 2
              const textRadius = 130
              const textX = 200 + textRadius * Math.cos(textAngle)
              const textY = 200 + textRadius * Math.sin(textAngle)
              const textRotation = (textAngle * 180) / Math.PI + 90

              return (
                <g key={segment.id}>
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    transform={`rotate(${textRotation} ${textX} ${textY})`}
                    className="select-none"
                  >
                    {segment.prize}
                  </text>
                </g>
              )
            })}
          </g>

          {/* المركز */}
          <circle cx="200" cy="200" r="30" fill="#FFD700" stroke="#333" strokeWidth="2" />
          <circle cx="200" cy="200" r="20" fill="#FFA500" stroke="#333" strokeWidth="1" />
          <text
            x="200"
            y="210"
            textAnchor="middle"
            fill="#333"
            fontSize="24"
            fontWeight="bold"
            className="select-none"
          >
            🎲
          </text>
        </svg>

        {/* المؤشر العلوي */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
          <div className="w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-red-600"></div>
        </div>
      </div>

      {/* زر السحب */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="mb-8 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full hover:shadow-2xl transition transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSpinning ? '🔄 جاري السحب...' : '🎰 اسحب الآن'}
      </button>

      {/* نتيجة الفائز */}
      {winner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-sm animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              مبروك! أنت الفائز 🏆
            </h2>
            <p className="text-xl font-semibold text-gray-800 mb-6">
              {winner.prize}
            </p>
            <button
              onClick={() => setWinner(null)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="mt-12 max-w-2xl text-center">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm">عدد الجوائز</p>
            <p className="text-2xl font-bold text-purple-600">{wheelSegments.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm">الحد الأقصى للجائزة</p>
            <p className="text-2xl font-bold text-pink-600">3000 ريال</p>
          </div>
        </div>
      </div>
    </div>
  )
}
