import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _local =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'pokemon_chat',
    'Tin nhắn chat',
    description: 'Thông báo tin nhắn mới từ PokeCard Store',
    importance: Importance.high,
  );

  /// Must be called from a top-level function (won't be used unless background
  /// messages require it; kept for completeness).
  static Future<void> firebaseBackgroundHandler(RemoteMessage message) async {
    await Firebase.initializeApp();
  }

  static Future<void> init({
    required Future<void> Function(String token) onTokenReceived,
  }) async {
    await Firebase.initializeApp();

    FirebaseMessaging.onBackgroundMessage(firebaseBackgroundHandler);

    await _local
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidInit);
    await _local.initialize(initSettings);

    // Foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      if (notification != null) {
        _local.show(
          notification.hashCode,
          notification.title,
          notification.body,
          NotificationDetails(
            android: AndroidNotificationDetails(
              _channel.id,
              _channel.name,
              channelDescription: _channel.description,
              importance: Importance.high,
              priority: Priority.high,
              icon: '@mipmap/ic_launcher',
            ),
          ),
        );
      }
    });

    // When the user taps the notification and the app opens from background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      // App is already routing to the chat screen via polling; nothing extra needed.
    });

    // Get the token (regenerated on first run and after uninstall/reinstall)
    final token = await _messaging.getToken();
    if (token != null) {
      await onTokenReceived(token);
    }

    // Token can rotate; forward updates too
    _messaging.onTokenRefresh.listen((newToken) {
      onTokenReceived(newToken);
    });
  }
}
