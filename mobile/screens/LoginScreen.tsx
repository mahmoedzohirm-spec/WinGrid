import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native'
import { useAuthStore } from '@/store/authStore'

export default function LoginScreen({ navigation }: any) {
  const { signIn, isLoading, error, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'الرجاء إدخال البريد والكلمة')
      return
    }

    try {
      await signIn(email, password)
      navigation.navigate('Home')
    } catch (err: any) {
      Alert.alert('فشل تسجيل الدخول', error || err.message)
      setError(null)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          🎰 WinGrid
        </Text>
        <Text style={{ color: '#666', marginBottom: 24, textAlign: 'center' }}>
          تسجيل الدخول
        </Text>

        <TextInput
          placeholder="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            textAlign: 'right',
          }}
          editable={!isLoading}
        />

        <TextInput
          placeholder="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 12,
            marginBottom: 24,
            borderRadius: 8,
            textAlign: 'right',
          }}
          editable={!isLoading}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: '#0066cc',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700' }}>دخول</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#0066cc', fontWeight: '600' }}>ليس لديك حساب؟ سج�� الآن</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
