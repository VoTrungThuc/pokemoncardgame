import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';


const getDevHost = () => {
  
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const address = scriptURL.split('://')[1]?.split('/')[0];
    const host = address?.split(':')[0];
    if (host) {
      if (host === 'localhost' || host === '127.0.0.1') {
        return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
      }
      return host;
    }
  }

  
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const DEFAULT_HOST = getDevHost();
const API_BASE_URL = `http://${DEFAULT_HOST}:8080`;
console.log('[API] Backend URL set to:', API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];
let authFailedCallback = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

let serverTimeOffset = 0;


client.interceptors.response.use((response) => {
  if (response.headers && response.headers.date) {
    const serverTime = Date.parse(response.headers.date);
    if (!isNaN(serverTime)) {
      serverTimeOffset = serverTime - Date.now();
    }
  }
  return response;
}, async (error) => {
  const originalRequest = error.config;

  if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return client(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      isRefreshing = false;
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      if (authFailedCallback) {
        authFailedCallback();
      }
      return Promise.reject(error);
    }

    return new Promise(function(resolve, reject) {
      axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken })
        .then(async ({ data }) => {
          if (data && data.success) {
            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken;
            await AsyncStorage.setItem('token', newAccessToken);
            if (newRefreshToken) {
              await AsyncStorage.setItem('refreshToken', newRefreshToken);
            }
            client.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            processQueue(null, newAccessToken);
            resolve(client(originalRequest));
          } else {
            processQueue(new Error('Failed to refresh token'));
            reject(error);
          }
        })
        .catch(async (err) => {
          processQueue(err);
          await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
          if (authFailedCallback) {
            authFailedCallback();
          }
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }

  return Promise.reject(error);
});


const unwrap = (res) => {
  return res.data && res.data.success ? res.data.data : res.data;
};

export const api = {
  
  onAuthFailed: (callback) => {
    authFailedCallback = callback;
  },

  
  resolveImageUrl: (imageUrl) => {
    if (!imageUrl) return 'https://images.pokemontcg.io/swsh35/20.png';
    let resolved = imageUrl;
    if (!imageUrl.startsWith('http')) {
      resolved = `${API_BASE_URL}${imageUrl}`;
    }
    if (resolved.includes('images.pokemontcg.io')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(resolved)}`;
    }
    return resolved;
  },

  
  getBaseUrl: () => API_BASE_URL,

  
  getServerTime: () => Date.now() + serverTimeOffset,

  
  login: async (credentials) => {
    const data = await client.post('/api/auth/login', credentials).then(unwrap);
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      }));
    }
    return data;
  },
  register: (userData) => client.post('/api/auth/register', userData).then(unwrap),
  logout: async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await client.post('/api/auth/logout', { refreshToken }).then(unwrap);
      } catch (e) {
        console.error('Logout error', e);
      }
    }
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
  },

  
  getProducts: (params) => client.get('/api/products', { params }).then(res => {
    const data = unwrap(res);
    return data && data.content ? data.content : (Array.isArray(data) ? data : []);
  }),
  getProductById: (id) => client.get(`/api/products/${id}`).then(unwrap),

  
  getCart: () => client.get('/api/cart').then(unwrap),
  addToCart: (productId, quantity) => client.post(`/api/cart?productId=${productId}&quantity=${quantity}`).then(unwrap),
  updateCartItemQty: (id, quantity) => client.put(`/api/cart/${id}?quantity=${quantity}`).then(unwrap),
  deleteCartItem: (id) => client.delete(`/api/cart/${id}`).then(unwrap),
  clearCart: () => client.delete('/api/cart/clear').then(unwrap),

  
  placeOrder: (orderData) => client.post('/api/orders', orderData).then(unwrap),
  getOrders: () => client.get('/api/orders').then(unwrap),
  getOrderById: (id) => client.get(`/api/orders/${id}`).then(unwrap),
  cancelOrder: (id) => client.put(`/api/orders/${id}/cancel`).then(unwrap),

  
  getNotifications: () => client.get('/api/notifications').then(unwrap),
  markNotificationRead: (id) => client.put(`/api/notifications/${id}/read`).then(unwrap),

  
  getLocations: () => client.get('/api/locations').then(unwrap),

  
  getChatHistory: () => client.get('/api/chat').then(unwrap),
  sendChatMessage: (message) => client.post(`/api/chat?message=${encodeURIComponent(message)}`).then(unwrap),
  getAdminChatUsers: () => client.get('/api/chat/admin/users').then(unwrap),
  getAdminCustomerChatHistory: (userId) => client.get(`/api/chat/admin/${userId}`).then(unwrap),
  sendAdminChatMessage: (userId, message) => client.post(`/api/chat/admin/${userId}?message=${encodeURIComponent(message)}`).then(unwrap),

  
  getCards: () => client.get('/api/products?size=200').then(res => {
    const data = unwrap(res);
    return data && data.content ? data.content : (Array.isArray(data) ? data : []);
  }),

  
  getListings: (availableOnly) => client.get('/api/listings', { params: { availableOnly } }).then(unwrap),
  createListing: (listingData) => client.post('/api/listings', listingData).then(unwrap),
  createPaymentUrl: (orderId) => client.get(`/api/payment/create-payment?orderId=${orderId}`).then(unwrap),
  createTopUpPayment: (amount) => client.get('/api/payment/create-topup', { params: { amount } }).then(unwrap),
  getTopUpStatus: (txnRef) => client.get('/api/payment/topup-status', { params: { txnRef } }).then(unwrap),
  createTrade: (tradeData) => client.post('/api/trades', tradeData).then(unwrap),
  getUserTrades: (userId) => client.get(`/api/trades/user/${userId}`).then(unwrap),
  acceptTrade: (id) => client.put(`/api/trades/${id}/accept`).then(unwrap),
  rejectTrade: (id) => client.put(`/api/trades/${id}/reject`).then(unwrap),

  
  createProduct: (productData) => client.post('/api/products', productData).then(unwrap),
  updateProduct: (id, productData) => client.put(`/api/products/${id}`, productData).then(unwrap),
  deleteProduct: (id) => client.delete(`/api/products/${id}`).then(unwrap),

  
  updateOrderStatus: (id, status) => client.put(`/api/orders/${id}/status?status=${status}`).then(unwrap),

  
  getAuctions: () => client.get('/api/auctions').then(unwrap),
  getAuctionById: (id) => client.get(`/api/auctions/${id}`).then(unwrap),
  placeBid: (id, amount) => client.post(`/api/auctions/${id}/bid?amount=${amount}`).then(unwrap),
  createAuction: (data) => client.post('/api/auctions', data).then(unwrap),
  deleteAuction: (id) => client.delete(`/api/auctions/${id}`).then(unwrap),
  resetAuctions: () => client.post('/api/auctions/reset').then(unwrap),
};
