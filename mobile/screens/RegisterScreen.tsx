import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native'
import { useAuthStore } from '@/store/authStore'

export default function RegisterScreen({ navigation }: any) {
  const { signUp, isLoading, error, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength += 20
    if (/[a-z]/.test(pwd)) strength += 20
    if (/[A-Z]/.test(pwd)) strength += 20
    if (/[0-9]/.test(pwd)) strength += 20
    if (/[!@#$%^&*]/.test(pwd)) strength += 20
    setPasswordStrength(strength)
  }

  const handleRegister = async () => {
    if (!email || !password || !fullName || !phone) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول')
      return
    }

    if (passwordStrength < 100) {
      Alert.alert('خطأ', 'كلمة المرور ضعيفة. تحتاج: 8+ أحرف، أحرف كبيرة، أحرف صغيرة، أرقام، رموز')
      return
    }

    try {
      await signUp(email, password, fullName, phone)
      Alert.alert('نجاح', 'تم إنشاء حسابك. يرجى التحقق من بريدك')
      navigation.navigate('Login')
    } catch (err: any) {
      Alert.alert('فشل التسجيل', error || err.message)
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
          إنشاء حساب جديد
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
          placeholder="الاسم الكامل"
          value={fullName}
          onChangeText={setFullName}
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
          placeholder="رقم الهاتف (السعودي)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
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
          onChangeText={(pwd) => {
            setPassword(pwd)
            calculatePasswordStrength(pwd)
          }}
          secureTextEntry
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

        {password && (
          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                height: 4,
                backgroundColor: '#ddd',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${passwordStrength}%`,
                  height: '100%',
                  backgroundColor:
                    passwordStrength <= 40
                      ? '#ff4444'
                      : passwordStrength <= 80
                      ? '#ffaa00'
                      : '#44aa44',
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              قوة كلمة المرور: {passwordStrength}%
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleRegister}
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
            <Text style={{ color: '#fff', fontWeight: '700' }}>إنشاء حساب</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#0066cc', fontWeight: '600' }}>هل لديك حساب؟ سجل دخول</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
