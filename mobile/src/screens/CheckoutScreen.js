import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';
import * as WebBrowser from 'expo-web-browser';
import qrcode from 'qrcode-generator';

export default function CheckoutScreen({ route, navigation }) {
  const { cart } = route.params;

  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [loading, setLoading] = useState(false);

  
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayOrderId, setVnpayOrderId] = useState(null);
  const [vnpayUrl, setVnpayUrl] = useState(null);
  const [vnpayTotalAmount, setVnpayTotalAmount] = useState(0);

  const [popupConfig, setPopupConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
  });

  const showPopup = (type, title, message, onConfirm = null, confirmText = 'Đồng ý', cancelText = 'Hủy', onCancel = null) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm: () => {
        setPopupConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      confirmText,
      cancelText,
      onCancel: () => {
        setPopupConfig(prev => ({ ...prev, visible: false }));
        if (onCancel) onCancel();
      }
    });
  };

  const hidePopup = () => {
    setPopupConfig(prev => ({ ...prev, visible: false }));
    if (popupConfig.onCancel) popupConfig.onCancel();
  };

  useEffect(() => {
    
    const loadUserInfo = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setRecipientName(user.username || '');
          setPhone((user.phone || '').replace(/[^0-9]/g, ''));
          setShippingAddress(user.shippingAddress || '');
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadUserInfo();
  }, []);

  const handlePlaceOrder = async () => {
    if (!recipientName.trim() || !phone.trim() || !shippingAddress.trim()) {
      showPopup('error', 'Lỗi', 'Vui lòng điền đầy đủ các thông tin nhận hàng bắt buộc.');
      return;
    }

    
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits !== phone || phone.length < 9 || phone.length > 11) {
      showPopup('error', 'Lỗi', 'Số điện thoại không hợp lệ. Vui lòng chỉ nhập từ 9 đến 11 chữ số.');
      return;
    }

    setLoading(true);

    try {
      const createdOrder = await api.placeOrder({
        recipientName,
        phone,
        shippingAddress,
        paymentMethod,
        note,
      });

      if (paymentMethod === 'VNPAY') {
        const paymentUrl = await api.createPaymentUrl(createdOrder.id);
        setVnpayOrderId(createdOrder.id);
        setVnpayUrl(paymentUrl);
        setVnpayTotalAmount(cart?.totalAmount || 0);
        setLoading(false);
        setShowVNPayModal(true);
      } else {
        showPopup(
          'success',
          'Đặt hàng thành công!',
          'Cảm ơn Trainer đã mua sắm tại PokeCard Store.',
          () => {
            navigation.navigate('Main', { screen: 'HomeTab' });
          },
          'Về trang chủ'
        );
      }
    } catch (err) {
      console.log('Place order error:', err.message || err);
      let errMsg = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán.';
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        const validationErrors = Object.values(err.response.data.data);
        if (validationErrors.length > 0) {
          errMsg = validationErrors[0];
        }
      }
      showPopup('error', 'Thất bại', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowVNPayModal(false);
    showPopup(
      'success',
      'Thanh toán thành công!',
      'VNPay đã xác nhận giao dịch của bạn.',
      () => {
        navigation.navigate('Main', { screen: 'OrdersTab' });
      },
      'Xem đơn hàng'
    );
  };

  const handleCancelAndRestoreCart = async () => {
    try {
      setLoading(true);
      setShowVNPayModal(false);

      
      await api.cancelOrder(vnpayOrderId);

      
      if (cart && cart.items) {
        for (const item of cart.items) {
          await api.addToCart(item.product.id, item.quantity);
        }
      }

      setLoading(false);
      showPopup(
        'success',
        'Thành công',
        'Hủy đơn hàng thành công.',
        () => {
          navigation.navigate('Main', { screen: 'HomeTab' });
        },
        'Đồng ý'
      );
    } catch (err) {
      setLoading(false);
      console.warn('Error restoring cart:', err);
      showPopup('error', 'Lỗi', 'Có lỗi xảy ra khi khôi phục giỏ hàng: ' + (err.response?.data?.message || err.message || err));
    }
  };

  const handleKeepOrder = () => {
    navigation.navigate('Main', { screen: 'OrdersTab' });
  };

  const handleClosePaymentModal = () => {
    setShowVNPayModal(false);
    showPopup(
      'confirm',
      'Hủy thanh toán?',
      'Bạn muốn hủy đơn hàng này để chọn phương thức khác (hệ thống sẽ khôi phục giỏ hàng), hay giữ lại đơn hàng để thanh toán sau?',
      handleCancelAndRestoreCart,
      'Hủy & Khôi phục',
      'Giữ đơn hàng',
      handleKeepOrder
    );
  };

  const renderSummaryItem = (item) => {
    const activePrice = (item.product?.promoPrice && item.product.promoPrice < item.product.price)
      ? item.product.promoPrice
      : item.product?.price || 0;

    return (
      <View key={item.id} style={styles.summaryItem}>
        <Text style={styles.summaryTitle} numberOfLines={1}>
          {item.product?.name} <Text style={styles.qtyText}>x{item.quantity}</Text>
        </Text>
        <Text style={styles.summaryPrice}>${(activePrice * item.quantity).toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="location-sharp" size={18} color="#e53935" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Thông Tin Nhận Hàng</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên người nhận *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên người nhận"
              value={recipientName}
              onChangeText={setRecipientName}
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại liên lạc *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ''))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ giao hàng *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
              multiline
              numberOfLines={2}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú đơn hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="Lưu ý cho shipper (ví dụ: giao giờ hành chính)"
              value={note}
              onChangeText={setNote}
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        </View>

        {}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="card" size={18} color="#e53935" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Phương Thức Thanh Toán</Text>
          </View>
          <View style={styles.paymentContainer}>
            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'COD' && styles.selectedPaymentOption]}
              onPress={() => setPaymentMethod('COD')}
            >
              <Ionicons 
                name="cash-outline" 
                size={18} 
                color={paymentMethod === 'COD' ? '#e53935' : '#64748b'} 
              />
              <Text style={[styles.paymentText, paymentMethod === 'COD' && styles.selectedPaymentText]}>
                COD
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'VNPAY' && styles.selectedPaymentOption]}
              onPress={() => setPaymentMethod('VNPAY')}
            >
              <Ionicons 
                name="card-outline" 
                size={18} 
                color={paymentMethod === 'VNPAY' ? '#e53935' : '#64748b'} 
              />
              <Text style={[styles.paymentText, paymentMethod === 'VNPAY' && styles.selectedPaymentText]}>
                VNPay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="receipt" size={18} color="#e53935" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Tóm Tắt Đơn Hàng</Text>
          </View>
          <View style={styles.summaryCard}>
            {cart?.items?.map(renderSummaryItem)}
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng cần thanh toán:</Text>
              <Text style={styles.totalValue}>${(cart?.totalAmount || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.placeOrderBtn, loading && styles.disabledBtn]} 
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.placeOrderText}>XÁC NHẬN ĐẶT HÀNG</Text>
          )}
        </TouchableOpacity>
      </View>
      <CustomPopup {...popupConfig} onClose={hidePopup} />
      <VNPayQRModal
        visible={showVNPayModal}
        orderId={vnpayOrderId}
        paymentUrl={vnpayUrl}
        totalAmount={vnpayTotalAmount}
        onSuccess={handlePaymentSuccess}
        onClose={handleClosePaymentModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  selectedPaymentOption: {
    borderColor: '#e53935',
    backgroundColor: '#fff5f5',
  },
  paymentEmoji: {
    fontSize: 16,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
  },
  selectedPaymentText: {
    color: '#e53935',
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
    marginRight: 16,
  },
  qtyText: {
    color: '#9ca3af',
    fontWeight: '800',
  },
  summaryPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#e53935',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 10,
  },
  placeOrderBtn: {
    backgroundColor: '#e53935',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

function VNPayQRModal({ visible, orderId, paymentUrl, totalAmount, onSuccess, onClose }) {
  const [pollingStatus, setPollingStatus] = useState('PENDING');

  useEffect(() => {
    if (!visible || !orderId) return;

    setPollingStatus('PENDING');
    const intervalId = setInterval(async () => {
      try {
        const order = await api.getOrderById(orderId);
        if (order && order.status !== 'PENDING') {
          setPollingStatus(order.status);
          if (order.status === 'PROCESSING' || order.status === 'COMPLETED') {
            clearInterval(intervalId);
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else if (order.status === 'CANCELLED') {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.warn('Error polling order status:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [visible, orderId]);

  if (!visible || !paymentUrl) return null;

  const amountVnd = Math.round(totalAmount * 25000);

  
  let qrBase64 = null;
  try {
    const qr = qrcode(0, 'M');
    qr.addData(paymentUrl);
    qr.make();
    qrBase64 = qr.createDataURL(5, 10);
  } catch (err) {
    console.error('[VNPayQRModal] Failed to generate local QR Code:', err);
  }

  const handleOpenVNPay = async () => {
    try {
      await WebBrowser.openBrowserAsync(paymentUrl);
    } catch (err) {
      console.warn('Cannot open VNPay URL:', err);
      
      Linking.openURL(paymentUrl).catch(e => console.warn('Linking error:', e));
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          {}
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>🇻🇳 THANH TOÁN VNPAY</Text>
            <Text style={modalStyles.subtitle}>
              Quét mã QR dưới đây bằng ứng dụng Ngân hàng / Ví VNPay để thanh toán.
            </Text>
          </View>

          {}
          <View style={modalStyles.qrWrapper}>
            {qrBase64 ? (
              <Image
                source={{ uri: qrBase64 }}
                style={modalStyles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <ActivityIndicator size="large" color="#e53935" />
            )}
          </View>

          {}
          <View style={modalStyles.infoBox}>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.infoLabel}>Mã đơn hàng:</Text>
              <Text style={modalStyles.infoValue}>DH{orderId}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.infoLabel}>Số tiền thanh toán:</Text>
              <Text style={[modalStyles.infoValue, { color: '#e53935' }]}>
                {amountVnd.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </View>

          {}
          <View style={modalStyles.statusBox}>
            {pollingStatus === 'PENDING' && (
              <View style={modalStyles.statusRow}>
                <ActivityIndicator size="small" color="#d97706" style={{ marginRight: 8 }} />
                <Text style={[modalStyles.statusText, { color: '#d97706' }]}>
                  Đang chờ quét mã thanh toán...
                </Text>
              </View>
            )}
            {(pollingStatus === 'PROCESSING' || pollingStatus === 'COMPLETED') && (
              <View style={modalStyles.statusRow}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginRight: 6 }} />
                <Text style={[modalStyles.statusText, { color: '#059669' }]}>
                  Thành công! Đang hoàn tất đơn hàng...
                </Text>
              </View>
            )}
            {pollingStatus === 'CANCELLED' && (
              <View style={modalStyles.statusRow}>
                <Ionicons name="close-circle" size={18} color="#e53935" style={{ marginRight: 6 }} />
                <Text style={[modalStyles.statusText, { color: '#e53935' }]}>
                  Giao dịch thất bại hoặc đã bị hủy.
                </Text>
              </View>
            )}
          </View>

          {}
          <Text style={modalStyles.hintText}>
            Nếu bạn đang dùng chính điện thoại này, hãy bấm nút dưới đây để mở trang thanh toán trực tiếp.
          </Text>

          {}
          <View style={modalStyles.btnContainer}>
            <TouchableOpacity style={modalStyles.primaryBtn} onPress={handleOpenVNPay}>
              <Ionicons name="card" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={modalStyles.primaryBtnText}>MỞ TRANG THANH TOÁN VNPAY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={modalStyles.secondaryBtn} onPress={onClose}>
              <Text style={modalStyles.secondaryBtnText}>Hủy / Chọn hình thức khác</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 16,
  },
  qrWrapper: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '900',
  },
  statusBox: {
    width: '100%',
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fef3c7',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  hintText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 16,
    fontWeight: '600',
  },
  btnContainer: {
    width: '105%',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#e53935',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#4b5563',
    fontSize: 11,
    fontWeight: '800',
  },
});
