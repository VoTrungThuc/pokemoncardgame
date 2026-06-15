import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/features/order/models/order.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).refreshProfile();
      }
    });
  }

  void _showDepositBottomSheet(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) => _DepositSheetContent(auth: auth),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final username = user?.username ?? 'Trainer';
    final email = user?.email ?? '';
    final isAdmin = user?.role == 'ADMIN';

    return Scaffold(
      appBar: AppBar(
        title: const Text('HỒ SƠ TRAINER'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // User stats summary card
            Card(
              color: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: BorderSide(color: Colors.grey.shade100),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: const Color(0xFFFFF5F5),
                          child: isAdmin
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(30),
                                  child: Image.asset(
                                    'assets/admin_logo.png',
                                    width: 60,
                                    height: 60,
                                    fit: BoxFit.cover,
                                  ),
                                )
                              : Text(
                                  username.substring(0, 2).toUpperCase(),
                                  style: const TextStyle(
                                    color: Color(0xFFE53935),
                                    fontWeight: FontWeight.w900,
                                    fontSize: 20,
                                  ),
                                ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                username,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                email,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF64748B),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (!isAdmin) ...[
                      const Divider(height: 24, thickness: 1, color: Color(0xFFF1F5F9)),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'SỐ DƯ TRAINER',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Color(0xFF94A3B8),
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '\$${(user?.balance ?? 0.0).toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFFE53935),
                                ),
                              ),
                            ],
                          ),
                          ElevatedButton.icon(
                            onPressed: () => _showDepositBottomSheet(context, auth),
                            icon: const Icon(Icons.add_circle_outline, size: 16, color: Colors.white),
                            label: const Text(
                              'NẠP TIỀN',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE53935),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                              minimumSize: Size.zero,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Profile Nav Options List
            if (isAdmin)
              _buildProfileOption(
                context,
                icon: Icons.analytics_outlined,
                color: const Color(0xFFE53935),
                title: 'Thống Kê Doanh Số & Mua Hàng',
                route: '/sales-stats',
              ),
            _buildProfileOption(
              context,
              icon: Icons.auto_awesome,
              color: const Color(0xFFF59E0B),
              title: isAdmin ? 'Lịch Sử Mở Gacha Hệ Thống' : 'Mở Gói Bài Pokémon (Gacha)',
              route: '/pack-simulator',
            ),
            if (!isAdmin)
              _buildProfileOption(
                context,
                icon: Icons.folder_special,
                color: const Color(0xFF10B981),
                title: 'Bộ Sưu Tập Của Tôi',
                route: '/my-collection',
              ),
            _buildProfileOption(
              context,
              icon: Icons.gavel,
              color: const Color(0xFF3B82F6),
              title: 'Đấu Giá Thẻ Bài Live',
              route: '/auctions',
            ),
            if (!isAdmin)
              _buildProfileOption(
                context,
                icon: Icons.swap_horizontal_circle,
                color: const Color(0xFFEC4899),
                title: 'Sàn Trao Đổi Thẻ',
                route: '/trades',
              ),
            _buildProfileOption(
              context,
              icon: Icons.map,
              color: const Color(0xFF8B5CF6),
              title: 'Hệ Thống Cửa Hàng Địa Lý',
              route: '/locations',
            ),
            _buildProfileOption(
              context,
              icon: Icons.notifications,
              color: const Color(0xFF6366F1),
              title: 'Thông Báo Hệ Thống',
              route: '/notifications',
            ),

            const SizedBox(height: 32),

            // Logout Button
            ElevatedButton.icon(
              onPressed: () {
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
                                  color: Color(0xFFFFF5F5),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              Container(
                                width: 62,
                                height: 62,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEE2E2),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: const Color(0xFFFCA5A5), width: 1.5),
                                ),
                                child: const Icon(
                                  Icons.logout_rounded,
                                  color: Color(0xFFEF4444),
                                  size: 30,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            'Đăng xuất tài khoản',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF1E293B),
                              letterSpacing: 0.2,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Bạn có chắc chắn muốn thoát tài khoản Trainer hiện tại không?',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF64748B),
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
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
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    auth.logout();
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFE53935),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    elevation: 0,
                                  ),
                                  child: const Text(
                                    'ĐĂNG XUẤT',
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
                );
              },
              icon: const Icon(Icons.logout, color: Colors.white, size: 16),
              label: const Text(
                'ĐĂNG XUẤT TÀI KHOẢN',
                style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.8),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE53935),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                minimumSize: const Size(double.infinity, 52),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileOption(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String route,
  }) {
    return Card(
      color: Colors.white,
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade100),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color, size: 18),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
        ),
        trailing: const Icon(Icons.chevron_right, size: 18, color: Color(0xFF94A3B8)),
        onTap: () => Navigator.pushNamed(context, route),
      ),
    );
  }
}

