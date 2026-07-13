import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/auction/models/auction.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/widgets/retry_network_image.dart';

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
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final isAdmin = auth.user?.role == 'ADMIN';

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          '/auction-detail',
          arguments: auc.id,
        );
      },
      child: Card(
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
              child: RetryNetworkImage(url: resolvedImg, fit: BoxFit.contain),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    auc.cardName,
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
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
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFFE53935)),
                          ),
                        ],
                      ),
                      isAdmin
                          ? ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(
                                  context,
                                  '/auction-detail',
                                  arguments: auc.id,
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1E293B),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                                elevation: 0,
                              ),
                              child: const Text('CHI TIẾT'),
                            )
                          : ElevatedButton(
                              onPressed: auc.isActive
                                  ? () {
                                      _showBidDialog(auc);
                                    }
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: auc.isActive
                                    ? const Color(0xFFE53935)
                                    : Colors.grey.shade300,
                                foregroundColor:
                                    auc.isActive ? Colors.white : Colors.grey.shade600,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                                elevation: 0,
                              ),
                              child: Text(auc.isActive ? 'ĐẤU GIÁ' : 'ĐÃ KẾT THÚC'),
                            ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

  void _showBidSuccessDialog() {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
        ),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: const BoxDecoration(
                  color: Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981),
                  size: 50,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Đặt giá thành công!',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1E293B),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              const Text(
                'Lượt đặt giá của bạn đã được ghi nhận vào hệ thống.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey, height: 1.5),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE53935),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: const Text(
                  'ĐỒNG Ý (OK)',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showBidDialog(Auction auc) {
    final controller = TextEditingController(text: (auc.currentBid + 5.0).toStringAsFixed(2));
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEFF6FF),
                        shape: BoxShape.circle,
                      ),
                    ),
                    Container(
                      width: 62,
                      height: 62,
                      decoration: BoxDecoration(
                        color: const Color(0xFFDBEAFE),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF93C5FD), width: 1.5),
                      ),
                      child: const Icon(
                        Icons.gavel_rounded,
                        color: Color(0xFF2563EB),
                        size: 30,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  auc.cardName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1E293B),
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Giá hiện tại:',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                      ),
                      Text(
                        '\$${auc.currentBid.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFFE53935)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Nhập số tiền đấu giá:',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF475569)),
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: controller,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: InputDecoration(
                    prefixText: '\$ ',
                    prefixStyle: const TextStyle(
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF2563EB),
                      fontSize: 16,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF2563EB), width: 2),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                  ),
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF64748B),
                          side: BorderSide(color: Colors.grey.shade300),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text(
                          'HỦY BỎ',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
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
                              _showBidSuccessDialog();
                            }
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
                              );
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE53935),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                        child: const Text(
                          'ĐẶT GIÁ',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final market = Provider.of<MarketProvider>(context);
    final auth = Provider.of<AuthProvider>(context);
    final isAdmin = auth.user?.role == 'ADMIN';

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
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.pushNamed(context, '/create-auction');
              },
              backgroundColor: const Color(0xFFE53935),
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text(
                'TẠO ĐẤU GIÁ',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            )
          : null,
    );
  }
}
