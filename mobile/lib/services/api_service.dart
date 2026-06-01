import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';
import '../models/cart_item.dart';
import '../models/order.dart';
import '../models/trade.dart';
import '../models/auction.dart';
import '../models/chat_message.dart';

class ApiService {
  static const String _baseUrlAndroid = 'http://10.0.2.2:8080';
  static const String _baseUrlIos = 'http://localhost:8080';
  
  // Default to emulator IP, in production this would be the Railway URL
  static String get baseUrl => _baseUrlAndroid;

  static Function()? onAuthFailedCallback;

  // Set auth failed callback to reset UI on token loss
  static void onAuthFailed(Function() callback) {
    onAuthFailedCallback = callback;
  }

  // Get authorization headers
  static Future<Map<String, String>> _headers() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Helper method for GET requests with automatic token refresh
  static Future<http.Response> get(String path) async {
    final url = Uri.parse('$baseUrl$path');
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 401 || response.statusCode == 403) {
      final refreshed = await _attemptTokenRefresh();
      if (refreshed) {
        return await http.get(url, headers: await _headers());
      } else {
        _handleSessionExpiry();
      }
    }
    return response;
  }

  // Helper method for POST requests with automatic token refresh
  static Future<http.Response> post(String path, dynamic body) async {
    final url = Uri.parse('$baseUrl$path');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode(body),
    );

    if (response.statusCode == 401 || response.statusCode == 403) {
      final refreshed = await _attemptTokenRefresh();
      if (refreshed) {
        return await http.post(
          url,
          headers: await _headers(),
          body: jsonEncode(body),
        );
      } else {
        _handleSessionExpiry();
      }
    }
    return response;
  }

  // Helper method for PUT requests
  static Future<http.Response> put(String path, [dynamic body]) async {
    final url = Uri.parse('$baseUrl$path');
    final response = await http.put(
      url,
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    );

    if (response.statusCode == 401 || response.statusCode == 403) {
      final refreshed = await _attemptTokenRefresh();
      if (refreshed) {
        return await http.put(
          url,
          headers: await _headers(),
          body: body != null ? jsonEncode(body) : null,
        );
      } else {
        _handleSessionExpiry();
      }
    }
    return response;
  }

  // Helper method for DELETE requests
  static Future<http.Response> delete(String path) async {
    final url = Uri.parse('$baseUrl$path');
    final response = await http.delete(url, headers: await _headers());

    if (response.statusCode == 401 || response.statusCode == 403) {
      final refreshed = await _attemptTokenRefresh();
      if (refreshed) {
        return await http.delete(url, headers: await _headers());
      } else {
        _handleSessionExpiry();
      }
    }
    return response;
  }

  // Attempt to refresh JWT tokens silently
  static Future<bool> _attemptTokenRefresh() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refreshToken');
    if (refreshToken == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          final newAccessToken = data['data']['accessToken'];
          final newRefreshToken = data['data']['refreshToken'];
          await prefs.setString('token', newAccessToken);
          if (newRefreshToken != null) {
            await prefs.setString('refreshToken', newRefreshToken);
          }
          return true;
        }
      }
    } catch (e) {
      print('Token refresh error: $e');
    }
    return false;
  }

  // Clear local session on login failure or expiry
  static void _handleSessionExpiry() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('refreshToken');
    await prefs.remove('user');
    if (onAuthFailedCallback != null) {
      onAuthFailedCallback!();
    }
  }

  // Resolve Image URL
  static String resolveImageUrl(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) {
      return 'https://images.pokemontcg.io/swsh35/20.png';
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return '$baseUrl$imageUrl';
  }

  // --- API ENDPOINTS MAPPED ---

  // Auth API
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['data']['token']);
      await prefs.setString('refreshToken', data['data']['refreshToken']);
      await prefs.setString('user', jsonEncode(data['data']));
      return data['data'];
    }
    throw Exception(data['message'] ?? 'Login failed');
  }

  static Future<bool> register(Map<String, dynamic> userData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(userData),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return true;
    }
    throw Exception(data['message'] ?? 'Registration failed');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refreshToken');
    if (refreshToken != null) {
      try {
        await http.post(
          Uri.parse('$baseUrl/api/auth/logout'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'refreshToken': refreshToken}),
        );
      } catch (e) {
        print('Logout endpoint error: $e');
      }
    }
    await prefs.remove('token');
    await prefs.remove('refreshToken');
    await prefs.remove('user');
  }

  // Products & Cards
  static Future<List<Product>> getProducts() async {
    final response = await get('/api/products?size=200');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        final content = data['data']['content'] as List? ?? data['data'] as List? ?? [];
        return content.map((p) => Product.fromJson(p)).toList();
      }
    }
    return [];
  }

  static Future<Product> getProductById(int id) async {
    final response = await get('/api/products/$id');
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Product.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Failed to load card details');
  }

  // Cart
  static Future<List<CartItem>> getCart() async {
    final response = await get('/api/cart');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        final list = data['data'] as List? ?? [];
        return list.map((i) => CartItem.fromJson(i)).toList();
      }
    }
    return [];
  }

  static Future<List<CartItem>> addToCart(int productId, int quantity) async {
    final response = await post('/api/cart?productId=$productId&quantity=$quantity', {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      final list = data['data'] as List? ?? [];
      return list.map((i) => CartItem.fromJson(i)).toList();
    }
    throw Exception(data['message'] ?? 'Failed to add card to cart');
  }

  static Future<List<CartItem>> updateCartItemQty(int itemId, int quantity) async {
    final response = await put('/api/cart/$itemId?quantity=$quantity');
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      final list = data['data'] as List? ?? [];
      return list.map((i) => CartItem.fromJson(i)).toList();
    }
    throw Exception(data['message'] ?? 'Failed to update quantity');
  }

  static Future<List<CartItem>> deleteCartItem(int itemId) async {
    final response = await delete('/api/cart/$itemId');
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      final list = data['data'] as List? ?? [];
      return list.map((i) => CartItem.fromJson(i)).toList();
    }
    throw Exception(data['message'] ?? 'Failed to delete cart item');
  }

  static Future<void> clearCart() async {
    final response = await delete('/api/cart/clear');
    if (response.statusCode != 200) {
      throw Exception('Failed to clear cart');
    }
  }

  // Orders
  static Future<Order> placeOrder(Map<String, dynamic> orderData) async {
    final response = await post('/api/orders', orderData);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Order.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Order placement failed');
  }

  static Future<List<Order>> getOrders() async {
    final response = await get('/api/orders');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        final list = data['data'] as List? ?? [];
        return list.map((o) => Order.fromJson(o)).toList();
      }
    }
    return [];
  }

  static Future<void> cancelOrder(int id) async {
    final response = await put('/api/orders/$id/cancel');
    if (response.statusCode != 200) {
      throw Exception('Failed to cancel order');
    }
  }

  // Trades
  static Future<List<Trade>> getUserTrades(int userId) async {
    final response = await get('/api/trades/user/$userId');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        final list = data['data'] as List? ?? [];
        return list.map((t) => Trade.fromJson(t)).toList();
      }
    }
    return [];
  }

  static Future<Trade> createTrade(Map<String, dynamic> tradeData) async {
    final response = await post('/api/trades', tradeData);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Trade.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Trade proposal rejected');
  }

  static Future<Trade> acceptTrade(int id) async {
    final response = await put('/api/trades/$id/accept');
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Trade.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Trade acceptance failed');
  }

  static Future<Trade> rejectTrade(int id) async {
    final response = await put('/api/trades/$id/reject');
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Trade.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Trade rejection failed');
  }

  // Auctions
  static Future<List<Auction>> getAuctions() async {
    final response = await get('/api/auctions');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        final list = data['data'] as List? ?? [];
        return list.map((a) => Auction.fromJson(a)).toList();
      }
    }
    return [];
  }

  static Future<Auction> getAuctionById(int id) async {
    final response = await get('/api/auctions/$id');
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Auction.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Failed to load auction details');
  }

  static Future<Auction> placeBid(int id, double amount) async {
    final response = await post('/api/auctions/$id/bid?amount=$amount', {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Auction.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Bid placement failed');
  }

  // Chat
  static Future<List<ChatMessage>> getChatHistory() async {
    final response = await get('/api/chat');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        final list = data['data'] as List? ?? [];
        return list.map((m) => ChatMessage.fromJson(m)).toList();
      }
    }
    return [];
  }

  static Future<ChatMessage> sendChatMessage(String message) async {
    final response = await post('/api/chat?message=${Uri.encodeComponent(message)}', {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return ChatMessage.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Failed to send message');
  }

  // Locations
  static Future<List<Map<String, dynamic>>> getLocations() async {
    final response = await get('/api/locations');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        return List<Map<String, dynamic>>.from(data['data']);
      }
    }
    return [];
  }

  // Notifications
  static Future<List<Map<String, dynamic>>> getNotifications() async {
    final response = await get('/api/notifications');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        return List<Map<String, dynamic>>.from(data['data']);
      }
    }
    return [];
  }

  static Future<void> markNotificationRead(int id) async {
    await put('/api/notifications/$id/read');
  }
}
