import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../lib/models/product.dart';

void main() {
  testWidgets('Should render Pokémon Card information correctly in details UI card', (WidgetTester tester) async {
    final mockProduct = Product(
      id: 10,
      name: 'Charizard VMAX',
      brand: 'Charizard',
      price: 150.0,
      stock: 3,
      isAvailable: true,
      score: 5.5,
      cpu: 'Pokémon Card',
      camera: '330 HP',
      ram: 'Ultra Rare',
      rom: 'Mint',
    );

    // Build the simple test representation of the Card specs UI
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              Text(mockProduct.name),
              Text(mockProduct.brand),
              Text(mockProduct.cpu ?? ''),
              Text(mockProduct.camera ?? ''),
              Text(mockProduct.ram ?? ''),
              Text(mockProduct.rom ?? ''),
            ],
          ),
        ),
      ),
    );

    // Verify information is displayed correctly on screen
    expect(find.text('Charizard VMAX'), findsOneWidget);
    expect(find.text('Charizard'), findsOneWidget);
    expect(find.text('330 HP'), findsOneWidget);
    expect(find.text('Ultra Rare'), findsOneWidget);
    expect(find.text('Mint'), findsOneWidget);
  });
}
