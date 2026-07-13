import 'package:mobile/shared/widgets/notification_popup.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/widgets/retry_network_image.dart';

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
      builder: (context) => _ProductFormSheet(
        product: product,
        onDelete: product != null ? () => _confirmDeleteProduct(product.id) : null,
        onSaved: (payload) => _saveProduct(
          id: product?.id,
          name: payload['name'] as String,
          brand: payload['brand'] as String,
          price: payload['price'] as double,
          promoPrice: payload['promoPrice'] as double?,
          stock: payload['stock'] as int,
          cpu: payload['cpu'] as String,
          ram: payload['ram'] as String,
          rom: payload['rom'] as String,
          camera: payload['camera'] as String,
          battery: payload['battery'] as String,
          screen: payload['screen'] as String,
          os: payload['os'] as String,
          imageUrl: payload['imageUrl'] as String?,
          description: payload['description'] as String,
        ),
      ),
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
                                  child: RetryNetworkImage(url: resolvedImg, fit: BoxFit.contain),
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

class _ProductFormSheet extends StatefulWidget {
  final Product? product;
  final VoidCallback? onDelete;
  final void Function(Map<String, dynamic> payload) onSaved;

  const _ProductFormSheet({
    this.product,
    this.onDelete,
    required this.onSaved,
  });

  @override
  State<_ProductFormSheet> createState() => _ProductFormSheetState();
}

