import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

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
    _isLoading = true;
    notifyListeners();
    try {
      await ApiService.register(userData);
    } finally {
      _isLoading = false;
      notifyListeners();
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
}
