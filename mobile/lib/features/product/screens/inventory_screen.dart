import 'package:mobile/shared/widgets/notification_popup.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/core/services/api_service.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<MarketProvider>(context, listen: false).fetchProducts());
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        text,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
      ),
    );
  }

  Future<void> _saveProduct({
    int? id,
    required String name,
    required String brand,
    required double price,
    double? promoPrice,
    required int stock,
    required String cpu,
    required String ram,
    required String rom,
    required String camera,
    required String battery,
    required String screen,
    required String os,
    String? imageUrl,
    required String description,
  }) async {
    final payload = {
      'name': name,
      'brand': brand,
      'price': price,
      'promoPrice': promoPrice,
      'stock': stock,
      'cpu': cpu,
      'ram': ram,
      'rom': rom,
      'camera': camera,
      'battery': battery,
      'screen': screen,
      'os': os,
      'imageUrl': imageUrl,
      'description': description,
      'isAvailable': stock > 0,
      'score': 1.0,
    };
    
    try {
      if (id != null) {
        await ApiService.updateProduct(id, payload);
        if (mounted) {
          showStyledSnackBar(
            context: context,
            message: 'Đã cập nhật thẻ bài thành công!',
            type: NotificationType.success,
          );
        }
      } else {
        await ApiService.createProduct(payload);
        if (mounted) {
          showStyledSnackBar(
            context: context,
            message: 'Đã thêm thẻ bài mới thành công!',
            type: NotificationType.success,
          );
        }
      }
      if (mounted) {
        Provider.of<MarketProvider>(context, listen: false).fetchProducts();
      }
    } catch (e) {
      if (mounted) {
        showStyledSnackBar(
          context: context,
          message: 'Lỗi khi lưu thẻ bài: $e',
          type: NotificationType.error,
        );
      }
    }
  }

  void _confirmDeleteProduct(int id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận xóa', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Bạn có chắc chắn muốn xóa thẻ bài này khỏi hệ thống không? Hành động này không thể hoàn tác.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx); // Close confirm dialog
              Navigator.pop(context); // Close product form sheet
              try {
                await ApiService.deleteProduct(id);
                if (mounted) {
                  showStyledSnackBar(
                    context: context,
                    message: 'Đã xóa thẻ bài thành công!',
                    type: NotificationType.success,
                  );
                  Provider.of<MarketProvider>(context, listen: false).fetchProducts();
                }
              } catch (e) {
                if (mounted) {
                  showStyledSnackBar(
                    context: context,
                    message: 'Lỗi khi xóa thẻ bài: $e',
                    type: NotificationType.error,
                  );
                }
              }
            },
            child: const Text('Xóa', style: TextStyle(color: Color(0xFFE53935), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showProductFormBottomSheet([Product? product]) {
    final isEdit = product != null;
    final formKey = GlobalKey<FormState>();
    
    final nameController = TextEditingController(text: product?.name ?? '');
    final brandController = TextEditingController(text: product?.brand ?? '');
    final priceController = TextEditingController(text: product?.price != null ? product!.price.toString() : '');
    final promoPriceController = TextEditingController(text: product?.promoPrice != null ? product!.promoPrice.toString() : '');
    final stockController = TextEditingController(text: product?.stock != null ? product!.stock.toString() : '0');
    final cpuController = TextEditingController(text: product?.cpu ?? 'Fire');
    final ramController = TextEditingController(text: product?.ram ?? 'Holo Rare');
    final romController = TextEditingController(text: product?.rom ?? 'Near Mint');
    final cameraController = TextEditingController(text: product?.camera ?? '');
    final batteryController = TextEditingController(text: product?.battery ?? '');
    final screenController = TextEditingController(text: product?.screen ?? '');
    final osController = TextEditingController(text: product?.os ?? '');
    final imageUrlController = TextEditingController(text: product?.imageUrl ?? '');
    final descriptionController = TextEditingController(text: product?.description ?? '');
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          isEdit ? 'Chỉnh sửa thẻ bài' : 'Thêm thẻ bài mới',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                        ),
                        if (isEdit)
                          IconButton(
                            icon: const Icon(Icons.delete_forever_rounded, color: Color(0xFFE53935)),
                            onPressed: () => _confirmDeleteProduct(product.id),
                          ),
                      ],
                    ),
                    const Divider(height: 24),
                    
                    _buildLabel('Tên thẻ bài *'),
                    TextFormField(
                      controller: nameController,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      decoration: const InputDecoration(hintText: 'Nhập tên thẻ bài (vd: Charizard VMAX)...'),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Vui lòng nhập tên thẻ bài' : null,
                    ),
                    const SizedBox(height: 16),
                    
                    _buildLabel('Tên Pokémon *'),
                    TextFormField(
                      controller: brandController,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      decoration: const InputDecoration(hintText: 'Nhập tên Pokémon (vd: Charizard)...'),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Vui lòng nhập tên Pokémon' : null,
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Giá bán (\$) *'),
                              TextFormField(
                                controller: priceController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: '0.00'),
                                validator: (val) {
                                  if (val == null || val.trim().isEmpty) return 'Nhập giá bán';
                                  if (double.tryParse(val) == null) return 'Giá số không hợp lệ';
                                  return null;
                                },
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Giá KM (\$)'),
                              TextFormField(
                                controller: promoPriceController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: 'Bỏ trống nếu không KM'),
                                validator: (val) {
                                  if (val != null && val.trim().isNotEmpty && double.tryParse(val) == null) {
                                    return 'Giá KM không hợp lệ';
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Số lượng kho *'),
                              TextFormField(
                                controller: stockController,
                                keyboardType: TextInputType.number,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: '0'),
                                validator: (val) {
                                  if (val == null || val.trim().isEmpty) return 'Nhập số lượng';
                                  if (int.tryParse(val) == null) return 'Phải là số nguyên';
                                  return null;
                                },
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Chỉ số HP (vd: 330 HP)'),
                              TextFormField(
                                controller: cameraController,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: 'vd: 330 HP'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Hệ Pokémon (Element)'),
                              DropdownButtonFormField<String>(
                                value: ['Fire', 'Water', 'Grass', 'Psychic', 'Darkness', 'Dragon', 'Lightning', 'Colorless', 'Metal', 'Fighting'].contains(cpuController.text) ? cpuController.text : 'Fire',
                                decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 4)),
                                items: ['Fire', 'Water', 'Grass', 'Psychic', 'Darkness', 'Dragon', 'Lightning', 'Colorless', 'Metal', 'Fighting']
                                    .map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))))
                                    .toList(),
                                onChanged: (val) {
                                  if (val != null) cpuController.text = val;
                                },
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Độ hiếm (Rarity)'),
                              DropdownButtonFormField<String>(
                                value: ['Holo Rare', 'VMAX', 'Secret Rare', 'VSTAR', 'Special Art Rare', 'Gold Star', 'Common', 'Promo', 'Ultra Rare'].contains(ramController.text) ? ramController.text : 'Holo Rare',
                                decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 4)),
                                items: ['Holo Rare', 'VMAX', 'Secret Rare', 'VSTAR', 'Special Art Rare', 'Gold Star', 'Common', 'Promo', 'Ultra Rare']
                                    .map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))))
                                    .toList(),
                                onChanged: (val) {
                                  if (val != null) ramController.text = val;
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Tình trạng (Condition)'),
                              TextFormField(
                                controller: romController,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: 'vd: Mint, Near Mint...'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Mã số thẻ (Card ID)'),
                              TextFormField(
                                controller: batteryController,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: 'vd: 020/073'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Bộ mở rộng (Expansion)'),
                              TextFormField(
                                controller: screenController,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: 'vd: Obsidian Flames...'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Họa sĩ (Artist)'),
                              TextFormField(
                                controller: osController,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                decoration: const InputDecoration(hintText: 'vd: Mitsuhiro Arita'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    _buildLabel('URL Hình ảnh'),
                    TextFormField(
                      controller: imageUrlController,
                      style: const TextStyle(fontSize: 12),
                      decoration: const InputDecoration(hintText: 'Nhập link ảnh (https://...)...'),
                    ),
                    const SizedBox(height: 16),
                    
                    _buildLabel('Mô tả thẻ bài'),
                    TextFormField(
                      controller: descriptionController,
                      maxLines: 3,
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(hintText: 'Mô tả chi tiết về thẻ bài của bạn...'),
                    ),
                    const SizedBox(height: 28),
                    
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF64748B),
                              side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              minimumSize: const Size(double.infinity, 50),
                            ),
                            child: const Text('Hủy', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              if (formKey.currentState!.validate()) {
                                _saveProduct(
                                  id: product?.id,
                                  name: nameController.text.trim(),
                                  brand: brandController.text.trim(),
                                  price: double.parse(priceController.text.trim()),
                                  promoPrice: promoPriceController.text.trim().isNotEmpty
                                      ? double.parse(promoPriceController.text.trim())
                                      : null,
                                  stock: int.parse(stockController.text.trim()),
                                  cpu: cpuController.text.trim(),
                                  ram: ramController.text.trim(),
                                  rom: romController.text.trim(),
                                  camera: cameraController.text.trim().isNotEmpty ? cameraController.text.trim() : 'N/A',
                                  battery: batteryController.text.trim().isNotEmpty ? batteryController.text.trim() : 'N/A',
                                  screen: screenController.text.trim().isNotEmpty ? screenController.text.trim() : 'N/A',
                                  os: osController.text.trim().isNotEmpty ? osController.text.trim() : 'N/A',
                                  imageUrl: imageUrlController.text.trim().isNotEmpty ? imageUrlController.text.trim() : null,
                                  description: descriptionController.text.trim(),
                                );
                                Navigator.pop(context);
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE53935),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              minimumSize: const Size(double.infinity, 50),
                            ),
                            child: Text(
                              isEdit ? 'Cập nhật' : 'Thêm mới',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final market = Provider.of<MarketProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('QUẢN LÝ KHO THẺ BÀI'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Color(0xFFE53935)),
            onPressed: () => _showProductFormBottomSheet(),
          ),
        ],
      ),
      body: market.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
          : RefreshIndicator(
              onRefresh: () => market.fetchProducts(),
              color: const Color(0xFFE53935),
              child: market.products.isEmpty
                  ? const Center(child: Text('Không có thẻ bài nào trong kho.'))
                  : ListView.builder(
                      itemCount: market.products.length,
                      padding: const EdgeInsets.all(16),
                      itemBuilder: (context, index) {
                        final product = market.products[index];
                        final resolvedImg = ApiService.resolveImageUrl(product.imageUrl);

                        return Card(
                          color: Colors.white,
                          elevation: 0,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: Colors.grey.shade100),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Container(
                                  width: 50,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  padding: const EdgeInsets.all(4),
                                  child: Image.network(resolvedImg, fit: BoxFit.contain),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        product.name,
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Số lượng: ${product.stock} | Giá: \$${product.price.toStringAsFixed(2)}',
                                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined, color: Color(0xFF64748B), size: 20),
                                  onPressed: () => _showProductFormBottomSheet(product),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
