class Product {
  final int id;
  final String name;
  final String brand; // Pokémon name
  final String? imageUrl;
  final double price;
  final double? promoPrice;
  final String? description;
  final String? cpu; // Card Type (e.g. Pokémon, Energy, Trainer)
  final String? camera; // HP (e.g. 120 HP)
  final String? battery; // Card ID/Number
  final String? ram; // Rarity
  final String? rom; // Card Condition (e.g. Near Mint)
  final String? screen; // Expansion Set
  final String? os; // Card Artist
  final int stock;
  final bool isAvailable;
  final double score;

  Product({
    required this.id,
    required this.name,
    required this.brand,
    this.imageUrl,
    required this.price,
    this.promoPrice,
    this.description,
    this.cpu,
    this.camera,
    this.battery,
    this.ram,
    this.rom,
    this.screen,
    this.os,
    required this.stock,
    required this.isAvailable,
    required this.score,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      brand: json['brand'] ?? json['pokemonName'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image_url'],
      price: json['price'] != null ? double.parse(json['price'].toString()) : 0.0,
      promoPrice: json['promoPrice'] != null ? double.parse(json['promoPrice'].toString()) : null,
      description: json['description'],
      cpu: json['cpu'],
      camera: json['camera'],
      battery: json['battery'],
      ram: json['ram'],
      rom: json['rom'],
      screen: json['screen'],
      os: json['os'],
      stock: json['stock'] is int ? json['stock'] : int.parse(json['stock']?.toString() ?? '0'),
      isAvailable: json['isAvailable'] ?? json['available'] ?? true,
      score: json['score'] != null ? double.parse(json['score'].toString()) : 1.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'imageUrl': imageUrl,
      'price': price,
      'promoPrice': promoPrice,
      'description': description,
      'cpu': cpu,
      'camera': camera,
      'battery': battery,
      'ram': ram,
      'rom': rom,
      'screen': screen,
      'os': os,
      'stock': stock,
      'isAvailable': isAvailable,
      'score': score,
    };
  }

  bool get isPromo => promoPrice != null && promoPrice! < price;
  double get activePrice => isPromo ? promoPrice! : price;
  bool get isCard => cpu != 'sealed' && cpu != 'plush' && cpu != 'figure' && cpu != 'accessory';
}
