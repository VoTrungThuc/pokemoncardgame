class ChatMessage {
  final int id;
  final int senderId;
  final int receiverId;
  final String message;
  final bool isRead;
  final String timestamp;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.message,
    required this.isRead,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      senderId: json['senderId'] is int 
          ? json['senderId'] 
          : (json['sender_id'] != null ? int.parse(json['sender_id'].toString()) : 0),
      receiverId: json['receiverId'] is int 
          ? json['receiverId'] 
          : (json['receiver_id'] != null ? int.parse(json['receiver_id'].toString()) : 0),
      message: json['message'] ?? '',
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      timestamp: json['timestamp'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'receiverId': receiverId,
      'message': message,
      'isRead': isRead,
      'timestamp': timestamp,
    };
  }
}
