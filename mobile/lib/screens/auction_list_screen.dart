import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/market_provider.dart';
import '../models/auction.dart';
import '../services/api_service.dart';

class AuctionListScreen extends StatefulWidget {
  const AuctionListScreen({super.key});

  @override
  State<AuctionListScreen> createState() => _AuctionListScreenState();
}

class _AuctionListScreenState extends State<AuctionListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<MarketProvider>(context, listen: false).fetchAuctions());
  }

  Widget _buildAuctionCard(Auction auc) {
    final resolvedImg = ApiService.resolveImageUrl(auc.imageUrl);

    return Card(
      color: Colors.white,
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: Colors.grey.shade100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 80,
              height: 100,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(6),
              child: Image.network(resolvedImg, fit: BoxFit.contain),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    auc.cardName,
                    style: const TextStyle(fontWeight: FontWeight.black, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Độ hiếm: ${auc.rarity ?? "Rare"} | Tình trạng: ${auc.condition ?? "Mint"}',
                    style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('GIÁ ĐẤU HIỆN TẠI', style: TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold)),
                          Text(
                            '\$${auc.currentBid.toStringAsFixed(2)}',
                            style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Color(0xFFE53935)),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () {
                          _showBidDialog(auc);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE53935),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                        child: const Text('ĐẤU GIÁ'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showBidDialog(Auction auc) {
    final controller = TextEditingController(text: (auc.currentBid + 5.0).toStringAsFixed(2));
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Đấu giá: ${auc.cardName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Giá hiện tại: \$${auc.currentBid.toStringAsFixed(2)}'),
            const SizedBox(height: 12),
            const Text('Nhập số tiền đấu giá của bạn:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: controller,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                prefixText: '\$ ',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () async {
              final val = double.tryParse(controller.text);
              if (val == null || val <= auc.currentBid) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Số tiền đấu giá phải cao hơn giá hiện tại!'), backgroundColor: Colors.red),
                );
                return;
              }
              Navigator.pop(ctx);
              try {
                await Provider.of<MarketProvider>(context, listen: false).placeBid(auc.id, val);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đặt giá thành công!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE53935)),
            child: const Text('Đặt Giá', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final market = Provider.of<MarketProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ĐẤU GIÁ LIVE (AUCTION)'),
      ),
      body: market.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
          : RefreshIndicator(
              onRefresh: () => market.fetchAuctions(),
              color: const Color(0xFFE53935),
              child: market.auctions.isEmpty
                  ? Center(
                      child: ListView(
                        shrinkWrap: true,
                        children: const [
                          Center(child: Icon(Icons.gavel_rounded, size: 64, color: Color(0xFF94A3B8))),
                          SizedBox(height: 12),
                          Center(
                            child: Text(
                              'Không có phiên đấu giá nào đang mở!',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: market.auctions.length,
                      padding: const EdgeInsets.all(16),
                      itemBuilder: (context, index) => _buildAuctionCard(market.auctions[index]),
                    ),
            ),
    );
  }
}
