import 'package:flutter/material.dart';
import 'package:mobile/features/cart/models/cart_item.dart';
import 'package:mobile/core/services/api_service.dart';

class CartProvider with ChangeNotifier {
  List<CartItem> _items = [];
  bool _isLoading = false;

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;

  double get totalAmount {
    double total = 0.0;
    for (var item in _items) {
      total += item.subtotal;
    }
    return total;
  }

  int get itemCount {
    int count = 0;
    for (var item in _items) {
      count += item.quantity;
    }
    return count;
  }

  // Fetch cart
  Future<void> fetchCart() async {
    _isLoading = true;
    notifyListeners();
    try {
      _items = await ApiService.getCart();
    } catch (e) {
      print('Error fetching cart: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add to cart
  Future<void> addToCart(int productId, int quantity) async {
    try {
      _items = await ApiService.addToCart(productId, quantity);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // Update quantity
  Future<void> updateQuantity(int itemId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    try {
      _items = await ApiService.updateCartItemQty(itemId, quantity);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // Remove item
  Future<void> removeItem(int itemId) async {
    try {
      _items = await ApiService.deleteCartItem(itemId);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // Clear cart
  Future<void> clearCart() async {
    try {
      await ApiService.clearCart();
      _items.clear();
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }
}
