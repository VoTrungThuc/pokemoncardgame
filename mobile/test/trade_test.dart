import 'package:flutter_test/flutter_test.dart';
import '../lib/models/product.dart';

void main() {
  group('Pokémon Trade Score Validation Logic Tests', () {
    test('Should allow trades when score difference is within 1.5 threshold', () {
      final offeredCard = Product(
        id: 1,
        name: 'Pikachu',
        brand: 'Pikachu',
        price: 20.0,
        stock: 1,
        isAvailable: true,
        score: 3.2,
      );

      final requestedCard = Product(
        id: 2,
        name: 'Charmander',
        brand: 'Charmander',
        price: 35.0,
        stock: 1,
        isAvailable: true,
        score: 4.1, // Difference = 0.9 <= 1.5
      );

      final diff = (offeredCard.score - requestedCard.score).abs();
      expect(diff <= 1.5, isTrue);
    });

    test('Should reject trades when score difference exceeds 1.5 threshold', () {
      final offeredCard = Product(
        id: 1,
        name: 'Pikachu',
        brand: 'Pikachu',
        price: 20.0,
        stock: 1,
        isAvailable: true,
        score: 2.2,
      );

      final requestedCard = Product(
        id: 2,
        name: 'Charizard VMAX',
        brand: 'Charizard',
        price: 250.0,
        stock: 1,
        isAvailable: true,
        score: 8.5, // Difference = 6.3 > 1.5
      );

      final diff = (offeredCard.score - requestedCard.score).abs();
      expect(diff <= 1.5, isFalse);
    });
  });
}
