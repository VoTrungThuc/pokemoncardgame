import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/auth/models/user.dart';
import 'package:mobile/core/services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = true;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _loadSession();
    ApiService.onAuthFailed(() {
      _clearSession();
    });
  }

  // Load token and user session locally
  Future<void> _loadSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userStr = prefs.getString('user');
      
      if (token != null && userStr != null) {
        _user = User.fromJson(jsonDecode(userStr));
        _isAuthenticated = true;
      }
    } catch (e) {
      print('Error loading session: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login
  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await ApiService.login(username, password);
      _user = User.fromJson(data);
      _isAuthenticated = true;
    } catch (e) {
      _clearSession();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Register
  Future<void> register(Map<String, dynamic> userData) async {
    try {
      await ApiService.register(userData);
    } catch (e) {
      rethrow;
    }
  }

  // Verify OTP
  Future<void> verifyOtp(String email, String otp) async {
    try {
      await ApiService.verifyOtp(email, otp);
    } catch (e) {
      rethrow;
    }
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    try {
      await ApiService.logout();
    } finally {
      _clearSession();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Session clearing
  void _clearSession() {
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  // Refresh profile details from the backend
  Future<void> refreshProfile() async {
    if (_user == null) return;
    try {
      final updatedUser = await ApiService.getUserProfile();
      _user = updatedUser;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(updatedUser.toJson()));
      notifyListeners();
    } catch (e) {
      print('Error refreshing profile: $e');
    }
  }

  // Deposit/Top-up money to user balance
  Future<void> deposit(double amount) async {
    if (_user == null) return;
    try {
      final updatedUser = await ApiService.depositBalance(amount);
      _user = updatedUser;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(updatedUser.toJson()));
      notifyListeners();
    } catch (e) {
      print('Error depositing: $e');
      rethrow;
    }
  }

  // Refund balance (for selling cards back to shop - bypasses deposit restrictions)
  Future<void> refund(double amount) async {
    if (_user == null) return;
    try {
      final updatedUser = await ApiService.refundBalance(amount);
      _user = updatedUser;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(updatedUser.toJson()));
      notifyListeners();
    } catch (e) {
      print('Error refunding: $e');
      rethrow;
    }
  }

  // Deduct balance (for buying card packs)
  Future<void> deduct(double amount) async {
    if (_user == null) return;
    try {
      final updatedUser = await ApiService.deductBalance(amount);
      _user = updatedUser;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(updatedUser.toJson()));
      notifyListeners();
    } catch (e) {
      print('Error deducting: $e');
      rethrow;
    }
  }

  // Update profile data (avatar, phone, address)
  Future<void> updateProfile(Map<String, dynamic> updateData) async {
    if (_user == null) return;
    try {
      final updatedUser = await ApiService.updateUserProfile(updateData);
      _user = updatedUser;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(updatedUser.toJson()));
      notifyListeners();
    } catch (e) {
      print('Error updating profile: $e');
      rethrow;
    }
  }
}
