import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/core/services/api_service.dart';

class WithdrawHistoryScreen extends StatefulWidget {
  const WithdrawHistoryScreen({super.key});

  @override
  State<WithdrawHistoryScreen> createState() => _WithdrawHistoryScreenState();
}

class _WithdrawHistoryScreenState extends State<WithdrawHistoryScreen> {
  List<dynamic> _requests = [];
  bool _isLoading = true;
  Map<String, dynamic>? _storeBank;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      _requests = await ApiService.getMyWithdrawRequests();
      _storeBank = await ApiService.getStoreBankInfo();
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING': return const Color(0xFFF59E0B);
      case 'APPROVED': return const Color(0xFF3B82F6);
      case 'COMPLETED': return const Color(0xFF16A34A);
      case 'REJECTED': return const Color(0xFFEF4444);
      default: return const Color(0xFF94A3B8);
    }
  }

  String _statusText(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'CHỜ DUYỆT';
      case 'APPROVED': return 'ĐÃ DUYỆT';
      case 'COMPLETED': return 'HOÀN TẤT';
      case 'REJECTED': return 'TỪ CHỐI';
      default: return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('LỊCH SỬ RÚT TIỀN')),
      body: RefreshIndicator(
        onRefresh: _load,
        color: const Color(0xFFE53935),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
            : _requests.isEmpty
                ? ListView(
                    children: const [
                      SizedBox(height: 120),
                      Center(child: Icon(Icons.history, size: 64, color: Color(0xFF94A3B8))),
                      SizedBox(height: 12),
                      Center(child: Text('Chưa có yêu cầu rút tiền nào',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B)))),
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _requests.length,
                    itemBuilder: (context, i) {
                      final r = _requests[i];
                      final status = r['status']?.toString().toUpperCase() ?? '';
                      final isApproved = status == 'APPROVED';

                      return Card(
                        color: Colors.white,
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 12),
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
                                  Text('Rút \$${r['amount']?.toStringAsFixed(2) ?? '0.00'}',
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _statusColor(status).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(_statusText(status),
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: _statusColor(status))),
                                  ),
                                ],
                              ),
                              const Divider(height: 16),
                              _infoRow('Ngân hàng', r['bankName'] ?? ''),
                              _infoRow('Số tài khoản', r['bankAccountNumber'] ?? ''),
                              _infoRow('Chủ tài khoản', r['accountHolder'] ?? ''),
                              if (r['adminNote'] != null && r['adminNote'].toString().isNotEmpty)
                                _infoRow('Ghi chú', r['adminNote']),

                              if (isApproved && _storeBank != null) ...[
                                const SizedBox(height: 12),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFBFDBFE)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('THÔNG TIN CHUYỂN KHOẢN',
                                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF3B82F6))),
                                      const SizedBox(height: 8),
                                      if (_storeBank!['bankName'] != null)
                                        Text('Ngân hàng: ${_storeBank!['bankName']}',
                                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                      if (_storeBank!['bankAccountNumber'] != null)
                                        Text('Số tài khoản: ${_storeBank!['bankAccountNumber']}',
                                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                      if (_storeBank!['accountHolder'] != null)
                                        Text('Chủ tài khoản: ${_storeBank!['accountHolder']}',
                                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 6),
                                      const Text('Admin đã duyệt yêu cầu của bạn. Vui lòng chờ chuyển khoản từ cửa hàng.',
                                          style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text('$label: ', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}
