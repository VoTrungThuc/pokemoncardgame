import 'package:flutter/material.dart';
import 'package:mobile/features/order/models/order.dart';
import 'package:mobile/core/services/api_service.dart';

class SalesStatsScreen extends StatefulWidget {
  const SalesStatsScreen({super.key});

  @override
  State<SalesStatsScreen> createState() => _SalesStatsScreenState();
}

class _SalesStatsScreenState extends State<SalesStatsScreen> {
  List<Order> _adminOrders = [];
  bool _isLoading = true;
  double _revenueCompleted = 0.0;
  double _revenuePending = 0.0;
  int _totalOrdersCount = 0;
  int _itemsSold = 0;
  Map<String, int> _statusCounts = {
    'PENDING': 0,
    'PROCESSING': 0,
    'SHIPPED': 0,
    'COMPLETED': 0,
    'CANCELLED': 0,
  };

  @override
  void initState() {
    super.initState();
    _fetchAdminStats();
  }

  Future<void> _fetchAdminStats() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.getOrders();
      double revCompleted = 0.0;
      double revPending = 0.0;
      int itemsCount = 0;
      Map<String, int> counts = {
        'PENDING': 0,
        'PROCESSING': 0,
        'SHIPPED': 0,
        'COMPLETED': 0,
        'CANCELLED': 0,
      };

      for (var order in list) {
        final status = order.status.toUpperCase();
        counts[status] = (counts[status] ?? 0) + 1;
        if (status == 'COMPLETED') {
          revCompleted += order.totalAmount;
          for (var item in order.orderItems) {
            itemsCount += item.quantity;
          }
        } else if (status != 'CANCELLED') {
          revPending += order.totalAmount;
        }
      }

