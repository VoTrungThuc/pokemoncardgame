import 'package:flutter/material.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/features/trade/models/trade.dart';
import 'package:mobile/features/auction/models/auction.dart';
import 'package:mobile/core/services/api_service.dart';

class MarketProvider with ChangeNotifier {
  List<Product> _products = [];
  List<Trade> _trades = [];
  List<Auction> _auctions = [];
  bool _isLoading = false;

  List<Product> get products => _products;
  List<Trade> get trades => _trades;
  List<Auction> get auctions => _auctions;
  bool get isLoading => _isLoading;

  // Fetch all products/cards
  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();
    try {
      _products = await ApiService.getProducts();
    } catch (e) {
      print('Error loading cards catalog: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch auctions
  Future<void> fetchAuctions() async {
    _isLoading = true;
    notifyListeners();
    try {
      _auctions = await ApiService.getAuctions();
    } catch (e) {
      print('Error loading auctions: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Place incremental bid
  Future<void> placeBid(int auctionId, double amount) async {
    try {
      final updated = await ApiService.placeBid(auctionId, amount);
      final index = _auctions.indexWhere((a) => a.id == auctionId);
      if (index != -1) {
        _auctions[index] = updated;
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }

  // Create new auction
  Future<void> createAuction(Map<String, dynamic> auctionData) async {
    try {
      final created = await ApiService.createAuction(auctionData);
      _auctions.insert(0, created);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // Fetch user trades
  Future<void> fetchUserTrades(int userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _trades = await ApiService.getUserTrades(userId);
    } catch (e) {
      print('Error loading trades: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Propose trade
  Future<void> proposeTrade(int toUserId, int offeredCardId, int requestedCardId) async {
    try {
      final payload = {
        'toUserId': toUserId,
        'offeredCardId': offeredCardId,
        'requestedCardId': requestedCardId,
      };
      final t = await ApiService.createTrade(payload);
      _trades.insert(0, t);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // Accept trade
  Future<void> acceptTrade(int id) async {
    try {
      final t = await ApiService.acceptTrade(id);
      final index = _trades.indexWhere((item) => item.id == id);
      if (index != -1) {
        _trades[index] = t;
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }

  // Reject trade
  Future<void> rejectTrade(int id) async {
    try {
      final t = await ApiService.rejectTrade(id);
      final index = _trades.indexWhere((item) => item.id == id);
      if (index != -1) {
        _trades[index] = t;
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }
}
