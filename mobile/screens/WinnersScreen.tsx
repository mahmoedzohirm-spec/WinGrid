import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl as string, supabaseKey as string)

export default function WinnersScreen() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('winners').select('*, users(full_name), cards(card_number)').order('announced_at', { ascending: false })
    if (error) console.error(error)
    setWinners(data || [])
    setLoading(false)
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={winners}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 8 }}>
            <Text style={{ fontWeight: '700' }}>{item.users?.full_name || 'مستخدم'}</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>بطاقة: {item.cards?.card_number || item.card_id}</Text>
            <Text style={{ color: '#333', marginTop: 6 }}>الجائزة: {item.prize}</Text>
          </View>
        )}
      />
    </View>
  )
}
