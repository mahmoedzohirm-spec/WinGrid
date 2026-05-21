import React from 'react'
import { View, Text, SafeAreaView, Button, TouchableOpacity } from 'react-native'
import { useAuthStore } from '@/store/authStore'

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuthStore()

  const handleLogout = async () => {
    try {
      await signOut()
      navigation.navigate('Login')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>🎰 WinGrid</Text>
      <Text style={{ color: '#555', marginBottom: 24 }}>
        مرحباً {user?.profile?.full_name || user?.email}
      </Text>

      <View style={{ width: '100%', gap: 12, marginBottom: 24 }}>
        <Button title="اختر البطاقات" onPress={() => navigation.navigate('Cards')} />
        <Button title="طلباتي" onPress={() => navigation.navigate('MyOrders')} />
        <Button title="الفائزون" onPress={() => navigation.navigate('Winners')} />
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          width: '100%',
          backgroundColor: '#ff4444',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
