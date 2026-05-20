import React, { useState } from 'react'
import { View, Text, Button, TextInput, Image, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl as string, supabaseKey as string)

export default function CheckoutScreen({ route, navigation }: any) {
  const selected = route.params?.selected || []
  const [fileUri, setFileUri] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('أذونات مرفوضة', 'يجب السماح للتطبيق بالوصول إلى الصور')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 })
    if (!result.cancelled) {
      setFileUri(result.uri)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // تبسيط: نتصل ب API الويب لإنشاء الطلب (يفترض المصادقة)
      // هنا نستخدم fetch للواجهة /api/orders/create (غير موجود) - يمكنك تعديل حسب الحاجة
      Alert.alert('نجاح', 'تم إرسال الطلب وسيتم مراجعته')
      navigation.navigate('MyOrders')
    } catch (err) {
      Alert.alert('خطأ', 'فشل في إنشاء الطلب')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>ملخص الطلب</Text>
      <Text>عدد البطاقات: {selected.length}</Text>

      <View style={{ marginTop: 16 }}>
        <Button title="اختر إيصال من المعرض" onPress={pickImage} />
        {fileUri && <Image source={{ uri: fileUri }} style={{ width: 200, height: 200, marginTop: 12 }} />}
      </View>

      <View style={{ marginTop: 24 }}>
        <Button title={isLoading ? 'جارٍ الإرسال...' : 'إرسال الطلب'} onPress={handleSubmit} />
      </View>
    </View>
  )
}
