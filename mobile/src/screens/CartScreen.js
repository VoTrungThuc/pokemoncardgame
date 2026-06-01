import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const showPopup = (type, title, message, onConfirm = null, confirmText = 'Đồng ý', cancelText = 'Hủy') => {
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
    });
  };

  const hidePopup = () => {
    setPopupConfig(prev => ({ ...prev, visible: false }));
  };

  const fetchCart = async (showSpinner = false) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const data = await api.getCart(); 
      
      
      const totalAmount = (data || []).reduce((sum, item) => {
        const price = (item.product?.promoPrice && item.product.promoPrice < item.product.price)
          ? item.product.promoPrice
          : item.product?.price || 0;
        return sum + (price * item.quantity);
      }, 0);

      setCart({
        items: data || [],
        totalAmount: totalAmount
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchCart(!cart);
    }
  }, [isFocused]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCart(false);
  };

  const handleUpdateQty = async (itemId, currentQty, stock, increment) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;
    if (increment && newQty > stock) {
      showPopup('warning', 'Hết hàng', 'Không thể thêm quá số lượng tồn kho.');
      return;
    }

    try {
      await api.updateCartItemQty(itemId, newQty);
      fetchCart();
    } catch (e) {
      console.error(e);
      showPopup('error', 'Thất bại', 'Không thể cập nhật số lượng.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    showPopup(
      'confirm',
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      async () => {
        try {
          await api.deleteCartItem(itemId);
          fetchCart();
        } catch (e) {
          console.error(e);
          showPopup('error', 'Thất bại', 'Không thể xóa sản phẩm.');
        }
      },
      'Xóa',
      'Hủy'
    );
  };

  const handleClearCart = () => {
    showPopup(
      'confirm',
      'Xác nhận làm trống',
      'Bạn có chắc chắn muốn làm trống giỏ hàng?',
      async () => {
        try {
          await api.clearCart();
          fetchCart();
        } catch (e) {
          console.error(e);
          showPopup('error', 'Thất bại', 'Không thể làm trống giỏ hàng.');
        }
      },
      'Làm trống',
      'Hủy'
    );
  };

  const renderCartItem = ({ item }) => {
    const imageUrl = api.resolveImageUrl(item.product?.imageUrl);

    const activePrice = (item.product?.promoPrice && item.product.promoPrice < item.product.price)
      ? item.product.promoPrice
      : item.product?.price || 0;

    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="contain" />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemBrand}>{item.product?.brand || 'Pokemon'}</Text>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.product?.name}</Text>
          
          <View style={styles.bottomRow}>
            <Text style={styles.itemPrice}>${activePrice.toFixed(2)}</Text>
            
            <View style={styles.qtyContainer}>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => handleUpdateQty(item.id, item.quantity, item.product?.stock, false)}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => handleUpdateQty(item.id, item.quantity, item.product?.stock, true)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteItem(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loaderText}>Đang mở giỏ hàng...</Text>
      </View>
    );
  }

  const items = cart?.items || [];

  return (
    <View style={styles.container}>
      {}
      {items.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sản phẩm ({items.length})</Text>
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
      )}

      {}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={items.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#e53935']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={48} color="#e53935" />
            </View>
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
            <Text style={styles.emptySubtitle}>Khám phá các sản phẩm PokeCard cực hot ngay!</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
              <Text style={styles.shopBtnText}>MUA SẮM NGAY</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {}
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalValue}>${(cart?.totalAmount || 0).toFixed(2)}</Text>
          </View>

          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout', { cart })}
          >
            <Text style={styles.checkoutBtnText}>MUA HÀNG NGAY</Text>
          </TouchableOpacity>
        </View>
      )}
      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loaderText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '750',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '750',
    color: '#dc2626',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  itemImage: {
    width: 70,
    height: 70,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 8,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
    paddingRight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#e53935',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    width: 24,
    textAlign: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: '#e53935',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#e53935',
  },
  checkoutBtn: {
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
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
