import 'user.dart';
import 'product.dart';

class Trade {
  final int id;
  final User fromUser;
  final User toUser;
  final Product offeredCard;
  final Product requestedCard;
  final String status; // PENDING, ACCEPTED, REJECTED
  final String createdAt;

  Trade({
    required this.id,
    required this.fromUser,
    required this.toUser,
    required this.offeredCard,
    required this.requestedCard,
    required this.status,
    required this.createdAt,
  });

  factory Trade.fromJson(Map<String, dynamic> json) {
    return Trade(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      fromUser: User.fromJson(json['fromUser'] ?? json['from_user']),
      toUser: User.fromJson(json['toUser'] ?? json['to_user']),
      offeredCard: Product.fromJson(json['offeredCard'] ?? json['offered_card']),
      requestedCard: Product.fromJson(json['requestedCard'] ?? json['requested_card']),
      status: json['status'] ?? 'PENDING',
      createdAt: json['createdAt'] ?? json['created_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fromUser': fromUser.toJson(),
      'toUser': toUser.toJson(),
      'offeredCard': offeredCard.toJson(),
      'requestedCard': requestedCard.toJson(),
      'status': status,
      'createdAt': createdAt,
    };
  }
}
