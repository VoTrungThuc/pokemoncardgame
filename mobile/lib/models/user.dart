class User {
  final int id;
  final String username;
  final String email;
  final String role;
  final String? phone;
  final String? shippingAddress;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.phone,
    this.shippingAddress,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'USER',
      phone: json['phone'],
      shippingAddress: json['shippingAddress'] ?? json['shipping_address'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'phone': phone,
      'shippingAddress': shippingAddress,
    };
  }
}
