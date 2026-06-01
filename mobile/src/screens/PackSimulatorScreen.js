import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Dimensions, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const isRare = (card) => {
  const rarity = (card.ram || '').toLowerCase();
  return rarity.includes('rare') || 
         rarity.includes('vmax') || 
         rarity.includes('vstar') || 
         rarity.includes('gold') || 
         rarity.includes('promo') ||
         rarity.includes('ultra') ||
         rarity.includes('holo') ||
         rarity.includes('ex') ||
         rarity.includes('star') ||
         rarity.includes('full art') ||
         (card.price && card.price >= 50.00);
};

const PACK_TYPES = [
  {
    id: 'sv151',
    name: 'Scarlet & Violet 151',
    price: 9.99,
    sellPrice: 7.00,
    setKeyword: '151',
    colors: ['#ef4444', '#b91c1c'],
    packIcon: 'flame-outline',
    description: 'Bộ sưu tập 151 Pokemon huyền thoại đầu tiên kỷ nguyên Kanto!',
  },
  {
    id: 'crown',
    name: 'Crown Zenith',
    price: 14.99,
    sellPrice: 10.50,
    setKeyword: 'Crown',
    colors: ['#eab308', '#a16207'],
    packIcon: 'ribbon-outline',
    description: 'Nơi tập hợp những thẻ bài Galarian Gallery và VSTAR lấp lánh cực hiếm.',
  },
  {
    id: 'evolving',
    name: 'Evolving Skies',
    price: 19.99,
    sellPrice: 14.00,
    setKeyword: 'Evolving',
    colors: ['#3b82f6', '#1d4ed8'],
    packIcon: 'thunderstorm-outline',
    description: 'Rồng truyền thuyết Rayquaza và các phiên bản Umbreon/Espeon Alt Art đỉnh cao.',
  },
];