class _ProductFormSheetState extends State<_ProductFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();

  final _nameController = TextEditingController();
  final _brandController = TextEditingController();
  final _priceController = TextEditingController();
  final _promoPriceController = TextEditingController();
  final _stockController = TextEditingController();
  final _cpuController = TextEditingController();
  final _ramController = TextEditingController();
  final _romController = TextEditingController();
  final _cameraController = TextEditingController();
  final _batteryController = TextEditingController();
  final _screenController = TextEditingController();
  final _osController = TextEditingController();
  final _imageUrlController = TextEditingController();
  final _descriptionController = TextEditingController();

  File? _pickedImage;
  bool _uploading = false;
  String? _uploadedUrl;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nameController.text = p?.name ?? '';
    _brandController.text = p?.brand ?? '';
    _priceController.text = p?.price != null ? p!.price.toString() : '';
    _promoPriceController.text = p?.promoPrice != null ? p!.promoPrice.toString() : '';
    _stockController.text = p?.stock != null ? p!.stock.toString() : '0';
    _cpuController.text = p?.cpu ?? 'Fire';
    _ramController.text = p?.ram ?? 'Holo Rare';
    _romController.text = p?.rom ?? 'Near Mint';
    _cameraController.text = p?.camera ?? '';
    _batteryController.text = p?.battery ?? '';
    _screenController.text = p?.screen ?? '';
    _osController.text = p?.os ?? '';
    _imageUrlController.text = p?.imageUrl ?? '';
    _uploadedUrl = p?.imageUrl;
    _descriptionController.text = p?.description ?? '';
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final xfile = await _picker.pickImage(source: source, imageQuality: 80);
      if (xfile == null) return;
      setState(() {
        _pickedImage = File(xfile.path);
        _uploading = true;
      });
      final url = await ApiService.uploadImage(_pickedImage!);
      setState(() {
        _uploadedUrl = url;
        _uploading = false;
      });
      if (mounted) {
        showStyledSnackBar(
          context: context,
          message: 'Đã tải ảnh lên thành công!',
          type: NotificationType.success,
        );
      }
    } catch (e) {
      setState(() => _uploading = false);
      if (mounted) {
        showStyledSnackBar(
          context: context,
          message: 'Lỗi tải ảnh: $e',
          type: NotificationType.error,
        );
      }
    }
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final imageUrl = _uploadedUrl ??
        (_imageUrlController.text.trim().isNotEmpty ? _imageUrlController.text.trim() : null);
    widget.onSaved({
      'name': _nameController.text.trim(),
      'brand': _brandController.text.trim(),
      'price': double.parse(_priceController.text.trim()),
      'promoPrice': _promoPriceController.text.trim().isNotEmpty
          ? double.parse(_promoPriceController.text.trim())
          : null,
      'stock': int.parse(_stockController.text.trim()),
      'cpu': _cpuController.text.trim(),
      'ram': _ramController.text.trim(),
      'rom': _romController.text.trim(),
      'camera': _cameraController.text.trim().isNotEmpty ? _cameraController.text.trim() : 'N/A',
      'battery': _batteryController.text.trim().isNotEmpty ? _batteryController.text.trim() : 'N/A',
      'screen': _screenController.text.trim().isNotEmpty ? _screenController.text.trim() : 'N/A',
      'os': _osController.text.trim().isNotEmpty ? _osController.text.trim() : 'N/A',
      'imageUrl': imageUrl,
      'description': _descriptionController.text.trim(),
    });
    Navigator.pop(context);
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

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.product != null;
    final previewImg = _pickedImage != null
        ? FileImage(_pickedImage!)
        : (_uploadedUrl != null ? NetworkImage(_uploadedUrl!) as ImageProvider : null);

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
            key: _formKey,
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
                    if (widget.onDelete != null)
                      IconButton(
                        icon: const Icon(Icons.delete_forever_rounded, color: Color(0xFFE53935)),
                        onPressed: widget.onDelete,
                      ),
                  ],
                ),
                const Divider(height: 24),

                _buildLabel('Hình ảnh thẻ bài'),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: Column(
                    children: [
                      if (_uploading)
                        const SizedBox(
                          height: 120,
                          child: Center(child: CircularProgressIndicator(color: Color(0xFFE53935))),
                        )
                      else if (previewImg != null)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image(image: previewImg, height: 140, fit: BoxFit.contain),
                        )
                      else
                        const SizedBox(
                          height: 120,
                          child: Center(
                            child: Icon(Icons.image_outlined, size: 48, color: Color(0xFFCBD5E1)),
                          ),
                        ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _uploading ? null : () => _pickImage(ImageSource.gallery),
                              icon: const Icon(Icons.photo_library_outlined, size: 18),
                              label: const Text('Thư viện', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF64748B),
                                side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                minimumSize: const Size(double.infinity, 44),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _uploading ? null : () => _pickImage(ImageSource.camera),
                              icon: const Icon(Icons.camera_alt_outlined, size: 18),
                              label: const Text('Máy ảnh', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF64748B),
                                side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                minimumSize: const Size(double.infinity, 44),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (_uploadedUrl != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle, color: Colors.green, size: 14),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  _uploadedUrl!,
                                  style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                _buildLabel('Hoặc nhập URL Hình ảnh'),
                TextFormField(
                  controller: _imageUrlController,
                  style: const TextStyle(fontSize: 12),
                  decoration: const InputDecoration(hintText: 'Nhập link ảnh (https://...)...'),
                ),
                const SizedBox(height: 16),

                _buildLabel('Tên thẻ bài *'),
                TextFormField(
                  controller: _nameController,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  decoration: const InputDecoration(hintText: 'Nhập tên thẻ bài (vd: Charizard VMAX)...'),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Vui lòng nhập tên thẻ bài' : null,
                ),
                const SizedBox(height: 16),

                _buildLabel('Tên Pokémon *'),
                TextFormField(
                  controller: _brandController,
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
                            controller: _priceController,
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
                            controller: _promoPriceController,
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
                            controller: _stockController,
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
                            controller: _cameraController,
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
                            value: ['Fire', 'Water', 'Grass', 'Psychic', 'Darkness', 'Dragon', 'Lightning', 'Colorless', 'Metal', 'Fighting'].contains(_cpuController.text) ? _cpuController.text : 'Fire',
                            decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 4)),
                            items: ['Fire', 'Water', 'Grass', 'Psychic', 'Darkness', 'Dragon', 'Lightning', 'Colorless', 'Metal', 'Fighting']
                                .map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) _cpuController.text = val;
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
                            value: ['Holo Rare', 'VMAX', 'Secret Rare', 'VSTAR', 'Special Art Rare', 'Gold Star', 'Common', 'Promo', 'Ultra Rare'].contains(_ramController.text) ? _ramController.text : 'Holo Rare',
                            decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 4)),
                            items: ['Holo Rare', 'VMAX', 'Secret Rare', 'VSTAR', 'Special Art Rare', 'Gold Star', 'Common', 'Promo', 'Ultra Rare']
                                .map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) _ramController.text = val;
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
                            controller: _romController,
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
                            controller: _batteryController,
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
                            controller: _screenController,
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
                            controller: _osController,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            decoration: const InputDecoration(hintText: 'vd: Mitsuhiro Arita'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                _buildLabel('Mô tả thẻ bài'),
                TextFormField(
                  controller: _descriptionController,
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
                        onPressed: _uploading ? null : _submit,
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
  }
}
