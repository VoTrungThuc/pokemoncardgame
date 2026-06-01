import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 52) / 2;
const GRID_CARD_HEIGHT = GRID_CARD_WIDTH * 1.4;

export default function MyCollectionScreen({ navigation }) {
  const [collection, setCollection] = useState([]);
  const [walletBalance, setWalletBalance] = useState(1000.00);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [username, setUsername] = useState('guest');
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

  const loadCollection = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      
      const userStr = await AsyncStorage.getItem('user');
      let currentUsername = 'guest';
      if (userStr) {
        const userObj = JSON.parse(userStr);
        currentUsername = userObj.username || 'guest';
        setUsername(currentUsername);
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

      
      const collectionStr = await AsyncStorage.getItem('my_collection');
      if (collectionStr) {
        const cards = JSON.parse(collectionStr);
        
        cards.sort((a, b) => new Date(b.acquiredDate || 0) - new Date(a.acquiredDate || 0));
        setCollection(cards);
      } else {
        setCollection([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadCollection();
    }
  }, [isFocused]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCollection();
  };

  const calculateTotalValue = () => {
    return collection.reduce((total, card) => {
      const val = card.price || 15.00;
      return total + val;
    }, 0);
  };

  
  const handleQuickSellCard = async (card) => {
    const sellPrice = (card.price || 15.00) * 0.5; 
    setDetailVisible(false);

    showPopup(
      'confirm',
      'Xác nhận bán nhanh',
      `Bạn có chắc chắn muốn bán lá bài này với giá $${sellPrice.toFixed(2)} cash (50% trị giá gốc)?`,
      async () => {
        try {
          
          const updatedCollection = collection.filter(c => c.id !== card.id);
          await AsyncStorage.setItem('my_collection', JSON.stringify(updatedCollection));
          setCollection(updatedCollection);

          
          const balanceKey = `wallet_balance_${username}`;
          const nextBalance = walletBalance + sellPrice;
          await AsyncStorage.setItem(balanceKey, nextBalance.toFixed(2));
          setWalletBalance(nextBalance);

          showPopup('success', 'Bán Thành Công', `Đã bán thẻ bài và cộng $${sellPrice.toFixed(2)} vào tài khoản của bạn.`);
        } catch (e) {
          console.error(e);
          showPopup('error', 'Thất Bại', 'Có lỗi xảy ra khi thực hiện bán thẻ.');
        }
      }
    );
  };

  const handleCardPress = (card) => {
    setSelectedCard(card);
    setDetailVisible(true);
  };

  const renderGridItem = ({ item }) => {
    const imageUrl = api.resolveImageUrl(item.imageUrl);
    const sourceText = item.source === 'pack-simulator' ? 'Mở Gói' : 'Đấu Giá';
    const sourceColor = item.source === 'pack-simulator' ? '#2563eb' : '#fbbf24';

    return (
      <TouchableOpacity 
        style={styles.cardItem} 
        activeOpacity={0.8}
        onPress={() => handleCardPress(item)}
      >
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="contain" />
        
        {}
        <View style={[styles.sourceBadge, { backgroundColor: sourceColor }]}>
          <Text style={[styles.sourceText, { color: item.source === 'pack-simulator' ? '#ffffff' : '#0f172a' }]}>
            {sourceText}
          </Text>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.cardContent}
        >
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardPrice}>${(item.price || 15.00).toFixed(2)}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {}
      <View style={styles.overviewHeader}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SỐ THẺ SỞ HỮU</Text>
          <Text style={styles.statValue}>{collection.length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TRỊ GIÁ BỘ SƯU TẬP</Text>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>
            ${calculateTotalValue().toFixed(2)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SỐ DƯ CASH VÍ</Text>
          <Text style={[styles.statValue, { color: '#fbbf24' }]}>
            ${walletBalance.toFixed(2)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      ) : (
        <FlatList
          data={collection}
          renderItem={renderGridItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="albums-outline" size={60} color="#334155" />
              <Text style={styles.emptyTitle}>BỘ SƯU TẬP TRỐNG</Text>
              <Text style={styles.emptyDesc}>
                Bạn chưa sở hữu thẻ bài nào trong bộ sưu tập. Hãy đi mở gói bài hoặc thắng các phiên đấu giá để tích lũy thẻ nhé!
              </Text>
              <View style={styles.emptyActions}>
                <TouchableOpacity 
                  style={styles.emptyBtn} 
                  onPress={() => navigation.navigate('PackSimulator')}
                >
                  <Ionicons name="gift" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyBtnText}>Mở gói bài</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.emptyBtn, { backgroundColor: '#fbbf24' }]} 
                  onPress={() => navigation.navigate('AuctionList')}
                >
                  <Ionicons name="hammer" size={16} color="#0f172a" style={{ marginRight: 6 }} />
                  <Text style={[styles.emptyBtnText, { color: '#0f172a' }]}>Săn đấu giá</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}

      {}
      <Modal
        visible={detailVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCard && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={1}>CHI TIẾT THẺ BÀI</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}>
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Image 
                    source={{ uri: api.resolveImageUrl(selectedCard.imageUrl) }} 
                    style={styles.modalImage} 
                    resizeMode="contain" 
                  />

                  <View style={styles.modalInfoPanel}>
                    <Text style={styles.modalCardName}>{selectedCard.name}</Text>
                    <Text style={styles.modalCardSet}>{selectedCard.screen || 'Set: Special Collection'}</Text>
                    
                    <View style={styles.modalStatsRow}>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>Độ hiếm</Text>
                        <Text style={styles.modalStatVal}>{selectedCard.ram || 'Rarity'}</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>Tình trạng</Text>
                        <Text style={styles.modalStatVal}>{selectedCard.rom || 'Mint'}</Text>
                      </View>
                    </View>

                    <View style={styles.modalStatsRow}>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>Nguồn gốc</Text>
                        <Text style={styles.modalStatVal}>
                          {selectedCard.source === 'pack-simulator' ? 'Giả lập mở gói' : 'Thắng đấu giá'}
                        </Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>Giá trị thị trường</Text>
                        <Text style={[styles.modalStatVal, { color: '#22c55e' }]}>
                          ${(selectedCard.price || 15.00).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.modalDesc}>{selectedCard.description || 'Thẻ bài Pokémon hiếm có giá trị sưu tầm rất cao.'}</Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalSellBtn} 
                    onPress={() => handleQuickSellCard(selectedCard)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cash" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.modalSellText}>
                      BÁN NHANH THU HỒI (${((selectedCard.price || 15.00) * 0.5).toFixed(2)})
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  cardItem: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  sourceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  sourceText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 20,
  },
  cardName: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '900',
  },
  cardPrice: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: '900',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  emptyDesc: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  emptyBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modalScroll: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalImage: {
    width: 180,
    height: 250,
  },
  modalInfoPanel: {
    width: '100%',
    marginTop: 20,
  },
  modalCardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalCardSet: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 12,
  },
  modalStatItem: {
    flex: 1,
  },
  modalStatLabel: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalStatVal: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 2,
  },
  modalDesc: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modalActions: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  modalSellBtn: {
    flexDirection: 'row',
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSellText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
