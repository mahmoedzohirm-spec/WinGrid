import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl as string, supabaseKey as string)

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    setOrders(data || [])
    setLoading(false)
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 8 }}>
            <Text style={{ fontWeight: '700' }}>#{item.id.slice(0, 8)} - {item.total_price} ر.س</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  )
}
