import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/widgets/retry_network_image.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class CreateAuctionScreen extends StatefulWidget {
  const CreateAuctionScreen({super.key});

  @override
  State<CreateAuctionScreen> createState() => _CreateAuctionScreenState();
}

class _CreateAuctionScreenState extends State<CreateAuctionScreen> {
  final _formKey = GlobalKey<FormState>();
  
  Product? _selectedProduct;
  final _cardNameController = TextEditingController();
  final _imageUrlController = TextEditingController();
  final _rarityController = TextEditingController();
  final _currentBidController = TextEditingController();
  
  String _selectedCondition = 'Mint';
  int _selectedDurationHours = 24;
  bool _isSubmitting = false;
  final ImagePicker _picker = ImagePicker();
  bool _uploadingImage = false;

  final List<String> _conditions = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Played'];
  final List<int> _durations = [1, 3, 6, 12, 24, 48, 72];

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<MarketProvider>(context, listen: false).fetchProducts());
  }

  @override
  void dispose() {
    _cardNameController.dispose();
    _imageUrlController.dispose();
    _rarityController.dispose();
    _currentBidController.dispose();
    super.dispose();
  }

  void _onProductSelected(Product product) {
    setState(() {
      _selectedProduct = product;
      _cardNameController.text = product.name;
      _imageUrlController.text = product.imageUrl ?? '';
      _rarityController.text = product.ram ?? 'Rare';
      _currentBidController.text = product.activePrice.toStringAsFixed(2);
    });
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(source: source, imageQuality: 80);
      if (picked == null) return;
      setState(() => _uploadingImage = true);
      final url = await ApiService.uploadImage(File(picked.path));
      setState(() {
        _imageUrlController.text = url;
        _uploadingImage = false;
      });
    } catch (e) {
      setState(() => _uploadingImage = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi tải ảnh: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _showImageSourceSheet() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Chọn từ thư viện'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Chụp ảnh từ máy ảnh'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
          ],
        ),
      ),
    );
    if (source != null) await _pickImage(source);
  }

  void _showCardSelector(List<Product> products) {
    String searchQuery = '';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setStateSheet) {
            final filtered = products
                .where((p) =>
                    p.isCard &&
                    p.name.toLowerCase().contains(searchQuery.toLowerCase()))
                .toList();

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SizedBox(
                height: MediaQuery.of(context).size.height * 0.65,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Chọn Thẻ Bài Đấu Giá',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(ctx),
                          icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      decoration: InputDecoration(
                        hintText: 'Tìm kiếm thẻ bài...',
                        prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8)),
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        fillColor: const Color(0xFFF8FAFC),
                        filled: true,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: Colors.grey.shade200),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFFE53935), width: 1.5),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: Colors.grey.shade200),
                        ),
                      ),
                      onChanged: (val) {
                        setStateSheet(() {
                          searchQuery = val;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: filtered.isEmpty
                          ? const Center(
                              child: Text(
                                'Không tìm thấy thẻ bài nào!',
                                style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                              ),
                            )
                          : ListView.builder(
                              itemCount: filtered.length,
                              itemBuilder: (context, idx) {
                                final p = filtered[idx];
                                final resolvedImg = ApiService.resolveImageUrl(p.imageUrl);
                                return ListTile(
                                  contentPadding: const EdgeInsets.symmetric(vertical: 6),
                                  leading: Container(
                                    width: 48,
                                    height: 64,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    padding: const EdgeInsets.all(4),
                                    child: RetryNetworkImage(url: resolvedImg, fit: BoxFit.contain),
                                  ),
                                  title: Text(
                                    p.name,
                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  subtitle: Text(
                                    '${p.ram ?? "Rare"} | \$${p.activePrice.toStringAsFixed(2)}',
                                    style: const TextStyle(fontSize: 10, color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                                  ),
                                  trailing: ElevatedButton(
                                    onPressed: () {
                                      _onProductSelected(p);
                                      Navigator.pop(ctx);
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFFEF2F2),
                                      foregroundColor: const Color(0xFFE53935),
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                    ),
                                    child: const Text('CHỌN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                                );
                              },
                            ),
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

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
        ),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: const BoxDecoration(
                  color: Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981),
                  size: 50,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Tạo đấu giá thành công!',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1E293B),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              const Text(
                'Phiên đấu giá live mới của bạn đã được tạo và kích hoạt trên hệ thống.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey, height: 1.5),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE53935),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: const Text(
                  'ĐỒNG Ý (OK)',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    
    final cardName = _cardNameController.text.trim();
    final imageUrl = _imageUrlController.text.trim();
    final rarity = _rarityController.text.trim();
    final startingBid = double.tryParse(_currentBidController.text.trim());
    
    if (startingBid == null || startingBid <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập giá khởi điểm hợp lệ!'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final endTime = DateTime.now().add(Duration(hours: _selectedDurationHours)).toUtc().toIso8601String();
      
      final payload = {
        'cardName': cardName,
        'imageUrl': imageUrl,
        'rarity': rarity,
        'condition': _selectedCondition,
        'currentBid': startingBid,
        'endTime': endTime,
      };

      await Provider.of<MarketProvider>(context, listen: false).createAuction(payload);

      if (mounted) {
        _showSuccessDialog();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final market = Provider.of<MarketProvider>(context);
    final cardProducts = market.products.where((p) => p.isCard).toList();
    final resolvedSelectedImg = _selectedProduct != null
        ? ApiService.resolveImageUrl(_selectedProduct!.imageUrl)
        : '';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('TẠO PHIÊN ĐẤU GIÁ MỚI'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header description
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFDBEAFE)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: Color(0xFF2563EB), size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Là Admin, bạn có thể tạo phiên đấu giá cho hệ thống. Bạn có thể chọn nhanh từ danh mục thẻ hiện tại của cửa hàng.',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade900,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Card quick selector preview
              Card(
                color: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(color: Colors.grey.shade100),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      if (_selectedProduct != null) ...[
                        Row(
                          children: [
                            Container(
                              width: 60,
                              height: 80,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: const EdgeInsets.all(4),
                              child: RetryNetworkImage(url: resolvedSelectedImg, fit: BoxFit.contain),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _selectedProduct!.name,
                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${_selectedProduct!.ram ?? "Rare"} | Gốc: \$${_selectedProduct!.activePrice.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Color(0xFF94A3B8),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],
                      ElevatedButton.icon(
                        onPressed: () => _showCardSelector(cardProducts),
                        icon: const Icon(Icons.style_rounded, size: 16),
                        label: Text(_selectedProduct != null ? 'THAY ĐỔI THẺ BÀI' : 'CHỌN THẺ BÀI CỬA HÀNG'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE53935),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          minimumSize: const Size(double.infinity, 44),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Card Name field
              const Text('Tên thẻ bài:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(height: 6),
              TextFormField(
                controller: _cardNameController,
                decoration: const InputDecoration(hintText: 'Nhập tên thẻ bài...'),
                validator: (val) => val == null || val.trim().isEmpty ? 'Không được bỏ trống tên thẻ bài' : null,
              ),
              const SizedBox(height: 16),

              // Image field
              const Text('Ảnh thẻ bài:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(height: 6),
              ElevatedButton.icon(
                onPressed: _uploadingImage ? null : _showImageSourceSheet,
                icon: _uploadingImage
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.add_a_photo, size: 16),
                label: Text(_uploadingImage ? 'Đang tải ảnh...' : 'Chọn ảnh từ điện thoại'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEFF6FF),
                  foregroundColor: const Color(0xFF2563EB),
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),
              if (_imageUrlController.text.isNotEmpty)
                Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: RetryNetworkImage(
                    url: ApiService.resolveImageUrl(_imageUrlController.text),
                    fit: BoxFit.contain,
                  ),
                ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _imageUrlController,
                decoration: const InputDecoration(hintText: 'Hoặc dán đường dẫn ảnh (URL)...'),
                validator: (val) => val == null || val.trim().isEmpty ? 'Không được bỏ trống ảnh thẻ bài' : null,
              ),
              const SizedBox(height: 16),

              // Rarity field
              const Text('Độ hiếm (Rarity):', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(height: 6),
              TextFormField(
                controller: _rarityController,
                decoration: const InputDecoration(hintText: 'Secret Rare, VMAX, Ultra Rare...'),
                validator: (val) => val == null || val.trim().isEmpty ? 'Không được bỏ trống độ hiếm' : null,
              ),
              const SizedBox(height: 16),

              // Price & Condition Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Giá khởi điểm (\$):', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _currentBidController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(hintText: '0.00'),
                          validator: (val) => val == null || val.trim().isEmpty ? 'Bắt buộc' : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tình trạng thẻ:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedCondition,
                          decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
                          items: _conditions
                              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _selectedCondition = val;
                              });
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Duration dropdown selector
              const Text('Thời gian đấu giá:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(height: 6),
              DropdownButtonFormField<int>(
                value: _selectedDurationHours,
                decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
                items: _durations
                    .map((h) => DropdownMenuItem(value: h, child: Text('$h giờ')))
                    .toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedDurationHours = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 32),

              // Submit button
              ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE53935),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text(
                        'TẠO PHIÊN ĐẤU GIÁ',
                        style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.8),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
