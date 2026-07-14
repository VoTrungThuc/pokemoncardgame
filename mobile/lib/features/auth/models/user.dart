class User {
  final int id;
  final String username;
  final String? name;
  final String email;
  final String role;
  final String? phone;
  final String? shippingAddress;
  final double balance;
  final String? avatarUrl;

  User({
    required this.id,
    required this.username,
    this.name,
    required this.email,
    required this.role,
    this.phone,
    this.shippingAddress,
    required this.balance,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      username: json['username'] ?? '',
      name: json['name'],
      email: json['email'] ?? '',
      role: json['role'] ?? 'USER',
      phone: json['phone'],
      shippingAddress: json['shippingAddress'] ?? json['shipping_address'],
      balance: json['balance'] is num ? (json['balance'] as num).toDouble() : 0.0,
      avatarUrl: json['avatarUrl'] ?? json['avatar_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'name': name,
      'email': email,
      'role': role,
      'phone': phone,
      'shippingAddress': shippingAddress,
      'balance': balance,
      'avatarUrl': avatarUrl,
    };
  }
}
