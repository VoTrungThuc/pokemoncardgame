import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/cart/providers/cart_provider.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/core/services/api_service.dart';

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
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withOpacity(0.1),
                              blurRadius: 20,
                              spreadRadius: 4,
                        ),
                          ],
                        ),
                      ),
                      Container(
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF6EE7B7), width: 2),
                        ),
                        child: const Icon(
                          Icons.check_circle_rounded,
                          color: Color(0xFF10B981),
                          size: 40,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Thành công!',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF1E293B),
                      letterSpacing: 0.2,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Text(
                      'Đã thêm $_quantity sản phẩm vào Giỏ hàng thành công.',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF475569),
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            Navigator.pop(context); // Go back
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFFE53935),
                            side: const BorderSide(color: Color(0xFFE53935), width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: const Text(
                            'TIẾP TỤC MUA',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.2),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pop(ctx); // Close dialog
                            Navigator.pushNamedAndRemoveUntil(
                              context,
                              '/dashboard',
                              (route) => false,
                              arguments: 1, // Redirect to Dashboard and open Cart tab
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE53935),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          child: const Text(
                            'XEM GIỎ HÀNG',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.2),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
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

  void _showTradeProposeBottomSheet(BuildContext context, Product card) {
    final currentUserId = Provider.of<AuthProvider>(context, listen: false).user?.id;
    bool loading = true;
    List<dynamic> partnerListings = [];
    List<dynamic> myListings = [];
    dynamic selectedPartnerListing;
    dynamic selectedMyListing;
    String? errorMessage;
    bool isSubmitting = false;
    bool initiated = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            if (!initiated) {
              initiated = true;
              Future.microtask(() async {
                try {
                  final allListings = await ApiService.getListings(availableOnly: true);
                  
                  // Filter partner listings for this card
                  final pListings = allListings.where((l) {
                    final cardId = l['card']?['id'];
                    final userId = l['user']?['id'];
                    return cardId == card.id && userId != currentUserId;
                  }).toList();

                  // Filter my listings
                  final mListings = allListings.where((l) {
                    final userId = l['user']?['id'];
                    return userId == currentUserId;
                  }).toList();

                  setModalState(() {
                    partnerListings = pListings;
                    myListings = mListings;
                    if (partnerListings.isNotEmpty) {
                      selectedPartnerListing = partnerListings[0];
                    }
                    if (myListings.isNotEmpty) {
                      selectedMyListing = myListings[0];
                    }
                    loading = false;
                  });
                } catch (e) {
                  setModalState(() {
                    errorMessage = e.toString();
                    loading = false;
                  });
                }
              });
            }

            // Calculations
            final double requestedScore = selectedPartnerListing != null
                ? (selectedPartnerListing['card']?['score'] != null
                    ? double.tryParse(selectedPartnerListing['card']['score'].toString()) ?? 1.0
                    : 1.0)
                : 1.0;
            final double offeredScore = selectedMyListing != null
                ? (selectedMyListing['card']?['score'] != null
                    ? double.tryParse(selectedMyListing['card']['score'].toString()) ?? 1.0
                    : 1.0)
                : 1.0;
            final double diff = (requestedScore - offeredScore).abs();
            final bool isValid = diff <= 1.5;

            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 12,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Handle
                    Container(
                      width: 40,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 20),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.swap_horizontal_circle_outlined, color: Color(0xFFE53935), size: 28),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Đề Xuất Trao Đổi Thẻ',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                              Text(
                                card.name,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const Divider(height: 24, thickness: 1, color: Color(0xFFF1F5F9)),

                    if (loading) ...[
                      const SizedBox(height: 40),
                      const CircularProgressIndicator(color: Color(0xFFE53935)),
                      const SizedBox(height: 16),
                      const Text(
                        'Đang kiểm tra tin đăng khả dụng...',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 40),
                    ] else if (errorMessage != null) ...[
                      const SizedBox(height: 20),
                      Text(
                        'Đã xảy ra lỗi: $errorMessage',
                        style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                    ] else ...[
                      if (partnerListings.isEmpty) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF5F5),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFFEE2E2)),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 40),
                              const SizedBox(height: 8),
                              const Text(
                                'Không có tin đăng nào của người khác',
                                style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Thẻ "${card.name}" hiện không có huấn luyện viên nào khác đăng bán hoạt động trên Marketplace.',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ] else if (myListings.isEmpty) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF5F5),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFFEE2E2)),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.info_outline, color: Color(0xFFEF4444), size: 40),
                              const SizedBox(height: 8),
                              const Text(
                                'Bạn chưa đăng bán thẻ nào',
                                style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Để đề xuất trao đổi, bạn cần có ít nhất một tin đăng bán hoạt động của thẻ bài khác trên hệ thống để làm vật trao đổi.',
                                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ] else ...[
                        // Select Partner Listing
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'CHỌN TIN ĐĂNG ĐỐI TÁC (BẠN MUỐN ĐỔI LẤY)',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF64748B),
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            DropdownButtonFormField<dynamic>(
                              value: selectedPartnerListing,
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
                              items: partnerListings.map((l) {
                                final uName = l['user']?['username'] ?? 'Trainer';
                                final price = l['price'] != null ? double.tryParse(l['price'].toString()) ?? 0.0 : 0.0;
                                final scoreVal = l['card']?['score'] != null ? double.tryParse(l['card']['score'].toString()) ?? 1.0 : 1.0;
                                return DropdownMenuItem<dynamic>(
                                  value: l,
                                  child: Text(
                                    '@$uName - \$${price.toStringAsFixed(2)} (Điểm: ${scoreVal.toStringAsFixed(1)})',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) {
                                setModalState(() {
                                  selectedPartnerListing = val;
                                });
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Select My Listing
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'CHỌN THẺ CỦA BẠN ĐỂ ĐỔI (TIN ĐĂNG CỦA BẠN)',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF64748B),
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            DropdownButtonFormField<dynamic>(
                              value: selectedMyListing,
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
                              items: myListings.map((l) {
                                final cName = l['card']?['name'] ?? 'Thẻ bài';
                                final scoreVal = l['card']?['score'] != null ? double.tryParse(l['card']['score'].toString()) ?? 1.0 : 1.0;
                                return DropdownMenuItem<dynamic>(
                                  value: l,
                                  child: Text(
                                    '$cName (Điểm: ${scoreVal.toStringAsFixed(1)})',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) {
                                setModalState(() {
                                  selectedMyListing = val;
                                });
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Comparison (Fair Trade validation)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isValid ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isValid ? const Color(0xFFBBF7D0) : const Color(0xFFFCA5A5),
                              width: 1.5,
                            ),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'THẺ ĐỐI TÁC',
                                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          selectedPartnerListing?['card']?['name'] ?? 'N/A',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Điểm: ${requestedScore.toStringAsFixed(1)}',
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.8),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.swap_horiz,
                                      color: Color(0xFFE53935),
                                      size: 20,
                                    ),
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        const Text(
                                          'THẺ CỦA BẠN',
                                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          selectedMyListing?['card']?['name'] ?? 'N/A',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Điểm: ${offeredScore.toStringAsFixed(1)}',
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20, thickness: 1, color: Color(0xFFE2E8F0)),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Chênh lệch sức mạnh:',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                                  ),
                                  Text(
                                    diff.toStringAsFixed(1),
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w900,
                                      color: isValid ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(
                                    isValid ? Icons.check_circle_outline : Icons.error_outline,
                                    color: isValid ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                    size: 16,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      isValid
                                          ? 'Hợp lệ! Điểm chênh lệch nằm trong giới hạn cho phép (≤ 1.5).'
                                          : 'Không hợp lệ! Chênh lệch điểm vượt quá 1.5. Vui lòng chọn thẻ khác.',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: isValid ? const Color(0xFF15803D) : const Color(0xFFB91C1C),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ],

                    // Cancel / Submit buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF64748B),
                              side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            child: const Text(
                              'HỦY BỎ',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5),
                            ),
                          ),
                        ),
                        if (partnerListings.isNotEmpty && myListings.isNotEmpty) ...[
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: (!isValid || isSubmitting)
                                  ? null
                                  : () async {
                                      setModalState(() {
                                        isSubmitting = true;
                                      });
                                      try {
                                        final toUserId = selectedPartnerListing['user']['id'];
                                        final offeredCardId = selectedMyListing['card']['id'];
                                        final requestedCardId = card.id;

                                        await Provider.of<MarketProvider>(context, listen: false)
                                            .proposeTrade(toUserId, offeredCardId, requestedCardId);

                                        Navigator.pop(context); // Close bottom sheet

                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Đã gửi đề xuất trao đổi thành công!'),
                                            backgroundColor: Colors.green,
                                          ),
                                        );

                                        Navigator.pushNamed(context, '/trades');
                                      } catch (err) {
                                        setModalState(() {
                                          isSubmitting = false;
                                        });
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text('Lỗi: ${err.toString()}'),
                                            backgroundColor: Colors.red,
                                          ),
                                        );
                                      }
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE53935),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                elevation: 0,
                              ),
                              child: isSubmitting
                                  ? const SizedBox(
                                      height: 16,
                                      width: 16,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : const Text(
                                      'GỬI ĐỀ XUẤT',
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5),
                                    ),
                            ),
                          ),
                        ],
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
                            _showTradeProposeBottomSheet(context, item);
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
