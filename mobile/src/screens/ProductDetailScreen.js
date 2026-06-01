import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

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

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getProductById(productId);
      setProduct(data);
    } catch (e) {
      console.error(e);
      showPopup('error', 'Lỗi', 'Không thể tải thông tin chi tiết sản phẩm.', () => {
        navigation.goBack();
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQty = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    try {
      setAdding(true);
      await api.addToCart(product.id, quantity);
      showPopup(
        'confirm',
        'Thành công',
        `Đã thêm ${quantity} sản phẩm vào Giỏ hàng!`,
        () => navigation.navigate('Main', { screen: 'CartTab' }),
        'Xem Giỏ hàng',
        'Tiếp tục mua sắm'
      );
    } catch (err) {
      console.error(err);
      showPopup('error', 'Thêm giỏ hàng thất bại', err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loaderText}>Đang tải chi tiết thẻ bài...</Text>
      </View>
    );
  }

  if (!product) return null;

  const imageUrl = api.resolveImageUrl(product.imageUrl);

  const isPromo = product.promoPrice && product.promoPrice < product.price;
  const isCard = product.cpu && product.cpu !== 'sealed' && product.cpu !== 'plush' && product.cpu !== 'figure' && product.cpu !== 'accessory';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.imageBackground}>
          <Image 
            source={{ uri: imageUrl || 'https://images.pokemontcg.io/swsh35/20.png' }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {}
        <View style={styles.detailsCard}>
          <Text style={styles.brand}>{product.brand || 'POKEMON'}</Text>
          <Text style={styles.title}>{product.name}</Text>

          {}
          <View style={styles.pricingRow}>
            {isPromo ? (
              <View>
                <Text style={styles.promoPrice}>${product.promoPrice.toFixed(2)}</Text>
                <Text style={styles.originalPrice}>Giá gốc: ${product.price.toFixed(2)}</Text>
              </View>
            ) : (
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            )}

            <View style={[styles.stockBadge, product.stock > 0 ? styles.inStock : styles.outOfStock]}>
              <Text style={product.stock > 0 ? styles.inStockText : styles.outOfStockText}>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </Text>
            </View>
          </View>

          {}
          <Text style={styles.descriptionHeader}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description}</Text>

          {}
          <Text style={styles.specificationsHeader}>Thông Số Kỹ Thuật</Text>
          <View style={styles.specsGrid}>
            {isCard ? (
              <>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Loại thẻ bài</Text>
                  <Text style={styles.specValue}>{product.cpu || 'N/A'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>HP</Text>
                  <Text style={styles.specValue}>{product.camera || 'N/A'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Mã số thẻ</Text>
                  <Text style={styles.specValue}>{product.battery || 'N/A'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Độ hiếm</Text>
                  <Text style={styles.specValue}>{product.ram || 'N/A'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Tình trạng</Text>
                  <Text style={styles.specValue}>{product.rom || 'N/A'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Set</Text>
                  <Text style={styles.specValue} numberOfLines={1}>{product.screen || 'N/A'}</Text>
                </View>
                <View style={styles.specBoxFull}>
                  <Text style={styles.specLabel}>Hoạ sĩ thiết kế (Artist)</Text>
                  <Text style={styles.specValue}>{product.os || 'N/A'}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Phân loại</Text>
                  <Text style={styles.specValue}>{product.cpu || 'Vật phẩm lưu niệm'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Tình trạng</Text>
                  <Text style={styles.specValue}>{product.rom || 'Mới 100%'}</Text>
                </View>
                <View style={styles.specBoxFull}>
                  <Text style={styles.specLabel}>Nhà sản xuất / Thiết kế</Text>
                  <Text style={styles.specValue}>{product.os || 'Nintendo'}</Text>
                </View>
              </>
            )}
          </View>

          {}
          {isCard && product.stock > 0 && (
            <TouchableOpacity 
              style={styles.tradeProposeBtn}
              onPress={() => navigation.navigate('TradePropose', { card: product })}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={18} color="#e53935" style={{ marginRight: 8 }} />
              <Text style={styles.tradeProposeBtnText}>ĐỀ XUẤT TRAO ĐỔI THẺ</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {}
      {product.stock > 0 ? (
        <View style={styles.bottomBar}>
          <View style={styles.qtyContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleDecreaseQty}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleIncreaseQty}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.addToCartWrapper} 
            onPress={handleAddToCart}
            disabled={adding}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.addToCartBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {adding ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.addToCartText}>THÊM VÀO GIỎ HÀNG</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomBarDisabled}>
          <Text style={styles.bottomBarDisabledText}>SẢN PHẨM HIỆN ĐÃ HẾT HÀNG</Text>
        </View>
      )}
      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loaderText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '800',
    marginTop: 12,
  },
  imageBackground: {
    backgroundColor: '#f8fafc',
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  image: {
    width: '100%',
    height: '90%',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -30,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  brand: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 6,
    lineHeight: 28,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  promoPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ef4444',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    fontWeight: '700',
    marginTop: 2,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  inStock: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bcf0da',
  },
  outOfStock: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  inStockText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '800',
  },
  outOfStockText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
  },
  descriptionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 8,
  },
  specificationsHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  specBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  specBoxFull: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  specLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '850',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 8,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
    width: 36,
    textAlign: 'center',
  },
  addToCartWrapper: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  addToCartBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  bottomBarDisabled: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarDisabledText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tradeProposeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    borderWidth: 1.5,
    borderColor: '#fee2e2',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 20,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  tradeProposeBtnText: {
    color: '#e53935',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
