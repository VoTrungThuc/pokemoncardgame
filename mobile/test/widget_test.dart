import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/main.dart';

void main() {
  setUp(() {
    // Provide mock values for SharedPreferences to prevent error on loading session
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('Login screen elements rendering test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that loader completes and shows LoginScreen because user is not authenticated
    await tester.pumpAndSettle();

    // Verify that the title POKÉCARD STORE is present
    expect(find.text('POKÉCARD STORE'), findsOneWidget);
    expect(find.text('SÀN GIAO DỊCH THẺ BÀI POKÉMON CAO CẤP'), findsOneWidget);

    // Verify login form headers and input fields
    expect(find.text('Đăng Nhập Hệ Thống'), findsOneWidget);
    expect(find.text('Tên đăng nhập'), findsOneWidget);
    expect(find.text('Mật khẩu'), findsOneWidget);

    // Verify existence of inputs and the submit button
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.text('ĐĂNG NHẬP TRAINER'), findsOneWidget);
  });
}

