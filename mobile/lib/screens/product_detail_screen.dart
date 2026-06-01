import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductDetailScreen extends StatefulWidget {
  final int productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  Product? _product;
  bool _isLoading = true;
  int _quantity = 1;
  bool _isAdding = false;

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    try {
      final p = await ApiService.getProductById(widget.productId);
      setState(() {
        _product = p;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}'), backgroundColor: Colors.red),
        );
        Navigator.pop(context);
      }
    }
  }

  Future<void> _handleAddToCart() async {
    if (_product == null || _product!.stock <= 0) return;
    setState(() => _isAdding = true);
    try {
      await Provider.of<CartProvider>(context, listen: false)
          .addToCart(_product!.id, _quantity);
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Thành công'),
            content: Text('Đã thêm $_quantity sản phẩm vào Giỏ hàng!'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Tiếp tục mua sắm'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                  // Find dashboard and switch to cart tab
                  // (Usually in our Tab system, we just pop or redirect)
                },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE53935)),
                child: const Text('Xem Giỏ hàng', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
      }
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $err'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isAdding = false);
    }
  }

  Widget _buildSpecTile(String label, String? value, {bool fullWidth = false}) {
    return Container(
      width: fullWidth ? double.infinity : MediaQuery.of(context).size.width * 0.43,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 4),
          Text(
            value ?? 'N/A',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFE53935)),
        ),
      );
    }

    if (_product == null) return const Scaffold(body: Center(child: Text('Không tìm thấy sản phẩm')));

    final item = _product!;
    final resolvedImg = ApiService.resolveImageUrl(item.imageUrl);
    final inStock = item.stock > 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('CHI TIẾT THẺ BÀI'),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 110),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image background wrapper
                Container(
                  color: const Color(0xFFF8FAFC),
                  height: 300,
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  child: Image.network(resolvedImg, fit: BoxFit.contain),
                ),

                // Specs Details container
                Container(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.brand.toUpperCase(),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.name,
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 16),

                      // Price and Stock row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          if (item.isPromo) ...[
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '\$${item.promoPrice!.toStringAsFixed(2)}',
                                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFFEF4444)),
                                ),
                                Text(
                                  'Giá gốc: \$${item.price.toStringAsFixed(2)}',
                                  style: const TextStyle(fontSize: 11, decoration: TextDecoration.lineThrough, color: Color(0xFF94A3B8)),
                                ),
                              ],
                            ),
                          ] else
                            Text(
                              '\$${item.price.toStringAsFixed(2)}',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                            ),

                          // Stock status badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: inStock ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: inStock ? const Color(0xFFBCF0DA) : const Color(0xFFFCA5A5)),
                            ),
                            child: Text(
                              inStock ? 'Còn hàng (${item.stock})' : 'Hết hàng',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: inStock ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Description
                      const Text(
                        'Mô tả sản phẩm',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.description ?? 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.6),
                      ),
                      const SizedBox(height: 24),

                      // Specifications Grid
                      const Text(
                        'Thông Số Kỹ Thuật',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 12),
                      if (item.isCard) ...[
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            _buildSpecTile('Loại thẻ bài', item.cpu),
                            _buildSpecTile('HP', item.camera),
                            _buildSpecTile('Mã số thẻ', item.battery),
                            _buildSpecTile('Độ hiếm', item.ram),
                            _buildSpecTile('Tình trạng', item.rom),
                            _buildSpecTile('Set', item.screen),
                            _buildSpecTile('Họa sĩ thiết kế', item.os, fullWidth: true),
                          ],
                        ),
                      ] else ...[
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            _buildSpecTile('Phân loại', item.cpu),
                            _buildSpecTile('Tình trạng', item.rom ?? 'Mới 100%'),
                            _buildSpecTile('Nhà sản xuất / Thiết kế', item.os ?? 'Nintendo', fullWidth: true),
                          ],
                        ),
                      ],

                      // Trade Propose Button
                      if (item.isCard && inStock) ...[
                        const SizedBox(height: 20),
                        OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pushNamed(context, '/trades', arguments: item);
                          },
                          icon: const Icon(Icons.swap_horizontal_circle_outlined, color: Color(0xFFE53935)),
                          label: const Text(
                            'ĐỀ XUẤT TRAO ĐỔI THẺ',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE53935)),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFFFEE2E2), width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            backgroundColor: const Color(0xFFFFF5F5),
                            minimumSize: const Size(double.infinity, 50),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Bar for Add to Cart
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 88,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
              ),
              child: inStock
                  ? Row(
                      children: [
                        // Quantity Adjuster
                        Container(
                          height: 52,
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove, size: 18),
                                onPressed: () {
                                  if (_quantity > 1) setState(() => _quantity--);
                                },
                              ),
                              SizedBox(
                                width: 28,
                                child: Text(
                                  '$_quantity',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add, size: 18),
                                onPressed: () {
                                  if (_quantity < item.stock) setState(() => _quantity++);
                                },
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),

                        // Add to Cart Button
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isAdding ? null : _handleAddToCart,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE53935),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              minimumSize: const Size(double.infinity, 52),
                            ),
                            child: _isAdding
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Text(
                                    'THÊM VÀO GIỎ HÀNG',
                                    style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.8),
                                  ),
                          ),
                        ),
                      ],
                    )
                  : Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'SẢN PHẨM HIỆN ĐÃ HẾT HÀNG',
                        style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 0.8),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
