import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/widgets/retry_network_image.dart';
import 'package:mobile/features/gacha/services/collection_store.dart';

class MyCollectionScreen extends StatefulWidget {
  const MyCollectionScreen({super.key});

  @override
  State<MyCollectionScreen> createState() => _MyCollectionScreenState();
}

class _MyCollectionScreenState extends State<MyCollectionScreen> {
  List<int> _ownedCardIds = [];
  bool _isLoadingCollection = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<MarketProvider>(context, listen: false).fetchProducts());
    _loadCollection();
    _syncCanceledGachaOrders();
    _syncPurchasedCards();
  }

  Future<void> _loadCollection() async {
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final userId = auth.user?.id;
      if (userId == null) {
        setState(() {
          _ownedCardIds = [];
          _isLoadingCollection = false;
        });
        return;
      }
      final ids = await CollectionStore.getOwnedCardIds(userId);
      setState(() {
        _ownedCardIds = ids;
        _isLoadingCollection = false;
      });
    } catch (e) {
      print('Error loading collection: $e');
      setState(() {
        _isLoadingCollection = false;
      });
    }
  }

  Future<void> _syncPurchasedCards() async {
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.user?.role == 'ADMIN') return;
      final userId = auth.user?.id;
      if (userId == null) return;

      final orders = await ApiService.getOrders();

      List<int> syncedOrderIds = await CollectionStore.getSyncedOrderIds(userId);
      List<int> ownedIds = await CollectionStore.getOwnedCardIds(userId);

      bool collectionChanged = false;
      bool syncedOrdersChanged = false;
      for (final order in orders) {
        final String paymentMethod = (order.paymentMethod ?? '').toUpperCase();
        final String status = order.status.toUpperCase();
        final String deliveryType = (order.deliveryType ?? 'ONLINE_COLLECTION').toUpperCase();

        // Online collection cards go into the collection as soon as the order
        // is placed (any non-cancelled status), no need to wait for COMPLETED.
        if (status != 'CANCELLED' && paymentMethod != 'GACHA' && deliveryType == 'ONLINE_COLLECTION') {
          if (!syncedOrderIds.contains(order.id)) {
            for (final item in order.orderItems) {
              if (item.product.isCard) {
                for (int i = 0; i < item.quantity; i++) {
                  ownedIds.add(item.product.id);
                }
              }
            }
            syncedOrderIds.add(order.id);
            collectionChanged = true;
            syncedOrdersChanged = true;
          }
        }
      }

      if (collectionChanged) {
        await CollectionStore.setOwnedCardIds(userId, ownedIds);
        if (mounted) {
          _loadCollection();
        }
      }
      if (syncedOrdersChanged) {
        await CollectionStore.setSyncedOrderIds(userId, syncedOrderIds);
      }
    } catch (e) {
      print('Error syncing purchased cards: $e');
    }
  }


  Future<void> _syncCanceledGachaOrders() async {
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.user?.role == 'ADMIN') return;
      final userId = auth.user?.id;
      if (userId == null) return;

      final orders = await ApiService.getOrders();

      List<int> refundedIds = await CollectionStore.getRefundedOrderIds(userId);

      bool changed = false;
      List<String> refundedCardNames = [];

      for (final order in orders) {
        if (order.paymentMethod != null && 
            order.paymentMethod!.toUpperCase() == 'GACHA' && 
            order.status.toUpperCase() == 'CANCELLED') {
          if (!refundedIds.contains(order.id)) {
            List<int> ownedIds = await CollectionStore.getOwnedCardIds(userId);
            
            for (final item in order.orderItems) {
              for (int i = 0; i < item.quantity; i++) {
                ownedIds.add(item.product.id);
              }
              refundedCardNames.add('${item.product.name} (x${item.quantity})');
            }

            await CollectionStore.setOwnedCardIds(userId, ownedIds);
            refundedIds.add(order.id);
            changed = true;
          }
        }
      }

      if (changed) {
        await CollectionStore.setRefundedOrderIds(userId, refundedIds);
        _loadCollection();
        
        if (mounted) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [
                  Icon(Icons.replay_circle_filled_rounded, color: Colors.green),
                  SizedBox(width: 8),
                  Text('Hoàn trả thẻ Gacha 🎒', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              content: Text(
                'Đơn đổi thẻ Gacha của bạn đã bị hủy.\nCác thẻ bài sau đã được hoàn trả lại bộ sưu tập của bạn:\n\n${refundedCardNames.join("\n")}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('ĐỒNG Ý', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                )
              ],
            ),
          );
        }
      }
    } catch (e) {
      print('Error syncing canceled gacha orders: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final market = Provider.of<MarketProvider>(context);
    
    // Filter cards in catalog that represent user collection
    final ownedCards = market.products.where((p) => _ownedCardIds.contains(p.id)).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('BỘ SƯU TẬP CỦA TÔI'),
      ),
      body: market.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
          : ownedCards.isEmpty
              ? const Center(
                  child: Text(
                    'Bộ sưu tập của bạn trống.\nHãy mở thêm gói bài để sưu tập nhé!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 0.65,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: ownedCards.length,
                  itemBuilder: (context, index) {
                    final card = ownedCards[index];
                    final resolvedImg = ApiService.resolveImageUrl(card.imageUrl);
                    final quantity = _ownedCardIds.where((id) => id == card.id).length;

                    return GestureDetector(
                      onTap: () => _showRedeemBottomSheet(context, card, quantity),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.shade100),
                        ),
                        padding: const EdgeInsets.all(6),
                        child: Column(
                          children: [
                            Expanded(
                              child: Stack(
                                children: [
                                  Center(child: RetryNetworkImage(url: resolvedImg, fit: BoxFit.contain)),
                                  if (quantity > 1)
                                    Positioned(
                                      top: 2,
                                      right: 2,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFE53935),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          'x$quantity',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                          ),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              card.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                            ),
                            Text(
                              card.ram ?? 'Rare',
                              style: const TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  void _showRedeemBottomSheet(BuildContext context, Product card, int maxQuantity) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final formKey = GlobalKey<FormState>();
    
    String deliveryMethod = 'STORE_PICKUP'; // 'STORE_PICKUP' or 'SHIPPING'
    final recipientController = TextEditingController(text: auth.user?.username ?? '');
    final phoneController = TextEditingController(text: '');
    final addressController = TextEditingController(text: auth.user?.shippingAddress ?? '');
    final noteController = TextEditingController();
    
    int selectedQty = 1;
    String? selectedStoreName;
    List<Map<String, dynamic>> stores = [];
    bool isLoadingStores = true;
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            if (stores.isEmpty && isLoadingStores) {
              ApiService.getLocations().then((list) {
                setModalState(() {
                  stores = list;
                  isLoadingStores = false;
                  if (stores.isNotEmpty) {
                    selectedStoreName = stores[0]['name'];
                  }
                });
              }).catchError((e) {
                setModalState(() {
                  isLoadingStores = false;
                });
              });
            }

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(28),
                  topRight: Radius.circular(28),
                ),
              ),
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 5,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: RetryNetworkImage(
                              url: ApiService.resolveImageUrl(card.imageUrl),
                              width: 65,
                              height: 90,
                              fit: BoxFit.contain,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'ĐỔI THẺ POKÉMON VẬT LÝ',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFFE53935),
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  card.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Độ hiếm: ${card.ram ?? "Rare"}',
                                  style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.red.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'Đang có: $maxQuantity thẻ',
                                    style: TextStyle(
                                      color: Colors.red.shade600,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      const Divider(),
                      const SizedBox(height: 12),
                      const Text(
                        'Phương thức nhận thẻ',
                        style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: ChoiceChip(
                              label: const Center(
                                child: Text('NHẬN TẠI CỬA HÀNG', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10)),
                              ),
                              selected: deliveryMethod == 'STORE_PICKUP',
                              selectedColor: const Color(0xFFE53935),
                              disabledColor: Colors.grey.shade100,
                              labelStyle: TextStyle(
                                color: deliveryMethod == 'STORE_PICKUP' ? Colors.white : Colors.black87,
                              ),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              showCheckmark: false,
                              onSelected: (selected) {
                                if (selected) {
                                  setModalState(() {
                                    deliveryMethod = 'STORE_PICKUP';
                                  });
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ChoiceChip(
                              label: const Center(
                                child: Text('SHIP TẬN NƠI', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10)),
                              ),
                              selected: deliveryMethod == 'SHIPPING',
                              selectedColor: const Color(0xFFE53935),
                              disabledColor: Colors.grey.shade100,
                              labelStyle: TextStyle(
                                color: deliveryMethod == 'SHIPPING' ? Colors.white : Colors.black87,
                              ),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              showCheckmark: false,
                              onSelected: (selected) {
                                if (selected) {
                                  setModalState(() {
                                    deliveryMethod = 'SHIPPING';
                                  });
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: recipientController,
                        decoration: InputDecoration(
                          labelText: 'Tên người nhận',
                          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập tên người nhận' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: phoneController,
                        decoration: InputDecoration(
                          labelText: 'Số điện thoại',
                          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                        keyboardType: TextInputType.phone,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Vui lòng nhập số điện thoại';
                          if (!RegExp(r'^\d{9,11}$').hasMatch(v.trim())) return 'Số điện thoại gồm 9-11 chữ số';
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      if (deliveryMethod == 'STORE_PICKUP') ...[
                        const Text(
                          'Chọn chi nhánh cửa hàng',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                        ),
                        const SizedBox(height: 4),
                        isLoadingStores
                            ? const Center(child: Padding(padding: EdgeInsets.all(8.0), child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFE53935))))
                            : stores.isEmpty
                                ? const Text('Không tìm thấy chi nhánh nào', style: TextStyle(color: Colors.red, fontSize: 12))
                                : Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: Colors.grey.shade400),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<String>(
                                        value: selectedStoreName,
                                        isExpanded: true,
                                        items: stores.map((s) {
                                          return DropdownMenuItem<String>(
                                            value: s['name']?.toString() ?? '',
                                            child: Text(
                                              '${s['name']} - ${s['address']}',
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          );
                                        }).toList(),
                                        onChanged: (val) {
                                          setModalState(() {
                                            selectedStoreName = val;
                                          });
                                        },
                                      ),
                                    ),
                                  ),
                      ] else ...[
                        TextFormField(
                          controller: addressController,
                          decoration: InputDecoration(
                            labelText: 'Địa chỉ nhận hàng',
                            labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          ),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập địa chỉ nhận hàng' : null,
                        ),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Text(
                            'Số lượng nhận:',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey.shade400),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: DropdownButton<int>(
                              value: selectedQty,
                              items: List.generate(maxQuantity, (index) => index + 1).map((qty) {
                                return DropdownMenuItem<int>(
                                  value: qty,
                                  child: Text('$qty thẻ', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                );
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) {
                                  setModalState(() {
                                    selectedQty = val;
                                  });
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: noteController,
                        decoration: InputDecoration(
                          labelText: 'Ghi chú (Tùy chọn)',
                          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                if (!formKey.currentState!.validate()) return;
                                if (deliveryMethod == 'STORE_PICKUP' && selectedStoreName == null) {
                                  ScaffoldMessenger.of(ctx).showSnackBar(
                                    const SnackBar(content: Text('Vui lòng chọn chi nhánh cửa hàng!')),
                                  );
                                  return;
                                }
                                
                                setModalState(() => isSubmitting = true);
                                try {
                                  final Map<String, dynamic> redeemData = {
                                    'recipientName': recipientController.text.trim(),
                                    'phone': phoneController.text.trim(),
                                    'deliveryMethod': deliveryMethod,
                                    'shippingAddress': deliveryMethod == 'SHIPPING' ? addressController.text.trim() : '',
                                    'storeName': deliveryMethod == 'STORE_PICKUP' ? selectedStoreName : '',
                                    'note': noteController.text.trim(),
                                    'productIds': [card.id],
                                    'quantities': [selectedQty],
                                  };
                                  
                                  await ApiService.redeemGacha(redeemData);

                                  final userId = auth.user?.id;
                                  if (userId != null) {
                                    List<int> ids = await CollectionStore.getOwnedCardIds(userId);
                                    int removed = 0;
                                    ids.removeWhere((id) {
                                      if (id == card.id && removed < selectedQty) {
                                        removed++;
                                        return true;
                                      }
                                      return false;
                                    });
                                    await CollectionStore.setOwnedCardIds(userId, ids);
                                  }
                                  
                                  if (mounted) {
                                    _loadCollection();
                                  }
                                  
                                  Navigator.pop(ctx);
                                  
                                  _showSuccessDialog('Đăng ký nhận thẻ thành công!', 'PokeCard Store đã tiếp nhận yêu cầu và đang xử lý.');
                                } catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  _showErrorDialog('Lỗi đổi thẻ', e.toString());
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE53935),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text(
                                'XÁC NHẬN NHẬN THẺ',
                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5),
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showSuccessDialog(String title, String message) {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFA7F3D0), width: 2),
                ),
                child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 40),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: Color(0xFF475569), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('ĐỒNG Ý', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.8)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showErrorDialog(String title, String message) {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFFCA5A5), width: 2),
                ),
                child: const Icon(Icons.error_rounded, color: Color(0xFFEF4444), size: 40),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: Color(0xFF475569), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('ĐỒNG Ý', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.8)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