const FlipCard = ({ card, isFlipped, onFlip }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isFlipped) {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 15,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 15,
        useNativeDriver: true,
      }).start();
    }
  }, [isFlipped]);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });
  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  const imageUrl = api.resolveImageUrl(card.imageUrl);

  return (
    <TouchableOpacity onPress={onFlip} activeOpacity={0.9} style={styles.cardContainer}>
      <View style={styles.cardWrapper}>
        {}
        <Animated.View style={[styles.cardBack, frontAnimatedStyle]}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.cardBackGradient}
          >
            <View style={styles.cardBackInner}>
              <MaterialCommunityIcons name="pokeball" size={32} color="#f43f5e" style={styles.pokeballIcon} />
              <Text style={styles.cardBackTitle}>POKÉMON</Text>
              <Text style={styles.cardBackSub}>CARD SIMULATOR</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {}
        <Animated.View style={[styles.cardFront, backAnimatedStyle, { position: 'absolute', top: 0 }]}>
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="contain" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.cardOverlay}
          >
            <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
            <View style={styles.cardBadgeRow}>
              <Text style={styles.cardRarity} numberOfLines={1}>{card.ram || 'Rare'}</Text>
              <Text style={styles.cardPrice}>${card.price ? card.price.toFixed(2) : '5.00'}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default function PackSimulatorScreen({ navigation }) {
  const [walletBalance, setWalletBalance] = useState(1000.00);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPack, setCurrentPack] = useState(null);
  const [openedCards, setOpenedCards] = useState([]);
  const [flippedStates, setFlippedStates] = useState([false, false, false, false, false]);
  const [gameState, setGameState] = useState('pack-select'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('guest');

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

  
  const initializeData = async () => {
    try {
      let currentUsername = 'guest';
      
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        setIsAdmin(userObj.role === 'ADMIN');
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

      setLoading(true);
      const cards = await api.getCards();
      setProducts(cards || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  
  const handleOpenPack = async (pack) => {
    
    if (!isAdmin && walletBalance < pack.price) {
      showPopup('error', 'Số Dư Không Đủ', 'Bạn không đủ số dư trong ví ảo để mua gói bài này. Vui lòng quay lại tab Tài khoản để nạp thêm tiền!');
      return;
    }

    try {
      setLoading(true);
      
      
      if (!isAdmin) {
        const balanceKey = `wallet_balance_${username}`;
        const nextBalance = walletBalance - pack.price;
        await AsyncStorage.setItem(balanceKey, nextBalance.toFixed(2));
        setWalletBalance(nextBalance);
      }

      
      const accessoryPool = products.filter(p => {
        return p.cpu && p.cpu.toLowerCase() === 'accessory';
      });

      
      let setCards = products.filter(p => {
        const isCard = p.cpu && 
          p.cpu.toLowerCase() !== 'sealed' && 
          p.cpu.toLowerCase() !== 'plush' && 
          p.cpu.toLowerCase() !== 'figure' && 
          p.cpu.toLowerCase() !== 'accessory';
        const inSet = p.screen && p.screen.toLowerCase().includes(pack.setKeyword.toLowerCase());
        return isCard && inSet;
      });

      
      if (setCards.length < 5) {
        setCards = products.filter(p => {
          return p.cpu && 
            p.cpu.toLowerCase() !== 'sealed' && 
            p.cpu.toLowerCase() !== 'plush' && 
            p.cpu.toLowerCase() !== 'figure' && 
            p.cpu.toLowerCase() !== 'accessory';
        });
      }

      
      if (setCards.length === 0) {
        setCards = products.filter(p => {
          return p.cpu && 
            p.cpu.toLowerCase() !== 'sealed' && 
            p.cpu.toLowerCase() !== 'plush' && 
            p.cpu.toLowerCase() !== 'figure' && 
            p.cpu.toLowerCase() !== 'accessory';
        });
      }

      
      const allCards = products.filter(p => {
        return p.cpu && 
          p.cpu.toLowerCase() !== 'sealed' && 
          p.cpu.toLowerCase() !== 'plush' && 
          p.cpu.toLowerCase() !== 'figure' && 
          p.cpu.toLowerCase() !== 'accessory';
      });

      
      let setRareCards = setCards.filter(c => isRare(c));
      let setCommonCards = setCards.filter(c => !isRare(c));

      
      if (setRareCards.length === 0) {
        setRareCards = allCards.filter(c => isRare(c));
      }

      
      if (setCommonCards.length === 0) {
        setCommonCards = allCards.filter(c => !isRare(c));
      }

      
      if (setCommonCards.length === 0) {
        setCommonCards = setCards;
      }
      if (setRareCards.length === 0) {
        setRareCards = setCards;
      }

      
      const selected = [];
      for (let i = 0; i < 5; i++) {
        
        const drawAccessory = accessoryPool.length > 0 && Math.random() < 0.05;
        
        if (drawAccessory) {
          const randIndex = Math.floor(Math.random() * accessoryPool.length);
          selected.push(accessoryPool[randIndex]);
        } else {
          const roll = Math.random();
          const dropRate = isAdmin ? 0.5 : (1 / 100000); 
          const drawRare = roll < dropRate;
          
          let pool = drawRare ? setRareCards : setCommonCards;
          if (pool.length > 0) {
            const randIndex = Math.floor(Math.random() * pool.length);
            selected.push(pool[randIndex]);
          }
        }
      }

      
      if (selected.length === 0) {
        for (let i = 0; i < 5; i++) {
          selected.push({
            id: `mock-${i}`,
            name: `Pikachu Card #${i + 1}`,
            imageUrl: 'https://images.pokemontcg.io/swsh35/20.png',
            ram: 'Holographic Rare',
            price: 15.00,
          });
        }
      }

      
      const currentTotalStr = await AsyncStorage.getItem('admin_total_drawn_count');
      const currentTotal = currentTotalStr ? parseInt(currentTotalStr) : 0;
      await AsyncStorage.setItem('admin_total_drawn_count', (currentTotal + 5).toString());

      const rareCount = selected.filter(c => isRare(c)).length;
      if (rareCount > 0) {
        const currentRareStr = await AsyncStorage.getItem('admin_total_rare_drawn_count');
        const currentRare = currentRareStr ? parseInt(currentRareStr) : 0;
        await AsyncStorage.setItem('admin_total_rare_drawn_count', (currentRare + rareCount).toString());
      }

      
      try {
        console.log('[DEBUG] PackSimulator: logging drawn cards. User:', username, 'Pack:', pack.name, 'Cards count:', selected.length);
        const drawnLogStr = await AsyncStorage.getItem('admin_drawn_cards_log');
        let drawnLog = [];
        if (drawnLogStr) {
          drawnLog = JSON.parse(drawnLogStr);
        }
        
        const newLogEntries = selected.map(c => ({
          username: username,
          cardId: c.id,
          cardName: c.name,
          imageUrl: c.imageUrl,
          rarity: c.ram || 'Rare',
          price: c.price || 15.00,
          packName: pack.name,
          openedAt: new Date().toISOString(),
          isRare: isRare(c)
        }));
        
        const updatedLog = [...newLogEntries, ...drawnLog].slice(0, 200);
        await AsyncStorage.setItem('admin_drawn_cards_log', JSON.stringify(updatedLog));
      } catch (logErr) {
        console.warn('Failed to log drawn cards:', logErr);
      }

      setCurrentPack(pack);
      setOpenedCards(selected);
      setFlippedStates([false, false, false, false, false]);
      setGameState('opening');
    } catch (e) {
      console.error(e);
      showPopup('error', 'Lỗi Mở Gói', 'Có lỗi xảy ra khi thực hiện mở gói bài.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlipCard = (index) => {
    const nextStates = [...flippedStates];
    nextStates[index] = true;
    setFlippedStates(nextStates);

    
    if (nextStates.every(s => s === true)) {
      setGameState('opened');
    }
  };

  const handleFlipAll = () => {
    setFlippedStates([true, true, true, true, true]);
    setGameState('opened');
  };

  
  const handleClaimAll = async () => {
    try {
      const collectionStr = await AsyncStorage.getItem('my_collection');
      let currentCollection = [];
      if (collectionStr) {
        currentCollection = JSON.parse(collectionStr);
      }

      
      const newItems = openedCards.map((c, idx) => ({
        ...c,
        id: `${c.id}-${Date.now()}-${idx}`,
        acquiredDate: new Date().toISOString(),
        source: 'pack-simulator',
        packName: currentPack?.name,
      }));

      const updatedCollection = [...currentCollection, ...newItems];
      await AsyncStorage.setItem('my_collection', JSON.stringify(updatedCollection));

      
      resetSimulator();
      
      showPopup('success', '✅ Đã Lưu Vào Bộ Sưu Tập', `Cả 5 lá bài đã được lưu thành công vào Bộ Sưu Tập cá nhân của bạn!`);
    } catch (e) {
      console.error(e);
      showPopup('error', 'Thất Bại', 'Không thể lưu thẻ vào bộ sưu tập.');
    }
  };

  
  const handleQuickSell = async () => {
    try {
      const balanceKey = `wallet_balance_${username}`;
      const refund = currentPack.sellPrice;
      const nextBalance = walletBalance + refund;
      await AsyncStorage.setItem(balanceKey, nextBalance.toFixed(2));
      setWalletBalance(nextBalance);

      
      resetSimulator();
      
      showPopup('success', '💰 Bán Nhanh Thành Công', `Đã thu hồi $${refund.toFixed(2)} cash vào ví ảo của bạn!`);
    } catch (e) {
      console.error(e);
    }
  };

  const resetSimulator = () => {
    setCurrentPack(null);
    setOpenedCards([]);
    setFlippedStates([false, false, false, false, false]);
    setGameState('pack-select');
  };

  if (loading && gameState === 'pack-select') {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loaderText}>Đang chuẩn bị gói bài...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        {isAdmin ? (
          
          <View style={styles.adminBadgeBox}>
            <Ionicons name="construct" size={16} color="#f97316" style={{ marginRight: 6 }} />
            <Text style={styles.adminBadgeText}>CHẾ ĐỘ KIỂM THỬ ADMIN - MIỄN PHÍ</Text>
          </View>
        ) : (
          <View style={styles.walletBox}>
            <Ionicons name="wallet" size={18} color="#f59e0b" />
            <Text style={styles.walletLabel}>Số dư Ví ảo:</Text>
            <Text style={styles.walletValue}>${walletBalance.toFixed(2)}</Text>
          </View>
        )}
        
      </View>

      {gameState === 'pack-select' ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>CHỌN BOOSTER PACK ĐỂ KHÁM PHÁ</Text>
          
          {PACK_TYPES.map((pack) => (
            <TouchableOpacity 
              key={pack.id} 
              onPress={() => handleOpenPack(pack)} 
              activeOpacity={0.85}
              style={styles.packWrapperCard}
            >
              <LinearGradient 
                colors={pack.colors} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }}
                style={styles.packGradient}
              >
                <View style={styles.packLeft}>
                  <Ionicons name={pack.packIcon} size={40} color="#ffffff" style={styles.packIcon} />
                  <View style={styles.packInfo}>
                    <Text style={styles.packNameText}>{pack.name}</Text>
                    <Text style={styles.packDescText} numberOfLines={2}>{pack.description}</Text>
                  </View>
                </View>
                <View style={styles.packRight}>
                  <Text style={styles.packPriceText}>${pack.price}</Text>
                  <View style={styles.buyBadge}>
                    <Text style={styles.buyBadgeText}>MỞ NGAY</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.openingContainer}>
          <View style={styles.openingHeader}>
            <Text style={styles.openingTitle}>GÓI BÀI: {currentPack?.name.toUpperCase()}</Text>
            <Text style={styles.openingSub}>Chạm vào các thẻ bài bên dưới để lật mặt trước</Text>
          </View>

          <View style={styles.cardsGrid}>
            <View style={styles.gridRow}>
              {openedCards.slice(0, 3).map((card, idx) => (
                <FlipCard 
                  key={`opened-card-${idx}`}
                  card={card}
                  isFlipped={flippedStates[idx]}
                  onFlip={() => handleFlipCard(idx)}
                />
              ))}
            </View>
            <View style={[styles.gridRow, { justifyContent: 'center', marginTop: 12 }]}>
              {openedCards.slice(3, 5).map((card, idx) => (
                <FlipCard 
                  key={`opened-card-${idx+3}`}
                  card={card}
                  isFlipped={flippedStates[idx+3]}
                  onFlip={() => handleFlipCard(idx+3)}
                />
              ))}
            </View>
          </View>

          <View style={styles.openingFooter}>
            {gameState === 'opening' ? (
              <TouchableOpacity style={styles.flipAllBtn} onPress={handleFlipAll} activeOpacity={0.8}>
                <Ionicons name="sparkles" size={18} color="#1e293b" style={{ marginRight: 6 }} />
                <Text style={styles.flipAllBtnText}>LẬT TẤT CẢ THẺ BÀI</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionsContainer}>
                {}
                {isAdmin ? (
                  <TouchableOpacity style={[styles.sellBtn, { flex: 1, borderColor: '#f97316', backgroundColor: '#fff7ed' }]} onPress={resetSimulator} activeOpacity={0.8}>
                    <Ionicons name="construct-outline" size={18} color="#f97316" style={{ marginRight: 6 }} />
                    <Text style={[styles.sellBtnText, { color: '#f97316' }]}>KẾT THÚC KIỂM THỬ</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={styles.sellBtn} onPress={handleQuickSell} activeOpacity={0.8}>
                      <Ionicons name="cash-outline" size={18} color="#e11d48" style={{ marginRight: 6 }} />
                      <Text style={styles.sellBtnText}>BÁN NHANH (${currentPack?.sellPrice.toFixed(2)})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.claimBtn} onPress={handleClaimAll} activeOpacity={0.8}>
                      <Ionicons name="archive-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.claimBtnText}>NHẬN TẤT CẢ THẺ</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loaderText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '800',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#1e293b',
  },
  adminBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  walletLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    marginLeft: 6,
  },
  walletValue: {
    fontSize: 13,
    color: '#fbbf24',
    fontWeight: '900',
    marginLeft: 6,
  },
  scrollContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  packWrapperCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  packGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  packLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  packIcon: {
    marginRight: 16,
  },
  packInfo: {
    flex: 1,
  },
  packNameText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  packDescText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    lineHeight: 14,
  },
  packRight: {
    alignItems: 'flex-end',
  },
  packPriceText: {
    fontSize: 18,
    fontWeight: '950',
    color: '#ffffff',
    marginBottom: 8,
  },
  buyBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buyBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0f172a',
  },
  openingContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  openingHeader: {
    alignItems: 'center',
    marginVertical: 10,
  },
  openingTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  openingSub: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textAlign: 'center',
  },
  cardsGrid: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
  },
  cardBack: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#3b82f6',
    backfaceVisibility: 'hidden',
  },
  cardBackGradient: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackInner: {
    alignItems: 'center',
  },
  pokeballIcon: {
    marginBottom: 8,
  },
  cardBackTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '950',
    letterSpacing: 1,
  },
  cardBackSub: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  cardFront: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#f59e0b',
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    backfaceVisibility: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingTop: 16,
  },
  cardName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardRarity: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fbbf24',
    flex: 1,
    marginRight: 4,
  },
  cardPrice: {
    fontSize: 9,
    fontWeight: '900',
    color: '#22c55e',
  },
  openingFooter: {
    alignItems: 'center',
    marginBottom: 10,
  },
  flipAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  flipAllBtnText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  sellBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fecdd3',
    borderWidth: 1,
    borderColor: '#fda4af',
    paddingVertical: 14,
    borderRadius: 16,
  },
  sellBtnText: {
    fontSize: 11,
    color: '#e11d48',
    fontWeight: '900',
  },
  claimBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  claimBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '900',
  },
});
