import 'product.dart';

class OrderItem {
  final int id;
  final Product product;
  final int quantity;
  final double price;

  OrderItem({
    required this.id,
    required this.product,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      product: Product.fromJson(json['product']),
      quantity: json['quantity'] is int ? json['quantity'] : int.parse(json['quantity'].toString()),
      price: json['price'] != null ? double.parse(json['price'].toString()) : 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product': product.toJson(),
      'quantity': quantity,
      'price': price,
    };
  }
}

class Order {
  final int id;
  final double totalAmount;
  final String status;
  final String? shippingAddress;
  final String createdAt;
  final List<OrderItem> orderItems;

  Order({
    required this.id,
    required this.totalAmount,
    required this.status,
    this.shippingAddress,
    required this.createdAt,
    required this.orderItems,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    var itemsList = json['orderItems'] as List? ?? json['items'] as List? ?? [];
    List<OrderItem> items = itemsList.map((i) => OrderItem.fromJson(i)).toList();

    return Order(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      totalAmount: json['totalAmount'] != null 
          ? double.parse(json['totalAmount'].toString()) 
          : (json['amount'] != null ? double.parse(json['amount'].toString()) : 0.0),
      status: json['status'] ?? 'PENDING',
      shippingAddress: json['shippingAddress'] ?? json['shipping_address'],
      createdAt: json['createdAt'] ?? json['created_at'] ?? '',
      orderItems: items,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'totalAmount': totalAmount,
      'status': status,
      'shippingAddress': shippingAddress,
      'createdAt': createdAt,
      'orderItems': orderItems.map((i) => i.toJson()).toList(),
    };
  }
}
