import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/market_provider.dart';
import '../services/api_service.dart';

class MyCollectionScreen extends StatefulWidget {
  const MyCollectionScreen({super.key});

  @override
  State<MyCollectionScreen> createState() => _MyCollectionScreenState();
}

class _MyCollectionScreenState extends State<MyCollectionScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<MarketProvider>(context, listen: false).fetchProducts());
  }

  @override
  Widget build(BuildContext context) {
    final market = Provider.of<MarketProvider>(context);
    // Filter cards in catalog that represent user collection (e.g. mock owned cards)
    final ownedCards = market.products.take(6).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('BỘ SƯU TẬP CỦA TÔI'),
      ),
      body: market.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
          : ownedCards.isEmpty
              ? const Center(child: Text('Bộ sưu tập của bạn trống.'))
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 0.65,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: ownedCards.length,
                  itemBuilder: (context, index) {
                    final card = ownedCards[index];
                    final resolvedImg = ApiService.resolveImageUrl(card.imageUrl);

                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade100),
                      ),
                      padding: const EdgeInsets.all(6),
                      child: Column(
                        children: [
                          Expanded(child: Image.network(resolvedImg, fit: BoxFit.contain)),
                          const SizedBox(height: 4),
                          Text(
                            card.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                          ),
                          Text(
                            card.ram ?? 'Rare',
                            style: const TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
