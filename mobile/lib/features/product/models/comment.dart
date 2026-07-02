class Comment {
  final int id;
  final int productId;
  final int userId;
  final String username;
  final String? avatarUrl;
  final String content;
  final DateTime createdAt;
  final int? parentId;

  Comment({
    required this.id,
    required this.productId,
    required this.userId,
    required this.username,
    this.avatarUrl,
    required this.content,
    required this.createdAt,
    this.parentId,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      productId: json['productId'] is int ? json['productId'] : int.parse(json['productId'].toString()),
      userId: json['userId'] is int ? json['userId'] : int.parse(json['userId'].toString()),
      username: json['username'] ?? '',
      avatarUrl: json['avatarUrl'] ?? json['avatar_url'],
      content: json['content'] ?? '',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'].toString()) 
          : DateTime.now(),
      parentId: json['parentId'] is int ? json['parentId'] : (json['parentId'] != null ? int.tryParse(json['parentId'].toString()) : null),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'userId': userId,
      'username': username,
      'avatarUrl': avatarUrl,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'parentId': parentId,
    };
  }
}
