import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/market_provider.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/product_detail_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/pack_simulator_screen.dart';
import 'screens/my_collection_screen.dart';
import 'screens/auction_list_screen.dart';
import 'screens/trade_dashboard_screen.dart';
import 'screens/location_list_screen.dart';
import 'screens/notification_list_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => MarketProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'PokeCard Store',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              useMaterial3: true,
              colorScheme: ColorScheme.fromSeed(
                seedColor: const Color(0xFFE53935),
                primary: const Color(0xFFE53935),
                secondary: const Color(0xFFD32F2F),
                surface: Colors.white,
                background: const Color(0xFFF8FAFC),
              ),
              appBarTheme: const AppBarTheme(
                backgroundColor: Colors.white,
                foregroundColor: Color(0xFF1E293B),
                elevation: 0,
                centerTitle: true,
                titleTextStyle: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Color(0xFF1E293B),
                ),
              ),
              inputDecorationTheme: InputDecorationTheme(
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              ),
            ),
            home: auth.isLoading
                ? const Scaffold(
                    body: Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFFE53935),
                      ),
                    ),
                  )
                : auth.isAuthenticated
                    ? const DashboardScreen()
                    : const LoginScreen(),
            routes: {
              '/login': (context) => const LoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/dashboard': (context) => const DashboardScreen(),
              '/checkout': (context) => const CheckoutScreen(),
              '/pack-simulator': (context) => const PackSimulatorScreen(),
              '/my-collection': (context) => const MyCollectionScreen(),
              '/auctions': (context) => const AuctionListScreen(),
              '/trades': (context) => const TradeDashboardScreen(),
              '/locations': (context) => const LocationListScreen(),
              '/notifications': (context) => const NotificationListScreen(),
            },
            onGenerateRoute: (settings) {
              if (settings.name == '/product-detail') {
                final args = settings.arguments as int;
                return MaterialPageRoute(
                  builder: (context) => ProductDetailScreen(productId: args),
                );
              }
              return null;
            },
          );
        },
      ),
    );
  }
}
