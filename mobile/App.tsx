import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar, ActivityIndicator, View } from 'react-native'

import { useAuthStore } from './store/authStore'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import HomeScreen from './screens/Home'
import CardsScreen from './screens/CardsScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import MyOrdersScreen from './screens/MyOrdersScreen'
import WinnersScreen from './screens/WinnersScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const { isAuthenticated, getCurrentSession, isLoading } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    getCurrentSession().finally(() => setIsReady(true))
  }, [])

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        {!isAuthenticated ? (
          // شاشات المصادقة
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'تسجيل الدخول', headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'إنشاء حساب', headerShown: false }}
            />
          </>
        ) : (
          // شاشات التطبيق الرئيسية
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'WinGrid' }}
            />
            <Stack.Screen
              name="Cards"
              component={CardsScreen}
              options={{ title: 'اختر البطاقات' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: 'الدفع' }}
            />
            <Stack.Screen
              name="MyOrders"
              component={MyOrdersScreen}
              options={{ title: 'طلباتي' }}
            />
            <Stack.Screen
              name="Winners"
              component={WinnersScreen}
              options={{ title: 'الفائزون' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
