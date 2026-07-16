import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Central helper for the (client-side) card collection storage.
///
/// The collection is namespaced per user id so that logging in with a
/// different account does not show another user's cards. Legacy global
/// keys are migrated into the current user's namespace on first access.
class CollectionStore {
  static const String _ownedBase = 'owned_card_ids';
  static const String _syncedBase = 'synced_purchase_order_ids';
  static const String _refundedBase = 'refunded_order_ids';

  static String _key(String base, int userId) => '${base}_$userId';

  static Future<void> _migrateLegacy(SharedPreferences prefs, int userId) async {
    for (final base in [_ownedBase, _syncedBase, _refundedBase]) {
      final legacy = prefs.getString(base);
      if (legacy != null) {
        final userKey = _key(base, userId);
        if (!prefs.containsKey(userKey)) {
          await prefs.setString(userKey, legacy);
        }
        await prefs.remove(base);
      }
    }
  }

  static List<int> _readList(SharedPreferences prefs, String key) {
    final json = prefs.getString(key);
    if (json == null) return [];
    try {
      return List<int>.from(jsonDecode(json));
    } catch (_) {
      return [];
    }
  }

  static Future<List<int>> getOwnedCardIds(int userId) async {
    final prefs = await SharedPreferences.getInstance();
    await _migrateLegacy(prefs, userId);
    return _readList(prefs, _key(_ownedBase, userId));
  }

  static Future<void> setOwnedCardIds(int userId, List<int> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key(_ownedBase, userId), jsonEncode(ids));
  }

  static Future<List<int>> getSyncedOrderIds(int userId) async {
    final prefs = await SharedPreferences.getInstance();
    await _migrateLegacy(prefs, userId);
    return _readList(prefs, _key(_syncedBase, userId));
  }

  static Future<void> setSyncedOrderIds(int userId, List<int> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key(_syncedBase, userId), jsonEncode(ids));
  }

  static Future<List<int>> getRefundedOrderIds(int userId) async {
    final prefs = await SharedPreferences.getInstance();
    await _migrateLegacy(prefs, userId);
    return _readList(prefs, _key(_refundedBase, userId));
  }

  static Future<void> setRefundedOrderIds(int userId, List<int> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key(_refundedBase, userId), jsonEncode(ids));
  }
}
