import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'react-native'

import HomeScreen from './screens/Home'
import CardsScreen from './screens/CardsScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import MyOrdersScreen from './screens/MyOrdersScreen'
import WinnersScreen from './screens/WinnersScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'WinGrid' }} />
        <Stack.Screen name="Cards" component={CardsScreen} options={{ title: 'اختر البطاقات' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'الدفع' }} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'طلباتي' }} />
        <Stack.Screen name="Winners" component={WinnersScreen} options={{ title: 'الفائزون' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
