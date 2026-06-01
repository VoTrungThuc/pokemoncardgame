import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

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


client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


client.interceptors.response.use((response) => {
  return response;
}, (error) => {
  const originalRequest = error.config;

  if (error.response && error.response.status === 401 && !originalRequest._retry) {
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

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      isRefreshing = false;
      return Promise.reject(error);
    }

    return new Promise(function(resolve, reject) {
      axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken })
        .then(({ data }) => {
          if (data && data.success) {
            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken;
            localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
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
        .catch((err) => {
          processQueue(err);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth-logout'));
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
  
  login: (credentials) => client.post('/api/auth/login', credentials).then(unwrap),
  register: (userData) => client.post('/api/auth/register', userData).then(unwrap),
  logout: (refreshToken) => client.post('/api/auth/logout', { refreshToken }).then(unwrap),

  
  getProducts: (params) => client.get('/api/products', { params }).then(res => {
    const data = unwrap(res);
    return data && data.content ? data.content : (Array.isArray(data) ? data : []);
  }),
  getCards: () => client.get('/api/products?size=200').then(res => {
    const data = unwrap(res);
    return data && data.content ? data.content : (Array.isArray(data) ? data : []);
  }),
  getProductById: (id) => client.get(`/api/products/${id}`).then(unwrap),
  createProduct: (productData) => client.post('/api/products', productData).then(unwrap),
  updateProduct: (id, productData) => client.put(`/api/products/${id}`, productData).then(unwrap),
  deleteProduct: (id) => client.delete(`/api/products/${id}`).then(unwrap),

  
  getCart: () => client.get('/api/cart').then(unwrap),
  addToCart: (productId, quantity) => client.post(`/api/cart?productId=${productId}&quantity=${quantity}`).then(unwrap),
  updateCartItemQty: (id, quantity) => client.put(`/api/cart/${id}?quantity=${quantity}`).then(unwrap),
  deleteCartItem: (id) => client.delete(`/api/cart/${id}`).then(unwrap),
  clearCart: () => client.delete('/api/cart/clear').then(unwrap),

  
  placeOrder: (orderData) => client.post('/api/orders', orderData).then(unwrap),
  getOrders: () => client.get('/api/orders').then(unwrap),
  getOrderById: (id) => client.get(`/api/orders/${id}`).then(unwrap),
  updateOrderStatus: (id, status) => client.put(`/api/orders/${id}/status?status=${status}`).then(unwrap),

  
  createPaymentUrl: (orderId) => client.get(`/api/payment/create-payment?orderId=${orderId}`).then(unwrap),
  verifyPaymentCallback: (params) => client.get('/api/payment/vnpay-callback', { params }).then(unwrap),

  
  getListings: (availableOnly) => client.get('/api/listings', { params: { availableOnly } }).then(unwrap),
  createListing: (listingData) => client.post('/api/listings', listingData).then(unwrap),
  createTrade: (tradeData) => client.post('/api/trades', tradeData).then(unwrap),
  getUserTrades: (userId) => client.get(`/api/trades/user/${userId}`).then(unwrap),
  acceptTrade: (id) => client.put(`/api/trades/${id}/accept`).then(unwrap),
  rejectTrade: (id) => client.put(`/api/trades/${id}/reject`).then(unwrap),

  
  getNotifications: () => client.get('/api/notifications').then(unwrap),
  markNotificationRead: (id) => client.put(`/api/notifications/${id}/read`).then(unwrap),

  
  getLocations: () => client.get('/api/locations').then(unwrap),

  
  getChatHistory: () => client.get('/api/chat').then(unwrap),
  sendChatMessage: (message) => client.post(`/api/chat?message=${encodeURIComponent(message)}`).then(unwrap),
  getAdminChatUsers: () => client.get('/api/chat/admin/users').then(unwrap),
  getAdminCustomerChatHistory: (userId) => client.get(`/api/chat/admin/${userId}`).then(unwrap),
  sendAdminChatMessage: (userId, message) => client.post(`/api/chat/admin/${userId}?message=${encodeURIComponent(message)}`).then(unwrap),

  
  getUsers: () => client.get('/api/users').then(unwrap),
  createAdmin: (adminData) => client.post('/api/users/admin', adminData).then(unwrap),
  updateUserRole: (id, role) => client.put(`/api/users/${id}/role`, { role }).then(unwrap),
};
