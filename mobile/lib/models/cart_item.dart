import 'product.dart';

class CartItem {
  final int id;
  final Product product;
  final int quantity;

  CartItem({
    required this.id,
    required this.product,
    required this.quantity,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      product: Product.fromJson(json['product']),
      quantity: json['quantity'] is int ? json['quantity'] : int.parse(json['quantity'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product': product.toJson(),
      'quantity': quantity,
    };
  }

  double get subtotal => product.activePrice * quantity;
}
