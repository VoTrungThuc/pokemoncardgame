import 'package:flutter/material.dart';
import '../services/api_service.dart';

class NotificationListScreen extends StatefulWidget {
  const NotificationListScreen({super.key});

  @override
  State<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    try {
      final list = await ApiService.getNotifications();
      setState(() {
        _notifications = list;
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching notifications: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _markAsRead(int id) async {
    try {
      await ApiService.markNotificationRead(id);
      _fetchNotifications();
    } catch (e) {
      print('Error marking notification read: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('THÔNG BÁO HỆ THỐNG'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
          : RefreshIndicator(
              onRefresh: _fetchNotifications,
              color: const Color(0xFFE53935),
              child: _notifications.isEmpty
                  ? Center(
                      child: ListView(
                        shrinkWrap: true,
                        children: const [
                          Center(child: Icon(Icons.notifications_none, size: 64, color: Color(0xFF94A3B8))),
                          SizedBox(height: 12),
                          Center(
                            child: Text(
                              'Không có thông báo nào!',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: _notifications.length,
                      padding: const EdgeInsets.all(16),
                      itemBuilder: (context, index) {
                        final notif = _notifications[index];
                        final id = notif['id'] as int;
                        final isRead = notif['read'] ?? notif['isRead'] ?? false;

                        return Card(
                          color: isRead ? Colors.white : const Color(0xFFFFF5F5),
                          elevation: 0,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: isRead ? Colors.grey.shade100 : const Color(0xFFFCA5A5).withOpacity(0.3)),
                          ),
                          child: ListTile(
                            leading: Icon(
                              isRead ? Icons.notifications_outlined : Icons.notifications_active,
                              color: isRead ? Colors.grey : const Color(0xFFE53935),
                            ),
                            title: Text(
                              notif['message'] ?? 'Notification alert',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                                color: const Color(0xFF1E293B),
                              ),
                            ),
                            trailing: !isRead
                                ? TextButton(
                                    onPressed: () => _markAsRead(id),
                                    child: const Text('Đánh dấu đã đọc', style: TextStyle(fontSize: 10, color: Color(0xFFE53935))),
                                  )
                                : null,
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
