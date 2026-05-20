import React from 'react'
import { View, Text, SafeAreaView, Button } from 'react-native'

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>🎰 WinGrid</Text>
      <Text style={{ color: '#555', marginBottom: 24 }}>تطبيق المسابقات - اختر، ادفع، واربح!</Text>

      <View style={{ width: '100%', gap: 12 }}>
        <Button title="اختر البطاقات" onPress={() => navigation.navigate('Cards')} />
        <Button title="طلباتي" onPress={() => navigation.navigate('MyOrders')} />
        <Button title="الفائزون" onPress={() => navigation.navigate('Winners')} />
      </View>
    </SafeAreaView>
  )
}
