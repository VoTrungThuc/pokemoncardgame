class ChatMessage {
  final int id;
  final int userId;
  final String sender;
  final String message;
  final bool isAutoReply;
  final String createdAt;

  ChatMessage({
    required this.id,
    required this.userId,
    required this.sender,
    required this.message,
    required this.isAutoReply,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      userId: json['userId'] is int 
          ? json['userId'] 
          : (json['user_id'] != null ? int.parse(json['user_id'].toString()) : 0),
      sender: json['sender'] ?? 'CUSTOMER',
      message: json['message'] ?? '',
      isAutoReply: json['isAutoReply'] ?? json['is_auto_reply'] ?? false,
      createdAt: json['createdAt'] ?? json['created_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'sender': sender,
      'message': message,
      'isAutoReply': isAutoReply,
      'createdAt': createdAt,
    };
  }
}

