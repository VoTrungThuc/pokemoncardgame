import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, LogBox } from 'react-native';


LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  'Non-serializable values were found in the navigation state'
]);
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api } from './src/services/api';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';


import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationListScreen from './src/screens/NotificationListScreen';
import LocationListScreen from './src/screens/LocationListScreen';
import TradeDashboardScreen from './src/screens/TradeDashboardScreen';
import TradeProposeScreen from './src/screens/TradeProposeScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AuctionListScreen from './src/screens/AuctionListScreen';
import AuctionDetailScreen from './src/screens/AuctionDetailScreen';
import PackSimulatorScreen from './src/screens/PackSimulatorScreen';
import MyCollectionScreen from './src/screens/MyCollectionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function MainTabNavigator({ userRole, onLogout }) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'InventoryTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e53935',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#f3f4f6',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        },
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 16,
          color: '#111827',
        },
        headerTitleAlign: 'center',
      })}
    >
      {userRole === 'ADMIN' ? (
        <>
          <Tab.Screen 
            name="InventoryTab" 
            component={InventoryScreen} 
            options={{ title: 'Quản lý kho' }} 
          />
          <Tab.Screen 
            name="OrdersTab" 
            component={OrderHistoryScreen} 
            options={{ title: 'Đơn hàng' }} 
          />
          <Tab.Screen 
            name="ChatTab" 
            component={ChatScreen} 
            options={{ title: 'Trò chuyện' }} 
          />
          <Tab.Screen 
            name="ProfileTab" 
            component={ProfileScreen} 
            initialParams={{ onLogout }}
            options={{ title: 'Tài khoản' }} 
          />
        </>
      ) : (
        <>
          <Tab.Screen 
            name="HomeTab" 
            component={HomeScreen} 
            options={{ title: 'Cửa hàng' }} 
          />
          <Tab.Screen 
            name="CartTab" 
            component={CartScreen} 
            options={{ title: 'Giỏ hàng' }} 
          />
          <Tab.Screen 
            name="OrdersTab" 
            component={OrderHistoryScreen} 
            options={{ title: 'Đơn hàng' }} 
          />
          <Tab.Screen 
            name="ChatTab" 
            component={ChatScreen} 
            options={{ title: 'Trò chuyện' }} 
          />
          <Tab.Screen 
            name="ProfileTab" 
            component={ProfileScreen} 
            initialParams={{ onLogout }}
            options={{ title: 'Tài khoản' }} 
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const [checkingAuth, setCheckingAuth] = useState(true);

  
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        const userObj = JSON.parse(userStr);
        setUserRole(userObj.role || 'USER');
      }
      setIsAuthenticated(!!token);
    } catch (e) {
      console.error('Error checking authentication status', e);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
    api.onAuthFailed(() => {
      handleLogoutSuccess();
    });
  }, []);

  const handleLoginSuccess = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        setUserRole(userObj.role || 'USER');
      }
    } catch (e) {
      console.error('Error reading user role on login', e);
    }
    setIsAuthenticated(true);
  };

  const handleLogoutSuccess = () => {
    setUserRole('USER');
    setIsAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.splashText}>Đang khởi động PokeCard Store...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 3,
            },
            headerTitleStyle: {
              fontWeight: '900',
              fontSize: 16,
              color: '#111827',
            },
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerTintColor: '#e53935',
          }}
        >
          {!isAuthenticated ? (
            
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                initialParams={{ onLogin: handleLoginSuccess }}
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
                options={{ title: 'Đăng Ký Trainer' }} 
              />
            </>
          ) : (
            
            <>
              <Stack.Screen name="Main" options={{ headerShown: false }}>
                {props => (
                  <MainTabNavigator 
                    {...props} 
                    userRole={userRole} 
                    onLogout={handleLogoutSuccess} 
                  />
                )}
              </Stack.Screen>
              <Stack.Screen 
                name="ProductDetail" 
                component={ProductDetailScreen} 
                options={{ title: 'Chi Tiết Thẻ Bài' }} 
              />
              <Stack.Screen 
                name="Checkout" 
                component={CheckoutScreen} 
                options={{ title: 'Thanh Toán Đơn Hàng' }} 
              />
              <Stack.Screen 
                name="Notifications" 
                component={NotificationListScreen} 
                options={{ title: 'Thông Báo Hệ Thống' }} 
              />
              <Stack.Screen 
                name="Locations" 
                component={LocationListScreen} 
                options={{ title: 'Hệ Thống Cửa Hàng' }} 
              />
              <Stack.Screen 
                name="TradeDashboard" 
                component={TradeDashboardScreen} 
                options={{ title: 'Bảng Trao Đổi Thẻ' }} 
              />
              <Stack.Screen 
                name="TradePropose" 
                component={TradeProposeScreen} 
                options={{ title: 'Đề Xuất Trao Đổi' }} 
              />
              <Stack.Screen 
                name="AuctionList" 
                component={AuctionListScreen} 
                options={{ title: 'Đấu Giá Thẻ Bài' }} 
              />
              <Stack.Screen 
                name="AuctionDetail" 
                component={AuctionDetailScreen} 
                options={{ title: 'Chi Tiết Đấu Giá' }} 
              />
              <Stack.Screen 
                name="PackSimulator" 
                component={PackSimulatorScreen} 
                options={{ title: 'Mở Gói Bài' }} 
              />
              <Stack.Screen 
                name="MyCollection" 
                component={MyCollectionScreen} 
                options={{ title: 'Bộ Sưu Tập Của Tôi' }} 
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '800',
    marginTop: 16,
  },
});
