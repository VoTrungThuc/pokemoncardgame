import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/market_provider.dart';
import '../models/trade.dart';

class TradeDashboardScreen extends StatefulWidget {
  const TradeDashboardScreen({super.key});

  @override
  State<TradeDashboardScreen> createState() => _TradeDashboardScreenState();
}

class _TradeDashboardScreenState extends State<TradeDashboardScreen> {
  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.user != null) {
      Provider.of<MarketProvider>(context, listen: false).fetchUserTrades(auth.user!.id);
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return Colors.green;
      case 'REJECTED':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  Widget _buildTradeCard(Trade trade, int currentUserId) {
    final isIncoming = trade.toUser.id == currentUserId;
    final otherTrainer = isIncoming ? trade.fromUser.username : trade.toUser.username;

    return Card(
      color: Colors.white,
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isIncoming ? 'Yêu cầu từ @$otherTrainer' : 'Gửi đến @$otherTrainer',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(trade.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    trade.status,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: _getStatusColor(trade.status),
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      const Text('BẠN ĐỀ XUẤT', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey)),
                      const SizedBox(height: 4),
                      Text(trade.offeredCard.name, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      Text('Score: ${trade.offeredCard.score}', style: const TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
                const Icon(Icons.swap_horiz, color: Color(0xFFE53935)),
                Expanded(
                  child: Column(
                    children: [
                      const Text('YÊU CẦU ĐỔI', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey)),
                      const SizedBox(height: 4),
                      Text(trade.requestedCard.name, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      Text('Score: ${trade.requestedCard.score}', style: const TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
              ],
            ),
            
            // Accept/Reject buttons for incoming pending trades
            if (isIncoming && trade.status.toUpperCase() == 'PENDING') ...[
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton(
                    onPressed: () => Provider.of<MarketProvider>(context, listen: false).rejectTrade(trade.id),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Từ chối'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: () => Provider.of<MarketProvider>(context, listen: false).acceptTrade(trade.id),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Đồng ý'),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final market = Provider.of<MarketProvider>(context);
    final currentUserId = auth.user?.id ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('GIAO DỊCH THẺ BÀI (TRADE)'),
      ),
      body: market.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
          : RefreshIndicator(
              onRefresh: () => market.fetchUserTrades(currentUserId),
              color: const Color(0xFFE53935),
              child: market.trades.isEmpty
                  ? Center(
                      child: ListView(
                        shrinkWrap: true,
                        children: const [
                          Center(child: Icon(Icons.swap_horizontal_circle_outlined, size: 64, color: Color(0xFF94A3B8))),
                          SizedBox(height: 12),
                          Center(
                            child: Text(
                              'Không có giao dịch nào được lưu!',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: market.trades.length,
                      padding: const EdgeInsets.all(16),
                      itemBuilder: (context, index) => _buildTradeCard(market.trades[index], currentUserId),
                    ),
            ),
    );
  }
}
