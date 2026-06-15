import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/chat/models/chat_message.dart';
import 'package:mobile/features/auth/models/user.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/features/chat/screens/admin_chat_detail_screen.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = true;
  Timer? _pollingTimer;
  final _scrollController = ScrollController();

  // Admin state fields
  List<User> _chatUsers = [];
  bool _isUsersLoading = true;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final isAdmin = auth.user?.role == 'ADMIN';

    if (isAdmin) {
      _fetchChatUsers();
      // Poll users list every 4 seconds
      _pollingTimer = Timer.periodic(
        const Duration(seconds: 4),
        (_) => _fetchChatUsers(silent: true),
      );
    } else {
      _fetchChatHistory();
      // Poll chat history every 3 seconds
      _pollingTimer = Timer.periodic(
        const Duration(seconds: 3),
        (_) => _fetchChatHistory(silent: true),
      );
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchChatUsers({bool silent = false}) async {
    try {
      final list = await ApiService.getChatUsers();
      if (mounted) {
        setState(() {
          _chatUsers = list;
          _isUsersLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching chat users: $e');
      if (mounted) setState(() => _isUsersLoading = false);
    }
  }

  Future<void> _fetchChatHistory({bool silent = false}) async {
    try {
      final list = await ApiService.getChatHistory();
      if (mounted) {
        setState(() {
          _messages.clear();
          _messages.addAll(list);
          _isLoading = false;
        });
        if (!silent) {
          _scrollToBottom();
        }
      }
    } catch (e) {
      print('Error fetching chats: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    _messageController.clear();

    try {
      final msg = await ApiService.sendChatMessage(text);
      if (mounted) {
        setState(() {
          _messages.add(msg);
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Widget _buildMessageBubble(ChatMessage msg, bool isAdmin) {
    final isMe = isAdmin ? (msg.sender == 'STORE') : (msg.sender == 'CUSTOMER');
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8, left: 16, right: 16),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFFE53935) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isMe ? const Radius.circular(16) : Radius.zero,
            bottomRight: isMe ? Radius.zero : const Radius.circular(16),
          ),
        ),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        child: Text(
          msg.message,
          style: TextStyle(
            color: isMe ? Colors.white : const Color(0xFF1E293B),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildAdminUserList() {
    return _isUsersLoading
        ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
        : _chatUsers.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.chat_bubble_outline_rounded, size: 48, color: Color(0xFF94A3B8)),
                    SizedBox(height: 12),
                    Text(
                      'Không có cuộc trò chuyện nào cần hỗ trợ!',
                      style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              )
            : ListView.builder(
                itemCount: _chatUsers.length,
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final user = _chatUsers[index];
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
                        backgroundColor: const Color(0xFFFFF5F5),
                        child: Text(
                          user.username.isNotEmpty ? user.username.substring(0, user.username.length >= 2 ? 2 : 1).toUpperCase() : 'US',
                          style: const TextStyle(color: Color(0xFFE53935), fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                      title: Text(
                        '@${user.username}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      subtitle: Text(
                        user.email,
                        style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.grey, size: 16),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AdminChatDetailScreen(
                              userId: user.id,
                              username: user.username,
                            ),
                          ),
                        );
                      },
                    ),
                  );
                },
              );
  }

  Widget _buildCustomerChatView(bool isAdmin) {
    return Column(
      children: [
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
              : _messages.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.chat_bubble_outline_rounded, size: 48, color: Color(0xFF94A3B8)),
                          SizedBox(height: 12),
                          Text(
                            'Nhập tin nhắn để nhận hỗ trợ từ Admin!',
                            style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      itemCount: _messages.length,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      itemBuilder: (context, idx) => _buildMessageBubble(_messages[idx], isAdmin),
                    ),
        ),

        // Message Input bar
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
          ),
          child: SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Nhập tin nhắn hỗ trợ...',
                      hintStyle: TextStyle(color: Color(0xFF94A3B8)),
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 12),
                CircleAvatar(
                  radius: 24,
                  backgroundColor: const Color(0xFFE53935),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 18),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isAdmin = auth.user?.role == 'ADMIN';

    return Scaffold(
      appBar: AppBar(
        title: const Text('TRÒ CHUYỆN HỖ TRỢ'),
      ),
      body: isAdmin ? _buildAdminUserList() : _buildCustomerChatView(isAdmin),
    );
  }
}
