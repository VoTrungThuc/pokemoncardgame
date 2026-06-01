import 'dart:math';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PackSimulatorScreen extends StatefulWidget {
  const PackSimulatorScreen({super.key});

  @override
  State<PackSimulatorScreen> createState() => _PackSimulatorScreenState();
}

class _PackSimulatorScreenState extends State<PackSimulatorScreen> {
  bool _isOpening = false;
  List<Map<String, String>> _pulledCards = [];

  final List<Map<String, String>> _pool = [
    {'name': 'Charizard VMAX', 'rarity': 'Rainbow Rare', 'img': 'https://images.pokemontcg.io/swsh3/19_hir.png'},
    {'name': 'Pikachu VMAX', 'rarity': 'Ultra Rare', 'img': 'https://images.pokemontcg.io/swsh4/44.png'},
    {'name': 'Mewtwo GX', 'rarity': 'Secret Rare', 'img': 'https://images.pokemontcg.io/sm35/78.png'},
    {'name': 'Eternatus VMAX', 'rarity': 'Ultra Rare', 'img': 'https://images.pokemontcg.io/swsh3/117.png'},
    {'name': 'Rayquaza VMAX', 'rarity': 'Secret Rare', 'img': 'https://images.pokemontcg.io/swsh7/111.png'},
  ];

  void _openBoosterPack() {
    setState(() {
      _isOpening = true;
      _pulledCards.clear();
    });

    // Simulate drawing 3 cards randomly
    Future.delayed(const Duration(seconds: 2), () {
      final random = Random();
      final List<Map<String, String>> drawn = [];
      for (int i = 0; i < 3; i++) {
        drawn.add(_pool[random.nextInt(_pool.length)]);
      }
      if (mounted) {
        setState(() {
          _pulledCards = drawn;
          _isOpening = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MỞ GÓI BÀI POKÉMON'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_pulledCards.isEmpty && !_isOpening) ...[
                const Icon(Icons.auto_awesome, size: 80, color: Color(0xFFF59E0B)),
                const SizedBox(height: 16),
                const Text(
                  'Booster Pack Simulator',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.black),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Mở gói bài ngẫu nhiên để bổ sung vào Binder của bạn!',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _openBoosterPack,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE53935),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                  child: const Text('MỞ GÓI BÀI (FREE)', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ] else if (_isOpening) ...[
                const CircularProgressIndicator(color: Color(0xFFE53935)),
                const SizedBox(height: 20),
                const Text('Đang xé bao bì gói bài...', style: TextStyle(fontWeight: FontWeight.bold)),
              ] else ...[
                const Text(
                  'Kết quả mở gói bài của bạn! 🎉',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.black),
                ),
                const SizedBox(height: 24),
                // Horizontal list of drawn cards
                SizedBox(
                  height: 220,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    shrinkWrap: true,
                    itemCount: _pulledCards.length,
                    itemBuilder: (context, index) {
                      final card = _pulledCards[index];
                      return Container(
                        width: 130,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          children: [
                            Expanded(child: Image.network(card['img']!, fit: BoxFit.contain)),
                            const SizedBox(height: 8),
                            Text(
                              card['name']!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                            ),
                            Text(
                              card['rarity']!,
                              style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 8),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _openBoosterPack,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE53935),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('MỞ TIẾP GÓI KHÁC'),
                ),
                TextButton(
                  onPressed: () => setState(() => _pulledCards.clear()),
                  child: const Text('Quay lại'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
