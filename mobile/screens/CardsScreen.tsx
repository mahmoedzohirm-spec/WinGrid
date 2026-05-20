import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl as string, supabaseKey as string)

export default function CardsScreen({ navigation }: any) {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cards').select('*').order('card_number')
    if (error) console.error(error)
    setCards(data || [])
    setLoading(false)
  }

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Checkout', { selected: [item.id] })}
      disabled={item.status !== 'available'}
      style={{
        flex: 1,
        margin: 6,
        padding: 12,
        backgroundColor: item.status === 'available' ? '#e6f7ff' : '#f3f3f3',
        borderRadius: 8,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{item.card_number}</Text>
      <Text style={{ color: '#666', marginTop: 6 }}>{item.status}</Text>
    </TouchableOpacity>
  )

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={3}
      />
    </View>
  )
}