      if (mounted) {
        setState(() {
          _adminOrders = list;
          _adminOrders.sort((a, b) => b.id.compareTo(a.id)); // Newest first
          _revenueCompleted = revCompleted;
          _revenuePending = revPending;
          _totalOrdersCount = list.length;
          _itemsSold = itemsCount;
          _statusCounts = counts;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching admin statistics: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildAdminStatsCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: Colors.grey.shade100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const Spacer(),
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String label, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '$count',
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentOrdersList() {
    if (_adminOrders.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 32),
        alignment: Alignment.center,
        child: const Column(
          children: [
            Icon(Icons.shopping_bag_outlined, size: 48, color: Color(0xFF94A3B8)),
            SizedBox(height: 8),
            Text(
              'Không có đơn hàng nào',
              style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ],
        ),
      );
    }

    return Column(
      children: _adminOrders.map((order) {
        Color statusColor;
        switch (order.status.toUpperCase()) {
          case 'COMPLETED':
            statusColor = Colors.green;
            break;
          case 'PENDING':
            statusColor = Colors.orange;
            break;
          case 'PROCESSING':
            statusColor = Colors.blue;
            break;
          case 'SHIPPED':
            statusColor = Colors.purple;
            break;
          case 'CANCELLED':
            statusColor = Colors.red;
            break;
          default:
            statusColor = Colors.grey;
        }

        final isGacha = order.paymentMethod != null && order.paymentMethod!.toUpperCase() == 'GACHA';
        final isAuction = order.paymentMethod != null && order.paymentMethod!.toUpperCase() == 'AUCTION';

        return Card(
          color: Colors.white,
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: BorderSide(color: Colors.grey.shade100),
          ),
          child: ExpansionTile(
            shape: const Border(),
            backgroundColor: Colors.transparent,
            collapsedBackgroundColor: Colors.transparent,
            tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      'Đơn hàng #${order.id}',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF1E293B)),
                    ),
                    if (isGacha) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFFCA5A5)),
                        ),
                        child: const Text(
                          '🎟️ GACHA',
                          style: TextStyle(
                            color: Color(0xFFEF4444),
                            fontSize: 7.5,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                    if (isAuction) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF5F3FF),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFC7D2FE)),
                        ),
                        child: const Text(
                          '🔨 ĐẤU GIÁ',
                          style: TextStyle(
                            color: Color(0xFF6366F1),
                            fontSize: 7.5,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  isGacha ? '\$0.00 (Miễn phí)' : '\$${order.totalAmount.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFFE53935)),
                ),
              ],
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Row(
                children: [
                  const Icon(Icons.person_outline, size: 12, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      order.recipientName ?? 'N/A',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      order.status,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Divider(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.phone_outlined, size: 14, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Text(
                          'SĐT: ${order.phone ?? 'N/A'}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Địa chỉ: ${order.shippingAddress ?? 'N/A'}',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 14, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Text(
                          'Thời gian: ${order.createdAt.contains('T') ? order.createdAt.replaceFirst('T', ' ').substring(0, 16) : order.createdAt}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                        ),
                      ],
                    ),
                    if (order.note != null && order.note!.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.note_alt_outlined, size: 14, color: Color(0xFF64748B)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Ghi chú: ${order.note}',
                              style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Color(0xFF475569)),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const Divider(height: 20),
                    const Text(
                      'Sản phẩm đã mua:',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                    ),
                    const SizedBox(height: 6),
                    ...order.orderItems.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 4.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '• ${item.product.name} x${item.quantity}',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                            ),
                          ),
                          Text(
                            isGacha ? '\$0.00 (Đổi Gacha)' : '\$${item.price.toStringAsFixed(2)}',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                          ),
                        ],
                      ),
                    )),
                    const Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Cập nhật trạng thái:',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                        ),
                        Container(
                          height: 32,
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: order.status.toUpperCase(),
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                              items: ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((st) {
                                return DropdownMenuItem<String>(
                                  value: st,
                                  child: Text(st),
                                );
                              }).toList(),
                              onChanged: (newStatus) async {
                                if (newStatus == null || newStatus == order.status.toUpperCase()) return;
                                
                                setState(() {
                                  _isLoading = true;
                                });
                                
                                try {
                                  await ApiService.updateOrderStatus(order.id, newStatus);
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('🎉 Đã cập nhật đơn hàng #${order.id} sang $newStatus!'),
                                        backgroundColor: Colors.green,
                                      ),
                                    );
                                  }
                                  await _fetchAdminStats();
                                } catch (e) {
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Lỗi: $e'),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                  setState(() {
                                    _isLoading = false;
                                  });
                                }
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              )
            ],
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('THỐNG KÊ DOANH SỐ & MUA HÀNG'),
        actions: [
          IconButton(
            onPressed: _fetchAdminStats,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFE53935),
              ),
            )
          : RefreshIndicator(
              onRefresh: _fetchAdminStats,
              color: const Color(0xFFE53935),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.analytics_outlined, color: Color(0xFFE53935), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'DOANH THU & TIỀN VỀ',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1E293B),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.25,
                      children: [
                        _buildAdminStatsCard(
                          title: 'Tiền Về (Thực Nhận)',
                          value: '\$${_revenueCompleted.toStringAsFixed(2)}',
                          icon: Icons.monetization_on,
                          color: const Color(0xFF10B981),
                          bgColor: const Color(0xFFECFDF5),
                        ),
                        _buildAdminStatsCard(
                          title: 'Doanh Thu Chờ Duyệt',
                          value: '\$${_revenuePending.toStringAsFixed(2)}',
                          icon: Icons.pending_actions_rounded,
                          color: const Color(0xFFF59E0B),
                          bgColor: const Color(0xFFFFFBEB),
                        ),
                        _buildAdminStatsCard(
                          title: 'Tổng Số Đơn Hàng',
                          value: '$_totalOrdersCount',
                          icon: Icons.shopping_bag_rounded,
                          color: const Color(0xFF3B82F6),
                          bgColor: const Color(0xFFEFF6FF),
                        ),
                        _buildAdminStatsCard(
                          title: 'Thẻ Bài Đã Bán',
                          value: '$_itemsSold',
                          icon: Icons.style_rounded,
                          color: const Color(0xFF8B5CF6),
                          bgColor: const Color(0xFFF5F3FF),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),
                    const Row(
                      children: [
                        Icon(Icons.pie_chart_outline, color: Color(0xFFE53935), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'THỐNG KÊ TRẠNG THÁI MUA HÀNG',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1E293B),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _buildStatusChip('Chờ duyệt', _statusCounts['PENDING'] ?? 0, Colors.orange),
                        _buildStatusChip('Đang đóng gói', _statusCounts['PROCESSING'] ?? 0, Colors.blue),
                        _buildStatusChip('Đang giao', _statusCounts['SHIPPED'] ?? 0, Colors.purple),
                        _buildStatusChip('Hoàn thành', _statusCounts['COMPLETED'] ?? 0, Colors.green),
                        _buildStatusChip('Đã hủy', _statusCounts['CANCELLED'] ?? 0, Colors.red),
                      ],
                    ),
                    const SizedBox(height: 28),
                    const Row(
                      children: [
                        Icon(Icons.list_alt_rounded, color: Color(0xFFE53935), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'DANH SÁCH ĐƠN HÀNG CHI TIẾT',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1E293B),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildRecentOrdersList(),
                  ],
                ),
              ),
            ),
    );
  }
}