class _DepositSheetContent extends StatefulWidget {
  final AuthProvider auth;
  const _DepositSheetContent({required this.auth});

  @override
  State<_DepositSheetContent> createState() => _DepositSheetContentState();
}

class _DepositSheetContentState extends State<_DepositSheetContent> {
  final _amountController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  double? _selectedPredefinedAmount;
  bool _isSubmitting = false;
  String _selectedMethod = 'VNPAY'; // 'ADMIN' or 'VNPAY'
  bool _dialogActive = false;

  final List<double> _predefinedAmounts = [10.0, 50.0, 100.0, 500.0];

  @override
  void initState() {
    super.initState();
    final username = widget.auth.user?.username;
    if (username == 'user') {
      _selectedMethod = 'ADMIN';
    } else {
      _selectedMethod = 'VNPAY';
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _dialogActive = false;
    super.dispose();
  }

  void _startPolling(String txnRef, BuildContext dialogCtx) async {
    _dialogActive = true;
    int attempts = 0;
    while (_dialogActive && attempts < 100) {
      await Future.delayed(const Duration(seconds: 3));
      if (!_dialogActive) break;
      attempts++;
      try {
        final status = await ApiService.getTopUpStatus(txnRef);
        if (status == 'SUCCESS') {
          _dialogActive = false;
          if (dialogCtx.mounted) {
            Navigator.pop(dialogCtx); // Close VNPay dialog
          }
          await widget.auth.refreshProfile();
          if (mounted) {
            _showSuccessDialog(double.parse(_amountController.text.trim()));
          }
          break;
        } else if (status == 'FAILED') {
          _dialogActive = false;
          if (dialogCtx.mounted) {
            Navigator.pop(dialogCtx); // Close VNPay dialog
          }
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Giao dịch nạp tiền thất bại hoặc bị hủy!'),
                backgroundColor: Colors.red,
              ),
            );
          }
          break;
        }
      } catch (e) {
        print('Error polling top-up status: $e');
      }
    }
  }

  void _showSuccessDialog(double amount) {
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
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF10B981).withOpacity(0.1),
                          blurRadius: 20,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      color: const Color(0xFFD1FAE5),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF6EE7B7), width: 2),
                    ),
                    child: const Icon(
                      Icons.check_circle_rounded,
                      color: Color(0xFF10B981),
                      size: 40,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Nạp tiền thành công!',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1E293B),
                  letterSpacing: 0.2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  'Đã nạp thành công \$${amount.toStringAsFixed(2)} vào tài khoản Trainer của bạn.',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF475569),
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 28),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE53935),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'XÁC NHẬN (OK)',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showVNPayTopUpDialog(String txnRef, String paymentUrl, double amount) {
    bool pollingStarted = false;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        if (!pollingStarted) {
          pollingStarted = true;
          _startPolling(txnRef, ctx);
        }
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return Dialog(
              backgroundColor: Colors.white,
              surfaceTintColor: Colors.transparent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 26),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              '🇻🇳',
                              style: TextStyle(fontSize: 20),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'NẠP TIỀN VNPAY',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0F172A),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Số tiền nạp: \$${amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFE53935),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Quét mã QR dưới đây bằng App Ngân hàng hoặc Ví VNPay để thực hiện giao dịch thanh toán.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600, height: 1.4),
                      ),
                      const SizedBox(height: 20),
                      
                      Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(14),
                        child: Image.network(
                          'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${Uri.encodeComponent(paymentUrl)}',
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(Icons.qr_code_2_rounded, size: 64, color: Colors.grey),
                          ),
                        ),
                      ),
                      const SizedBox(height: 22),
                      
                      ElevatedButton.icon(
                        onPressed: () async {
                          final uri = Uri.parse(paymentUrl);
                          try {
                            await launchUrl(uri, mode: LaunchMode.externalApplication);
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Không thể mở cổng thanh toán VNPay')),
                            );
                          }
                        },
                        icon: const Icon(Icons.open_in_browser_rounded, color: Colors.white, size: 18),
                        label: const Text('MỞ CỔNG THANH TOÁN VNPAY', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 0.2)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE53935),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                      ),
                      const SizedBox(height: 10),
                      
                      OutlinedButton.icon(
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: paymentUrl));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Đã sao chép liên kết thanh toán VNPay!'),
                              backgroundColor: Color(0xFF16A34A),
                            ),
                          );
                        },
                        icon: const Icon(Icons.copy_rounded, color: Color(0xFFE53935), size: 18),
                        label: const Text('SAO CHÉP ĐƯỜNG DẪN', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 0.2)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFFE53935),
                          side: const BorderSide(color: Color(0xFFE53935), width: 1.5),
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Divider(),
                      const SizedBox(height: 12),
                      
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(color: Color(0xFFE53935), strokeWidth: 2),
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'Đang chờ bạn thanh toán...',
                            style: TextStyle(fontSize: 12, color: Color(0xFF475569), fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      TextButton(
                        onPressed: () {
                          _dialogActive = false;
                          Navigator.pop(ctx); // Close dialog
                          widget.auth.refreshProfile(); // Refresh balance in case they did pay
                        },
                        child: const Text(
                          'ĐÓNG / HỦY BỎ',
                          style: TextStyle(
                            color: Color(0xFF64748B),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _handleDeposit() async {
    final amountText = _amountController.text.trim();
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập số tiền nạp hợp lệ!'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      if (_selectedMethod == 'ADMIN') {
        await widget.auth.deposit(amount);
        if (mounted) {
          Navigator.pop(context); // Close sheet
          _showSuccessDialog(amount);
        }
      } else {
        // VNPay Flow
        final response = await ApiService.createTopUpUrl(amount);
        final paymentUrl = response['paymentUrl'] ?? '';
        final txnRef = response['txnRef'] ?? '';
        
        if (mounted) {
          Navigator.pop(context); // Close sheet
          _showVNPayTopUpDialog(txnRef, paymentUrl, amount);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi nạp tiền: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Nạp Tiền Vào Tài Khoản',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1E293B),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Chọn nhanh số tiền nạp:',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: _predefinedAmounts.map((amount) {
                final isSelected = _selectedPredefinedAmount == amount;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: OutlinedButton(
                      onPressed: () {
                        setState(() {
                          _selectedPredefinedAmount = amount;
                          _amountController.text = amount.toStringAsFixed(0);
                        });
                      },
                      style: OutlinedButton.styleFrom(
                        backgroundColor: isSelected ? const Color(0xFFFFF5F5) : Colors.white,
                        side: BorderSide(
                          color: isSelected ? const Color(0xFFE53935) : Colors.grey.shade200,
                          width: 2,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text(
                        '\$${amount.toStringAsFixed(0)}',
                        style: TextStyle(
                          color: isSelected ? const Color(0xFFE53935) : const Color(0xFF475569),
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            const Text(
              'Nhập số tiền tùy chỉnh:',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 8),
            Form(
              key: _formKey,
              child: TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  prefixText: '\$ ',
                  prefixStyle: const TextStyle(
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFE53935),
                    fontSize: 16,
                  ),
                  hintText: '0.00',
                  hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFFE53935), width: 2),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),
                ),
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                  color: Color(0xFF1E293B),
                ),
                onChanged: (val) {
                  final parsedVal = double.tryParse(val);
                  if (parsedVal != _selectedPredefinedAmount) {
                    setState(() {
                      _selectedPredefinedAmount = null;
                    });
                  }
                },
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _handleDeposit,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE53935),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                minimumSize: const Size(double.infinity, 52),
                elevation: 0,
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text(
                      'XÁC NHẬN NẠP TIỀN',
                      style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.8),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

