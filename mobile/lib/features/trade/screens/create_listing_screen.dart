import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/widgets/retry_network_image.dart';

class CreateListingScreen extends StatefulWidget {
  const CreateListingScreen({super.key});

  @override
  State<CreateListingScreen> createState() => _CreateListingScreenState();
}

class _CreateListingScreenState extends State<CreateListingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _priceController = TextEditingController();
  Product? _selectedProduct;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<MarketProvider>(context, listen: false).fetchProducts());
  }

  @override
  void dispose() {
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedProduct == null) return;

    setState(() => _isSubmitting = true);
    try {
      await ApiService.createListing(
        _selectedProduct!.id,
        double.parse(_priceController.text),
      );
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 48),
              const SizedBox(height: 12),
              const Text('Đăng bán thành công!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 4),
              Text('"${_selectedProduct!.name}" đang được rao bán trên chợ thẻ.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: ${e.toString().replaceFirst("Exception: ", "")}'),
            backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final market = Provider.of<MarketProvider>(context);
    final products = market.products.where((p) => p.isCard).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('ĐĂNG BÁN THẺ BÀI')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Chọn thẻ Pokemon và đặt giá để đăng bán trên chợ thẻ.',
                  style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
              const SizedBox(height: 20),

              if (products.isEmpty && !market.isLoading)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF5F5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFEE2E2)),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.info_outline, color: Color(0xFFEF4444), size: 40),
                      SizedBox(height: 8),
                      Text('Không có thẻ bài nào để đăng bán.',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                )
              else ...[
                // Product Dropdown
                const Text('CHỌN THẺ BÀI *',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 0.5)),
                const SizedBox(height: 8),
                DropdownButtonFormField<Product>(
                  value: _selectedProduct,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                  ),
                  isExpanded: true,
                  hint: const Text('Chọn thẻ bài...', style: TextStyle(fontSize: 13)),
                  items: products.map((p) => DropdownMenuItem<Product>(
                    value: p,
                    child: Text(p.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
                  )).toList(),
                  onChanged: (val) {
                    setState(() {
                      _selectedProduct = val;
                      if (val != null) {
                        _priceController.text = val.activePrice.toStringAsFixed(2);
                      }
                    });
                  },
                  validator: (val) => val == null ? 'Vui lòng chọn thẻ bài' : null,
                ),
                const SizedBox(height: 20),

                // Price Input
                const Text('GIÁ RAO BÁN (USD) *',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 0.5)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _priceController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: InputDecoration(
                    prefixText: '\$ ',
                    prefixStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                  ),
                  validator: (val) {
                    if (val == null || val.isEmpty) return 'Vui lòng nhập giá';
                    final price = double.tryParse(val);
                    if (price == null || price <= 0) return 'Giá phải lớn hơn 0';
                    return null;
                  },
                ),
                if (_selectedProduct != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text('Giá tham khảo: \$${_selectedProduct!.activePrice.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                  ),
                const SizedBox(height: 28),

                // Preview
                if (_selectedProduct != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        const Text('XEM TRƯỚC THẺ BÀI',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 0.5)),
                        const SizedBox(height: 12),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: RetryNetworkImage(
                            url: _selectedProduct!.imageUrl ?? '',
                            width: 160,
                            height: 210,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(_selectedProduct!.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            textAlign: TextAlign.center),
                        const SizedBox(height: 4),
                        Text(_selectedProduct!.brand,
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            _buildChip(_selectedProduct!.ram ?? 'N/A', const Color(0xFF3B82F6)),
                            _buildChip('⭐ ${_selectedProduct!.score.toStringAsFixed(1)}', const Color(0xFFF59E0B)),
                            _buildChip(_selectedProduct!.rom ?? 'Mint', const Color(0xFF10B981)),
                          ],
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 28),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: (_selectedProduct == null || _isSubmitting) ? null : _submit,
                    icon: _isSubmitting
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.sell, color: Colors.white, size: 18),
                    label: Text(_isSubmitting ? 'ĐANG ĐĂNG BÁN...' : 'ĐĂNG BÁN THẺ',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE53935),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(label,
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
    );
  }
}
