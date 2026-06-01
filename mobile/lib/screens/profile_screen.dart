import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final username = user?.username ?? 'Trainer';
    final email = user?.email ?? '';

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
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: const Color(0xFFFFF5F5),
                      child: Text(
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
              ),
            ),
            const SizedBox(height: 24),

            // Profile Nav Options List
            _buildProfileOption(
              context,
              icon: Icons.auto_awesome,
              color: const Color(0xFFF59E0B),
              title: 'Mở Gói Bài Pokémon (Gacha)',
              route: '/pack-simulator',
            ),
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
                  builder: (ctx) => AlertDialog(
                    title: const Text('Đăng xuất'),
                    content: const Text('Bạn có chắc chắn muốn thoát tài khoản Trainer?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          auth.logout();
                        },
                        child: const Text('Đăng xuất', style: TextStyle(color: Color(0xFFE53935))),
                      ),
                    ],
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
