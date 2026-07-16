import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/widgets/retry_network_image.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/order.dart';

class OrderDetailScreen extends StatefulWidget {
  final int orderId;
  final bool isAdmin;

  const OrderDetailScreen({
    Key? key,
    required this.orderId,
    required this.isAdmin,
  }) : super(key: key);

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  bool _loading = true;
  bool _saving = false;
  String? _error;

  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _addressController = TextEditingController();
    _loadOrder();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  bool get _canEdit {
    if (widget.isAdmin || _order == null) return false;
    final status = _order!.status;
    return status == 'PENDING' || status == 'PROCESSING';
  }

  Future<void> _loadOrder() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final order = await ApiService.getOrderById(widget.orderId);
      setState(() {
        _order = order;
        _nameController.text = order.recipientName ?? '';
        _phoneController.text = order.phone ?? '';
        _addressController.text = order.shippingAddress ?? '';
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final updated = await ApiService.updateOrderShipping(
        widget.orderId,
        recipientName: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        shippingAddress: _addressController.text.trim(),
      );
      setState(() {
        _order = updated;
        _saving = false;
      });
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Thành công'),
          content: const Text('Đã cập nhật thông tin giao nhận. Quản trị viên đã nhận được thông báo.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      setState(() => _saving = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e')),
      );
    }
  }

  String _paymentLabel(String method) {
    switch (method.toUpperCase()) {
      case 'COD':
        return 'Tiền mặt khi nhận hàng (COD)';
      case 'VNPAY':
        return 'Ví VNPay / QR';
      case 'BALANCE':
        return 'Số dư tài khoản trong app';
      default:
        return method;
    }
  }

  String _deliveryLabel(String type) {
    switch (type.toUpperCase()) {
      case 'PHYSICAL_SHIPPING':
        return 'Giao hàng vật lý (ship về địa chỉ)';
      case 'ONLINE_COLLECTION':
        return 'Lưu giữ online (giữ tại cửa hàng)';
      default:
        return type;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'PROCESSING':
        return Colors.blue;
      case 'SHIPPED':
        return Colors.teal;
      case 'COMPLETED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildStatusChip(String status) {
    final label = status.toLowerCase() == 'pending'
        ? 'Chờ xử lý'
        : status.toLowerCase() == 'processing'
            ? 'Đang xử lý'
            : status.toLowerCase() == 'shipped'
                ? 'Đang giao'
                : status.toLowerCase() == 'completed'
                    ? 'Hoàn thành'
                    : status.toLowerCase() == 'cancelled'
                        ? 'Đã hủy'
                        : status;
    return Chip(
      label: Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
      backgroundColor: _statusColor(status),
      padding: const EdgeInsets.symmetric(horizontal: 8),
    );
  }

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    required String? Function(String?) validator,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        controller: controller,
        readOnly: !_canEdit,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          filled: true,
          fillColor: _canEdit ? Colors.white : Colors.grey[100],
        ),
        validator: validator,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final isAdmin = widget.isAdmin || auth.user?.role == 'ADMIN';

    return Scaffold(
      appBar: AppBar(
        title: Text('Chi tiết đơn hàng #${widget.orderId}'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _loadOrder,
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : _order == null
                  ? const Center(child: Text('Không tìm thấy đơn hàng'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Đơn hàng #${_order!.id}',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              _buildStatusChip(_order!.status),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Ngày đặt: ${_order!.createdAt.length >= 10 ? _order!.createdAt.substring(0, 10) : _order!.createdAt}',
                            style: const TextStyle(color: Colors.grey),
                          ),
                          if (_order!.paymentMethod != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                'Phương thức thanh toán: ${_paymentLabel(_order!.paymentMethod!)}',
                                style: const TextStyle(color: Colors.grey),
                              ),
                            ),
                          if (_order!.deliveryType != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                'Hình thức giao nhận: ${_deliveryLabel(_order!.deliveryType!)}',
                                style: const TextStyle(color: Colors.grey),
                              ),
                            ),
                          const Divider(height: 24),
                          const Text(
                            'Sản phẩm',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          ...(_order!.orderItems).map((item) {
                            final imgUrl = ApiService.resolveImageUrl(item.product.imageUrl);
                            return Card(
                              margin: const EdgeInsets.symmetric(vertical: 6),
                              child: ListTile(
                                leading: SizedBox(
                                  width: 48,
                                  height: 48,
                                  child: RetryNetworkImage(url: imgUrl,
                                      width: 48, height: 48, fit: BoxFit.cover),
                                ),
                                title: Text(item.product.name),
                                subtitle: Text(
                                  'Số lượng: ${item.quantity}  x  ${item.price.toStringAsFixed(0)} ₫',
                                ),
                                trailing: Text(
                                  '${(item.price * item.quantity).toStringAsFixed(0)} ₫',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            );
                          }).toList(),
                          const Divider(height: 24),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Text(
                              'Tổng cộng: ${_order!.totalAmount.toStringAsFixed(0)} ₫',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.red,
                              ),
                            ),
                          ),
                          const Divider(height: 24),
                          Text(
                            isAdmin
                                ? 'Thông tin giao nhận (chỉ xem)'
                                : (_canEdit
                                    ? 'Thông tin giao nhận (có thể sửa)'
                                    : 'Thông tin giao nhận (đã giao, không thể sửa)'),
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Form(
                            key: _formKey,
                            child: Column(
                              children: [
                                _buildField(
                                  label: 'Họ tên người nhận',
                                  controller: _nameController,
                                  validator: (v) {
                                    if (v == null || v.trim().isEmpty) {
                                      return 'Vui lòng nhập họ tên người nhận';
                                    }
                                    return null;
                                  },
                                ),
                                _buildField(
                                  label: 'Số điện thoại',
                                  controller: _phoneController,
                                  validator: (v) {
                                    final value = v?.trim() ?? '';
                                    if (value.isEmpty) {
                                      return 'Vui lòng nhập số điện thoại';
                                    }
                                    if (!RegExp(r'^\d{9,11}$').hasMatch(value)) {
                                      return 'Số điện thoại không hợp lệ (9-11 chữ số)';
                                    }
                                    return null;
                                  },
                                ),
                                _buildField(
                                  label: 'Địa chỉ nhận hàng',
                                  controller: _addressController,
                                  maxLines: 2,
                                  validator: (v) {
                                    if (v == null || v.trim().isEmpty) {
                                      return 'Vui lòng nhập địa chỉ nhận hàng';
                                    }
                                    return null;
                                  },
                                ),
                                if (_order!.note != null && _order!.note!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text('Ghi chú: ${_order!.note}'),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          if (_canEdit)
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _saving ? null : _save,
                                child: _saving
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(strokeWidth: 2),
                                      )
                                    : const Text('Cập nhật thông tin giao nhận'),
                              ),
                            ),
                          if (isAdmin)
                            const Padding(
                              padding: EdgeInsets.only(top: 8),
                              child: Text(
                                'Quản trị viên chỉ được xem, không được chỉnh sửa đơn hàng.',
                                style: TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                            ),
                        ],
                      ),
                    ),
    );
  }
}
