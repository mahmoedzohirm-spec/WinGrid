import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens (to be implemented)
const HomeScreen = () => <View style={{ flex: 1, backgroundColor: '#fff' }} />;
const CardsScreen = () => <View style={{ flex: 1, backgroundColor: '#fff' }} />;
const CheckoutScreen = () => <View style={{ flex: 1, backgroundColor: '#fff' }} />;
const MyOrdersScreen = () => <View style={{ flex: 1, backgroundColor: '#fff' }} />;
const WinnersScreen = () => <View style={{ flex: 1, backgroundColor: '#fff' }} />;

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'الرئيسية',
          tabBarLabel: 'الرئيسية',
        }}
      />
      <Tab.Screen
        name="Cards"
        component={CardsScreen}
        options={{
          title: 'البطاقات',
          tabBarLabel: 'البطاقات',
        }}
      />
      <Tab.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: 'السلة',
          tabBarLabel: 'السلة',
        }}
      />
      <Tab.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{
          title: 'طلباتي',
          tabBarLabel: 'طلباتي',
        }}
      />
      <Tab.Screen
        name="Winners"
        component={WinnersScreen}
        options={{
          title: 'الفائزون',
          tabBarLabel: 'الفائزون',
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const { isAuthenticated, loading, getCurrentSession } = useAuthStore();

  useEffect(() => {
    getCurrentSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
