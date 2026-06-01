import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import CustomPopup from '../components/CustomPopup';

const STATUS_COLORS = {
  PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fef3c7', label: 'Chờ duyệt' },
  PROCESSING: { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe', label: 'Đang xử lý' },
  SHIPPED: { bg: '#eef2ff', text: '#4f46e5', border: '#e0e7ff', label: 'Đang giao' },
  COMPLETED: { bg: '#ecfdf5', text: '#059669', border: '#d1fae5', label: 'Hoàn thành' },
  CANCELLED: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb', label: 'Đã huỷ' },
};

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const isFocused = useIsFocused();

  
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

  const fetchOrders = async () => {
    try {
      if (isFocused) {
        setLoading(true);
      }
      
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setIsAdmin(user.role === 'ADMIN');
      }

      const data = await api.getOrders();
      
      const sorted = (data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.warn(err);
      showPopup('error', 'Lỗi', 'Cập nhật trạng thái đơn hàng thất bại: ' + (err.response?.data?.message || 'Có lỗi xảy ra.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmUpdateStatus = (orderId, newStatus, statusLabel) => {
    showPopup(
      'confirm',
      'Xác nhận duyệt đơn',
      `Bạn có chắc muốn chuyển đơn hàng này sang trạng thái "${statusLabel}"?`,
      () => handleUpdateStatus(orderId, newStatus),
      'Đồng ý',
      'Hủy'
    );
  };

  const handleUserCancelOrder = async (orderId) => {
    try {
      setUpdatingId(orderId);
      await api.cancelOrder(orderId);
      showPopup(
        'success',
        'Thành công',
        'Hủy đơn hàng thành công.',
        () => navigation.navigate('Main', { screen: 'HomeTab' }),
        'Đồng ý'
      );
    } catch (err) {
      console.warn(err);
      showPopup('error', 'Lỗi', 'Hủy đơn hàng thất bại: ' + (err.response?.data?.message || 'Có lỗi xảy ra.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmUserCancelOrder = (orderId) => {
    showPopup(
      'confirm',
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được hoàn lại vào kho.',
      () => handleUserCancelOrder(orderId),
      'Xác nhận hủy',
      'Quay lại'
    );
  };

  const handleRepayVNPay = async (order) => {
    try {
      setUpdatingId(order.id);
      const paymentUrl = await api.createPaymentUrl(order.id);
      setUpdatingId(null);
      await WebBrowser.openBrowserAsync(paymentUrl);
      fetchOrders();
    } catch (err) {
      setUpdatingId(null);
      console.warn(err);
      showPopup('error', 'Lỗi', 'Không thể khởi tạo cổng thanh toán VNPay: ' + (err.response?.data?.message || 'Có lỗi xảy ra.'));
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item }) => {
    const status = STATUS_COLORS[item.status] || STATUS_COLORS.PENDING;
    const itemsCount = item.items ? item.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
    
    return (
      <View style={styles.orderCard}>
        {}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
            <Text style={styles.orderDate}>
              {item.createdAt ? item.createdAt.replace('T', ' ').substring(0, 16) : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        {}
        <View style={styles.shippingBox}>
          <View style={styles.shippingRow}>
            <Ionicons name="person-outline" size={12} color="#6b7280" style={{ marginRight: 6 }} />
            <Text style={styles.shippingText}>Người nhận: <Text style={styles.shippingVal}>{item.recipientName}</Text></Text>
          </View>
          <View style={styles.shippingRow}>
            <Ionicons name="call-outline" size={12} color="#6b7280" style={{ marginRight: 6 }} />
            <Text style={styles.shippingText}>SĐT: <Text style={styles.shippingVal}>{item.phone}</Text></Text>
          </View>
          <View style={styles.shippingRow}>
            <Ionicons name="location-outline" size={12} color="#6b7280" style={{ marginRight: 6 }} />
            <Text style={styles.shippingText} numberOfLines={1}>Địa chỉ: <Text style={styles.shippingVal}>{item.shippingAddress}</Text></Text>
          </View>
        </View>

        {}
        <View style={styles.itemsSummary}>
          {item.items?.map((orderItem) => (
            <View key={orderItem.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>{orderItem.product?.name}</Text>
              <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
            </View>
          ))}
        </View>

        {}
        <View style={styles.cardFooter}>
          <Text style={styles.summaryQty}>Tổng {itemsCount} sản phẩm</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Thành tiền:</Text>
            <Text style={styles.totalValue}>${item.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {}
        {isAdmin && (
          <View style={styles.adminActionContainer}>
            {item.status === 'PENDING' && (
              <View style={styles.actionButtonRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.btnCancel]}
                  onPress={() => confirmUpdateStatus(item.id, 'CANCELLED', 'Đã hủy')}
                  disabled={updatingId === item.id}
                >
                  <Text style={styles.btnTextCancel}>Hủy đơn</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.btnAccept]}
                  onPress={() => confirmUpdateStatus(item.id, 'PROCESSING', 'Đang xử lý')}
                  disabled={updatingId === item.id}
                >
                  <Text style={styles.btnTextAccept}>Duyệt đơn</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === 'PROCESSING' && (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnShip]}
                onPress={() => confirmUpdateStatus(item.id, 'SHIPPED', 'Đang giao')}
                disabled={updatingId === item.id}
              >
                <Ionicons name="bus-outline" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.btnTextWhite}>Bàn giao vận chuyển</Text>
              </TouchableOpacity>
            )}
            {item.status === 'SHIPPED' && (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnComplete]}
                onPress={() => confirmUpdateStatus(item.id, 'COMPLETED', 'Hoàn thành')}
                disabled={updatingId === item.id}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.btnTextWhite}>Hoàn thành giao hàng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {}
        {!isAdmin && item.status === 'PENDING' && (
          <View style={styles.adminActionContainer}>
            <View style={styles.actionButtonRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnCancel, { width: item.paymentMethod === 'VNPAY' ? '38%' : '100%' }]}
                onPress={() => confirmUserCancelOrder(item.id)}
                disabled={updatingId === item.id}
              >
                <Text style={styles.btnTextCancel}>Hủy đơn</Text>
              </TouchableOpacity>
              {item.paymentMethod === 'VNPAY' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.btnAccept, { width: '58%', backgroundColor: '#e53935' }]}
                  onPress={() => handleRepayVNPay(item)}
                  disabled={updatingId === item.id}
                >
                  <Text style={[styles.btnTextAccept, { color: '#ffffff' }]}>Thanh toán VNPay</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loaderText}>
          {isAdmin ? 'Đang tải danh sách đơn hàng...' : 'Đang tải lịch sử mua hàng...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={48} color="#e53935" />
            </View>
            <Text style={styles.emptyText}>
              {isAdmin ? 'Không có đơn đặt hàng nào trong hệ thống' : 'Bạn chưa có đơn đặt hàng nào'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isAdmin 
                ? 'Các đơn hàng của khách hàng sau khi đặt sẽ được hiển thị tại đây để duyệt.' 
                : 'Các đơn hàng của bạn sau khi đặt sẽ được lưu trữ tại đây.'}
            </Text>
          </View>
        }
      />
      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '750',
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  orderDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  shippingBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shippingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  shippingVal: {
    color: '#374151',
    fontWeight: '800',
  },
  itemsSummary: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    flex: 1,
    marginRight: 16,
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9ca3af',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  summaryQty: {
    fontSize: 11,
    fontWeight: '750',
    color: '#9ca3af',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#e53935',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  adminActionContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  btnCancel: {
    width: '38%',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  btnTextCancel: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '800',
  },
  btnAccept: {
    width: '58%',
    backgroundColor: '#4f46e5',
  },
  btnTextAccept: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
  },
  btnShip: {
    width: '100%',
    backgroundColor: '#3b82f6',
  },
  btnComplete: {
    width: '100%',
    backgroundColor: '#10b981',
  },
  btnTextWhite: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
  },
});
