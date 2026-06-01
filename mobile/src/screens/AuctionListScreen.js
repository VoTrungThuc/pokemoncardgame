import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Dimensions, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

const { width } = Dimensions.get('window');

const DURATION_OPTIONS = [
  { label: '3 phút', seconds: 180 },
  { label: '5 phút', seconds: 300 },
  { label: '10 phút', seconds: 600 },
  { label: '15 phút', seconds: 900 },
  { label: '30 phút', seconds: 1800 },
];


const DEFAULT_AUCTIONS = [
  {
    id: 'auc-charizard-rainbow',
    cardName: 'Charizard VMAX Rainbow Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh35/74.png',
    rarity: 'Secret Rare',
    condition: 'Mint',
    currentBid: 260.00,
    highestBidder: '@gary_oak',
    bidsCount: 14,
    durationSeconds: 180,
  },
  {
    id: 'auc-mewtwo-alt',
    cardName: 'Mewtwo VSTAR Alt Art',
    imageUrl: 'https://images.pokemontcg.io/swsh12pt5gg/GG44.png',
    rarity: 'Secret Rare',
    condition: 'Mint',
    currentBid: 145.00,
    highestBidder: '@misty_water',
    bidsCount: 8,
    durationSeconds: 300,
  },
  {
    id: 'auc-umbreon-alt',
    cardName: 'Umbreon VMAX Alt Art',
    imageUrl: 'https://images.pokemontcg.io/swsh7/215.png',
    rarity: 'Secret Rare',
    condition: 'Mint',
    currentBid: 165.00,
    highestBidder: '@brock_pewter',
    bidsCount: 11,
    durationSeconds: 420,
  },
  {
    id: 'auc-rayquaza-alt',
    cardName: 'Rayquaza VMAX Alt Art',
    imageUrl: 'https://images.pokemontcg.io/swsh7/218.png',
    rarity: 'Secret Rare',
    condition: 'Near Mint',
    currentBid: 130.00,
    highestBidder: '@serena_kalos',
    bidsCount: 5,
    durationSeconds: 600,
  }
];

export default function AuctionListScreen({ navigation }) {
  const [auctions, setAuctions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(1000.00);
  const [loading, setLoading] = useState(true);
  const [timeState, setTimeState] = useState(Date.now());
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const isFocused = useIsFocused();

  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [startingBid, setStartingBid] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1]); 
  const [creating, setCreating] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [popupConfig, setPopupConfig] = useState({
    visible: false, type: 'success', title: '', message: '',
    onConfirm: null, confirmText: 'Đồng ý', cancelText: 'Hủy',
  });

  const showPopup = (type, title, message, onConfirm = null, confirmText = 'Đồng ý', cancelText = 'Hủy') => {
    setPopupConfig({
      visible: true, type, title, message,
      onConfirm: () => {
        setPopupConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      confirmText, cancelText,
    });
  };

  const [refreshing, setRefreshing] = useState(false);

  const hidePopup = () => setPopupConfig(prev => ({ ...prev, visible: false }));

  const loadAuctions = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      
      const userStr = await AsyncStorage.getItem('user');
      let currentUsername = 'guest';
      if (userStr) {
        const userObj = JSON.parse(userStr);
        setIsAdmin(userObj.role === 'ADMIN');
        setCurrentUser(userObj);
        currentUsername = userObj.username || 'guest';
      }

      
      const balanceKey = `wallet_balance_${currentUsername}`;
      const balanceStr = await AsyncStorage.getItem(balanceKey);
      if (balanceStr) {
        setWalletBalance(parseFloat(balanceStr));
      } else {
        const DEMO_USERS = ['ash_ketchum', 'gary_oak', 'admin', 'user_test', 'admin_test', 'user', 'admin_new', 'admin_custom'];
        const initialBalance = DEMO_USERS.includes(currentUsername) ? '1000.00' : '0.00';
        await AsyncStorage.setItem(balanceKey, initialBalance);
        setWalletBalance(parseFloat(initialBalance));
      }

      
      const data = await api.getAuctions();
      setAuctions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isFocused) {
      loadAuctions(true);
      interval = setInterval(() => loadAuctions(false), 5000); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocused]);

  useEffect(() => {
    const interval = setInterval(() => setTimeState(api.getServerTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuctions(false);
    setRefreshing(false);
  };

  
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await api.getProducts({});
      setProducts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setStartingBid('');
    setSelectedDuration(DURATION_OPTIONS[1]);
    setProductSearch('');
    setCreateModalVisible(true);
    loadProducts();
  };

  const handleCreateAuction = async () => {
    if (!selectedProduct) {
      showPopup('error', 'Thiếu thông tin', 'Vui lòng chọn một thẻ bài để tạo phiên đấu giá.');
      return;
    }
    const bidVal = parseFloat(startingBid);
    if (isNaN(bidVal) || bidVal <= 0) {
      showPopup('error', 'Giá không hợp lệ', 'Vui lòng nhập giá khởi điểm hợp lệ (lớn hơn $0).');
      return;
    }

    try {
      setCreating(true);
      const durationMs = selectedDuration.seconds * 1000;
      const endTime = new Date(api.getServerTime() + durationMs).toISOString();

      const newAuctionDto = {
        cardName: selectedProduct.name,
        imageUrl: selectedProduct.imageUrl,
        rarity: selectedProduct.ram || 'Rare',
        condition: selectedProduct.rom || 'Near Mint',
        currentBid: bidVal,
        endTime: endTime
      };

      await api.createAuction(newAuctionDto);
      await loadAuctions();
      setCreateModalVisible(false);

      showPopup('success', '✅ Tạo Đấu Giá Thành Công',
        `Phiên đấu giá thẻ "${selectedProduct.name}" với giá khởi điểm $${bidVal.toFixed(2)} và thời gian ${selectedDuration.label} đã được tạo thành công!`
      );
    } catch (e) {
      console.error(e);
      showPopup('error', 'Lỗi', 'Không thể tạo phiên đấu giá. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    showPopup('confirm', 'Xóa phiên đấu giá', 'Bạn có chắc muốn xóa phiên đấu giá này?', async () => {
      try {
        await api.deleteAuction(auctionId);
        await loadAuctions();
        showPopup('success', 'Đã Xóa', 'Phiên đấu giá đã được xóa thành công.');
      } catch (e) {
        console.error(e);
        showPopup('error', 'Lỗi', 'Không thể xóa phiên đấu giá.');
      }
    });
  };

  const handleResetAuctions = async () => {
    showPopup('confirm', 'Khởi Tạo Lại', 'Đặt lại toàn bộ danh sách đấu giá về mặc định?', async () => {
      try {
        await api.resetAuctions();
        await loadAuctions();
        showPopup('success', 'Thành Công', 'Đã khởi tạo lại danh sách đấu giá!');
      } catch (e) {
        console.error(e);
        showPopup('error', 'Lỗi', 'Không thể đặt lại danh sách đấu giá.');
      }
    });
  };

  const getRemainingTime = (endTimeStr) => {
    const total = Date.parse(endTimeStr) - timeState;
    if (total <= 0) return { seconds: 0, text: 'Hết giờ' };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const pad = (num) => (num < 10 ? '0' + num : num);
    return { seconds: total / 1000, text: `${pad(minutes)}:${pad(seconds)}` };
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const renderAuctionItem = ({ item }) => {
    const timeRemaining = getRemainingTime(item.endTime);
    const isEnded = timeRemaining.seconds <= 0 || item.status === 'ended';
    const isUserWinning = currentUser && item.highestBidder === `@${currentUser.username}`;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AuctionDetail', { auctionId: item.id })}
      >
        <Image
          source={{ uri: api.resolveImageUrl(item.imageUrl) }}
          style={styles.cardImage}
          resizeMode="contain"
        />

        <View style={styles.cardInfo}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.rarityLabel}>{item.rarity}</Text>
              {item.createdByAdmin && (
                <View style={styles.adminCreatedBadge}>
                  <Text style={styles.adminCreatedText}>Admin</Text>
                </View>
              )}
            </View>
            <View style={[
              styles.timeBadge,
              isEnded ? styles.timeEnded : (timeRemaining.seconds < 60 ? styles.timeUrgent : styles.timeActive)
            ]}>
              <Ionicons name="time-outline" size={12} color={isEnded ? '#64748b' : '#ffffff'} style={{ marginRight: 3 }} />
              <Text style={[styles.timeText, { color: isEnded ? '#64748b' : '#ffffff' }]}>
                {timeRemaining.text}
              </Text>
            </View>
          </View>

          <Text style={styles.cardName} numberOfLines={1}>{item.cardName}</Text>
          <Text style={styles.conditionText}>Tình trạng: {item.condition}</Text>

          <View style={styles.bidRow}>
            <View>
              <Text style={styles.bidLabel}>Giá hiện tại</Text>
              <Text style={styles.bidValue}>${item.currentBid.toFixed(2)}</Text>
            </View>
            <View style={styles.bidderBox}>
              <Text style={styles.bidderLabel}>Dẫn đầu</Text>
              <Text style={[
                styles.bidderValue,
                isUserWinning 
                  ? styles.bidderMe 
                  : (item.highestBidder === '-' ? { color: '#94a3b8' } : styles.bidderRival)
              ]}>
                {isUserWinning ? 'Bạn' : item.highestBidder}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.bidsCount}>{item.bidsCount} lượt đặt giá</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {}
              {isAdmin && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteAuction(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                </TouchableOpacity>
              )}
              <LinearGradient
                colors={isEnded ? ['#475569', '#334155'] : (isAdmin ? ['#f97316', '#c2410c'] : ['#e53935', '#b91c1c'])}
                style={styles.actionBtn}
              >
                <Text style={styles.actionBtnText}>
                  {isEnded ? 'XEM KẾT QUẢ' : (isAdmin ? 'THEO DÕI' : 'ĐẤU GIÁ NGAY')}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        {isAdmin ? (
          <View style={styles.adminHeaderBadge}>
            <Ionicons name="construct" size={14} color="#f97316" style={{ marginRight: 6 }} />
            <Text style={styles.adminHeaderText}>QUẢN LÝ PHIÊN ĐẤU GIÁ</Text>
          </View>
        ) : (
          <View style={styles.walletBox}>
            <Ionicons name="wallet" size={18} color="#f59e0b" />
            <Text style={styles.walletLabel}>Số dư Ví ảo:</Text>
            <Text style={styles.walletValue}>${walletBalance.toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetAuctions} activeOpacity={0.8}>
          <Ionicons name="refresh" size={16} color="#94a3b8" />
          <Text style={styles.resetBtnText}>Đặt lại</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#e53935" />
          <Text style={styles.loaderText}>Đang tải phiên đấu giá...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={auctions}
            renderItem={renderAuctionItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={[styles.listContainer, isAdmin && { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="hammer-outline" size={48} color="#475569" />
                <Text style={styles.emptyText}>
                  {isAdmin ? 'Chưa có phiên đấu giá nào. Bấm nút bên dưới để tạo mới!' : 'Hiện không có phiên đấu giá nào đang diễn ra.'}
                </Text>
                {!isAdmin && (
                  <TouchableOpacity style={styles.emptyBtn} onPress={handleResetAuctions}>
                    <Text style={styles.emptyBtnText}>Khởi tạo lại đấu giá</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />

          {}
          {isAdmin && (
            <TouchableOpacity style={styles.fab} onPress={openCreateModal} activeOpacity={0.85}>
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                style={styles.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={24} color="#ffffff" />
                <Text style={styles.fabText}>TẠO ĐẤU GIÁ</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}

      {}
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            {}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>TẠO PHIÊN ĐẤU GIÁ MỚI</Text>
                <Text style={styles.modalSubtitle}>Admin — Quản lý đấu giá thẻ bài</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {}
              <Text style={styles.formSectionLabel}>BƯỚC 1 — CHỌN THẺ BÀI ĐẤU GIÁ</Text>

              {selectedProduct && (
                <View style={styles.selectedProductCard}>
                  <Image
                    source={{ uri: api.resolveImageUrl(selectedProduct.imageUrl) }}
                    style={styles.selectedProductImg}
                    resizeMode="contain"
                  />
                  <View style={styles.selectedProductInfo}>
                    <Text style={styles.selectedProductName} numberOfLines={1}>{selectedProduct.name}</Text>
                    <Text style={styles.selectedProductMeta}>{selectedProduct.ram || 'Rare'} • {selectedProduct.rom || 'Near Mint'}</Text>
                    <Text style={styles.selectedProductPrice}>Giá thị trường: ${selectedProduct.price?.toFixed(2) || 'N/A'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}

              {!selectedProduct && (
                <>
                  <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={16} color="#64748b" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Tìm tên thẻ bài..."
                      placeholderTextColor="#64748b"
                      value={productSearch}
                      onChangeText={setProductSearch}
                    />
                  </View>

                  {productsLoading ? (
                    <ActivityIndicator color="#f97316" style={{ marginVertical: 20 }} />
                  ) : (
                    <ScrollView style={styles.productList} nestedScrollEnabled={true}>
                      {filteredProducts.slice(0, 20).map(p => (
                        <TouchableOpacity
                          key={p.id}
                          style={styles.productRow}
                          onPress={() => setSelectedProduct(p)}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{ uri: api.resolveImageUrl(p.imageUrl) }}
                            style={styles.productRowImg}
                            resizeMode="contain"
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.productRowName} numberOfLines={1}>{p.name}</Text>
                            <Text style={styles.productRowMeta}>{p.ram || 'Rare'} • Kho: {p.stock}</Text>
                          </View>
                          <Text style={styles.productRowPrice}>${p.price?.toFixed(0)}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}

              {}
              <Text style={[styles.formSectionLabel, { marginTop: 20 }]}>BƯỚC 2 — GIÁ KHỞI ĐIỂM ĐẤU GIÁ</Text>
              <View style={styles.bidInputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.bidInput}
                  value={startingBid}
                  onChangeText={setStartingBid}
                  keyboardType="numeric"
                  placeholder="Nhập giá khởi điểm..."
                  placeholderTextColor="#64748b"
                />
              </View>

              {}
              <Text style={[styles.formSectionLabel, { marginTop: 20 }]}>BƯỚC 3 — THỜI GIAN PHIÊN ĐẤU GIÁ</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.seconds}
                    style={[
                      styles.durationBtn,
                      selectedDuration.seconds === opt.seconds && styles.durationBtnActive
                    ]}
                    onPress={() => setSelectedDuration(opt)}
                  >
                    <Text style={[
                      styles.durationBtnText,
                      selectedDuration.seconds === opt.seconds && styles.durationBtnTextActive
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {}
            <TouchableOpacity
              style={[styles.createBtn, creating && { opacity: 0.6 }]}
              onPress={handleCreateAuction}
              disabled={creating}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#f97316', '#ea580c']} style={styles.createBtnGradient}>
                {creating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="hammer" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.createBtnText}>TẠO PHIÊN ĐẤU GIÁ</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderColor: '#1e293b', backgroundColor: '#1e293b',
  },
  adminHeaderBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.15)', borderWidth: 1, borderColor: '#f97316',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
  },
  adminHeaderText: { fontSize: 11, color: '#f97316', fontWeight: '900', letterSpacing: 0.3 },
  walletBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
  },
  walletLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginLeft: 6 },
  walletValue: { fontSize: 13, color: '#fbbf24', fontWeight: '900', marginLeft: 6 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
  },
  resetBtnText: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginLeft: 4 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { fontSize: 12, color: '#94a3b8', fontWeight: '800', marginTop: 16 },
  listContainer: { padding: 20, paddingBottom: 40 },
  card: {
    flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 24,
    borderWidth: 1, borderColor: '#334155', padding: 16, marginBottom: 16,
    elevation: 3, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  cardImage: { width: 90, height: 126, borderRadius: 10, backgroundColor: '#0f172a' },
  cardInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rarityLabel: { fontSize: 9, fontWeight: '900', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 0.5 },
  adminCreatedBadge: { backgroundColor: 'rgba(249,115,22,0.2)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  adminCreatedText: { fontSize: 8, color: '#f97316', fontWeight: '900' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeActive: { backgroundColor: '#2563eb' },
  timeUrgent: { backgroundColor: '#ef4444' },
  timeEnded: { backgroundColor: '#334155' },
  timeText: { fontSize: 10, fontWeight: '900' },
  cardName: { fontSize: 14, fontWeight: '900', color: '#ffffff', marginTop: 6 },
  conditionText: { fontSize: 10, color: '#94a3b8', fontWeight: '700', marginTop: 2 },
  bidRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 8, marginTop: 8,
  },
  bidLabel: { fontSize: 8, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
  bidValue: { fontSize: 12, fontWeight: '900', color: '#fbbf24', marginTop: 2 },
  bidderBox: { alignItems: 'flex-end' },
  bidderLabel: { fontSize: 8, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
  bidderValue: { fontSize: 11, fontWeight: '900', marginTop: 2 },
  bidderMe: { color: '#22c55e' },
  bidderRival: { color: '#f43f5e' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  bidsCount: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  deleteBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    padding: 8, borderRadius: 10,
  },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 9, color: '#ffffff', fontWeight: '900', letterSpacing: 0.5 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 12, color: '#94a3b8', fontWeight: '750', textAlign: 'center', marginVertical: 16, paddingHorizontal: 40 },
  emptyBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  
  fab: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    borderRadius: 20, elevation: 8,
    shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 20 },
  fabText: { fontSize: 14, color: '#ffffff', fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, borderWidth: 1, borderColor: '#334155', maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155', marginBottom: 16,
  },
  modalTitle: { fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  modalSubtitle: { fontSize: 10, color: '#f97316', fontWeight: '700', marginTop: 2 },
  modalScroll: { paddingBottom: 16 },
  formSectionLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 0.5, marginBottom: 12 },
  selectedProductCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249,115,22,0.08)',
    borderWidth: 1, borderColor: '#f97316', borderRadius: 16, padding: 12, marginBottom: 8,
  },
  selectedProductImg: { width: 48, height: 68, borderRadius: 8 },
  selectedProductInfo: { flex: 1, marginHorizontal: 12 },
  selectedProductName: { fontSize: 12, fontWeight: '900', color: '#ffffff' },
  selectedProductMeta: { fontSize: 10, color: '#94a3b8', fontWeight: '700', marginTop: 2 },
  selectedProductPrice: { fontSize: 10, color: '#22c55e', fontWeight: '900', marginTop: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 13, fontWeight: '700' },
  productList: { maxHeight: 220, overflow: 'hidden' },
  productRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 10, marginBottom: 6,
  },
  productRowImg: { width: 36, height: 50, borderRadius: 6, marginRight: 10 },
  productRowName: { fontSize: 12, fontWeight: '800', color: '#ffffff' },
  productRowMeta: { fontSize: 9, color: '#94a3b8', fontWeight: '700', marginTop: 2 },
  productRowPrice: { fontSize: 12, fontWeight: '900', color: '#fbbf24', marginLeft: 8 },
  bidInputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingLeft: 16,
  },
  dollarSign: { fontSize: 16, color: '#94a3b8', fontWeight: '900' },
  bidInput: { flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '900', paddingVertical: 14, paddingLeft: 4 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155',
  },
  durationBtnActive: { backgroundColor: 'rgba(249,115,22,0.15)', borderColor: '#f97316' },
  durationBtnText: { fontSize: 12, fontWeight: '800', color: '#94a3b8' },
  durationBtnTextActive: { color: '#f97316' },
  createBtn: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  createBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  createBtnText: { fontSize: 13, color: '#ffffff', fontWeight: '900', letterSpacing: 0.5 },
});
