import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

const RIVAL_NAMES = ['@gary_oak', '@misty_water', '@brock_pewter', '@serena_kalos', '@cynthia_champ', '@leon_champion'];

export default function AuctionDetailScreen({ route, navigation }) {
  const { auctionId } = route.params;
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(1000.00);
  const [bidAmount, setBidAmount] = useState('');
  const [timeState, setTimeState] = useState(Date.now());
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const hasTriggeredEnd = useRef(false);

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

  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadData = async (showLoader = false) => {
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

      
      const data = await api.getAuctionById(auctionId);
      if (data) {
        setAuction(data);
        const suggestion = (data.currentBid + 5).toFixed(0);
        
        setBidAmount(prev => {
          const typedVal = parseFloat(prev);
          if (showLoader || !prev || isNaN(typedVal) || typedVal <= data.currentBid) {
            return suggestion;
          }
          return prev;
        });
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showPopup('error', 'Không tìm thấy', 'Phiên đấu giá này không còn tồn tại hoặc đã bị đặt lại.', () => {
          navigation.goBack();
        });
      } else {
        console.warn('Error loading auction data:', e.message || e);
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    hasTriggeredEnd.current = false; 
    loadData(true);
    const interval = setInterval(() => loadData(false), 4000); 
    return () => clearInterval(interval);
  }, [auctionId]);

  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(api.getServerTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  
  useEffect(() => {
    if (!auction || auction.status === 'ended' || hasTriggeredEnd.current) return;

    const remaining = Date.parse(auction.endTime) - timeState;
    if (remaining <= 0) {
      hasTriggeredEnd.current = true;
      handleAuctionEnd();
    }
  }, [timeState, auction]);

  const handleAuctionEnd = async () => {
    if (!auction || auction.status === 'ended') return;

    try {
      const endedItem = await api.getAuctionById(auctionId);
      if (endedItem) {
        setAuction(endedItem);

        
        if (isAdmin) {
          const resultMsg = endedItem.highestBidder === '-' 
            ? 'Phiên đấu giá kết thúc mà không có ai đặt giá.' 
            : `${endedItem.highestBidder} là người chiến thắng với giá $${endedItem.currentBid.toFixed(2)}.`;
          showPopup('success', '⏱️ Kết Thúc Kiểm Tra', resultMsg);
          return;
        }

        const isMeWinning = currentUser && endedItem.highestBidder === `@${currentUser.username}`;

        if (isMeWinning) {
          
          const price = endedItem.currentBid;
          const nextBalance = walletBalance - price;
          const username = currentUser?.username || 'guest';
          await AsyncStorage.setItem(`wallet_balance_${username}`, nextBalance.toFixed(2));
          setWalletBalance(nextBalance);

          
          const collectionStr = await AsyncStorage.getItem('my_collection');
          let collection = [];
          if (collectionStr) {
            collection = JSON.parse(collectionStr);
          }
          const newCard = {
            id: `${endedItem.id}-${Date.now()}`,
            name: endedItem.cardName,
            imageUrl: endedItem.imageUrl,
            ram: endedItem.rarity,
            rom: endedItem.condition,
            price: endedItem.currentBid,
            acquiredDate: new Date().toISOString(),
            source: 'live-auction'
          };
          await AsyncStorage.setItem('my_collection', JSON.stringify([...collection, newCard]));

          showPopup('success', '🏆 BẠN ĐÃ THẮNG ĐẤU GIÁ!', `Chúc mừng! Bạn đã thắng đấu giá thẻ ${endedItem.cardName} với mức giá $${price.toFixed(2)}. Thẻ đã được thêm vào Bộ Sưu Tập!`);
        } else if (endedItem.highestBidder === '-' || !endedItem.highestBidder) {
          
          showPopup('success', '⏱️ Kết Thúc', 'Phiên đấu giá đã kết thúc mà không có lượt đặt giá nào.');
        } else {
          
          showPopup('error', 'THẤT BẠI', `Phiên đấu giá kết thúc. Đối thủ ${endedItem.highestBidder} đã thắng với giá $${endedItem.currentBid.toFixed(2)}.`);
        }
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showPopup('error', 'Không tìm thấy', 'Phiên đấu giá này không còn tồn tại hoặc đã bị đặt lại.', () => {
          navigation.goBack();
        });
      } else {
        console.warn('Error handling auction end:', e.message || e);
      }
    }
  };

  const handlePlaceBid = async () => {
    
    if (isAdmin) {
      showPopup('error', 'Không Có Quyền', 'Admin không được phép tham gia đấu giá. Hãy dùng tài khoản User để đấu giá.');
      return;
    }
    if (!auction || auction.status === 'ended') return;

    const bidVal = parseFloat(bidAmount);
    if (isNaN(bidVal)) {
      showPopup('error', 'Lỗi Nhập Liệu', 'Vui lòng nhập một số tiền hợp lệ để đấu giá.');
      return;
    }

    if (bidVal <= auction.currentBid) {
      showPopup('error', 'Đặt Giá Không Hợp Lệ', `Mức giá thầu của bạn phải lớn hơn mức giá hiện tại ($${auction.currentBid.toFixed(2)}).`);
      return;
    }

    if (bidVal > walletBalance) {
      showPopup('error', 'Không Đủ Số Dư', `Số dư ví ảo của bạn ($${walletBalance.toFixed(2)}) không đủ để đặt thầu mức giá này.`);
      return;
    }

    try {
      const data = await api.placeBid(auctionId, bidVal);
      if (data) {
        setAuction(data);
        setBidAmount((bidVal + 5).toFixed(0));
        showPopup('success', 'Đặt Thầu Thành Công', `Bạn đang tạm dẫn đầu phiên đấu giá với mức $${bidVal.toFixed(2)}! Hãy cẩn thận với các đối thủ đặt giá lại.`);
      }
    } catch (e) {
      console.error(e);
      showPopup('error', 'Lỗi đặt thầu', 'Không thể hoàn tất lượt đặt thầu.');
    }
  };

  const handleQuickIncrease = (amount) => {
    if (isAdmin) return; 
    if (!auction) return;
    const nextBid = Math.max(auction.currentBid + amount, parseFloat(bidAmount || 0));
    setBidAmount(nextBid.toFixed(0));
  };

  const getRemainingTimeText = (endTimeStr) => {
    const total = Date.parse(endTimeStr) - timeState;
    if (total <= 0) return 'Hết giờ';
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    
    const pad = (num) => (num < 10 ? '0' + num : num);
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
      </View>
    );
  }

  if (!auction) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Không tìm thấy phiên đấu giá này.</Text>
      </View>
    );
  }

  const remainingTime = Date.parse(auction.endTime) - timeState;
  const isEnded = remainingTime <= 0 || auction.status === 'ended';
  const isUserWinning = currentUser && auction.highestBidder === `@${currentUser.username}`;

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.walletHeader}>
          {isAdmin ? (
            <View style={styles.adminObserverBadge}>
              <Ionicons name="eye" size={14} color="#f97316" style={{ marginRight: 6 }} />
              <Text style={styles.adminObserverText}>CHẾ ĐỘ QUAN SÁT ADMIN — KHÔNG THAM GIA ĐẤU GIÁ</Text>
            </View>
          ) : (
            <View style={styles.walletBox}>
              <Ionicons name="wallet" size={16} color="#fbbf24" />
              <Text style={styles.walletLabel}>Số dư Ví của bạn:</Text>
              <Text style={styles.walletValue}>${walletBalance.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {}
        <View style={styles.imageCard}>
          <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />
          <Image source={{ uri: api.resolveImageUrl(auction.imageUrl) }} style={styles.cardImage} resizeMode="contain" />
        </View>

        {}
        <View style={styles.detailsCard}>
          <View style={styles.metaRow}>
            <Text style={styles.rarityText}>{auction.rarity}</Text>
            <View style={[
              styles.timeBadge, 
              isEnded ? styles.timeEnded : (remainingTime < 60000 ? styles.timeUrgent : styles.timeActive)
            ]}>
              <Ionicons name="time" size={14} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.timeText}>{getRemainingTimeText(auction.endTime)}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{auction.cardName}</Text>
          <Text style={styles.conditionText}>Tình trạng bảo quản: {auction.condition}</Text>

          {}
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.bidOverview}
          >
            <View style={styles.bidDetailItem}>
              <Text style={styles.bidOverviewLabel}>Giá hiện tại</Text>
              <Text style={styles.bidOverviewValue}>${auction.currentBid.toFixed(2)}</Text>
            </View>
            <View style={styles.bidDetailDivider} />
            <View style={styles.bidDetailItem}>
              <Text style={styles.bidOverviewLabel}>Đang dẫn đầu</Text>
              <Text style={[
                styles.bidOverviewValue,
                isUserWinning 
                  ? styles.winningMe 
                  : (auction.highestBidder === '-' ? { color: '#94a3b8' } : styles.winningRival)
              ]}>
                {isUserWinning ? 'Bạn (@me)' : auction.highestBidder}
              </Text>
            </View>
          </LinearGradient>

          {}
          {isAdmin ? (
            <View style={styles.adminObserveBox}>
              <Ionicons name="eye-outline" size={22} color="#f97316" style={{ marginBottom: 8 }} />
              <Text style={styles.adminObserveTitle}>ADMIN — CHẾ ĐỘ QUAN SÁT</Text>
              <Text style={styles.adminObserveDesc}>
                Bạn đang theo dõi phiên đấu giá này với tư cách Kiểm thử viên. Admin không được phép tham gia đặt giá thầu trong phiên đấu giá của khách hàng.
              </Text>
            </View>
          ) : !isEnded ? (
            <View style={styles.biddingArea}>
              <Text style={styles.areaTitle}>ĐẶT GIÁ THẦU CỦA BẠN</Text>
              
              <View style={styles.quickBidRow}>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickIncrease(5)}>
                  <Text style={styles.quickBtnText}>+$5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickIncrease(10)}>
                  <Text style={styles.quickBtnText}>+$10</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickIncrease(25)}>
                  <Text style={styles.quickBtnText}>+$25</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    keyboardType="numeric"
                    placeholder="Nhập giá thầu..."
                    placeholderTextColor="#64748b"
                  />
                </View>
                <TouchableOpacity style={styles.submitBidBtn} onPress={handlePlaceBid} activeOpacity={0.85}>
                  <Text style={styles.submitBidText}>ĐẶT GIÁ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.endedBox}>
              <Ionicons name="lock-closed" size={24} color="#94a3b8" />
              <Text style={styles.endedText}>
                Phiên đấu giá này đã khép lại. 
                {isUserWinning 
                  ? ' Bạn đã thắng cuộc và sở hữu lá bài này!' 
                  : (auction.highestBidder === '-' || !auction.highestBidder) 
                    ? ' Phiên đấu giá kết thúc không có ai đặt giá.' 
                    : ` Đối thủ ${auction.highestBidder} là người sở hữu lá bài.`}
              </Text>
            </View>
          )}

          {}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>LỊCH SỬ ĐẶT GIÁ ({auction.bidHistory?.length || 0})</Text>
            
            {auction.bidHistory && auction.bidHistory.length > 0 ? (
              auction.bidHistory.map((item, index) => {
                const isMe = currentUser && item.bidder === `@${currentUser.username}`;
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.historyRow, 
                      index === 0 && styles.firstHistoryRow,
                      isMe && styles.myHistoryRow
                    ]}
                  >
                    <View style={styles.historyLeft}>
                      <View style={[
                        styles.avatarMini, 
                        { backgroundColor: isMe ? '#22c55e' : '#3b82f6' }
                      ]}>
                        <Text style={styles.avatarMiniText}>
                          {item.bidder.replace('@', '').substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={[styles.historyBidder, isMe && styles.historyBidderMe]}>
                          {isMe ? 'Bạn (@me)' : item.bidder}
                        </Text>
                        <Text style={styles.historyTime}>
                          {new Date(item.bidTime || item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.historyAmount, isMe ? styles.historyAmountMe : styles.historyAmountRival]}>
                      ${item.amount.toFixed(2)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginTop: 8 }}>
                Chưa có lượt đặt giá nào.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  adminObserverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    borderWidth: 1,
    borderColor: '#f97316',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  adminObserverText: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  adminObserveBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  adminObserveTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#f97316',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  adminObserveDesc: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  walletHeader: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  walletLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    marginLeft: 6,
  },
  walletValue: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '900',
    marginLeft: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '800',
  },
  imageCard: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  cardImage: {
    width: 200,
    height: 280,
    zIndex: 2,
  },
  detailsCard: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 400,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeActive: {
    backgroundColor: '#2563eb',
  },
  timeUrgent: {
    backgroundColor: '#ef4444',
  },
  timeEnded: {
    backgroundColor: '#475569',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 12,
  },
  conditionText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 4,
  },
  bidOverview: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bidDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  bidOverviewLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '750',
    textTransform: 'uppercase',
  },
  bidOverviewValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },
  bidDetailDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  winningMe: {
    color: '#22c55e',
  },
  winningRival: {
    color: '#ef4444',
  },
  biddingArea: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
    paddingVertical: 20,
    marginBottom: 20,
  },
  areaTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickBidRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingLeft: 16,
  },
  dollarSign: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '900',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '900',
    paddingVertical: 12,
    paddingLeft: 4,
  },
  submitBidBtn: {
    backgroundColor: '#e53935',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  submitBidText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  endedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  endedText: {
    flex: 1,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    marginLeft: 12,
    lineHeight: 16,
  },
  historySection: {
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  firstHistoryRow: {
    borderBottomColor: '#f59e0b',
  },
  myHistoryRow: {
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarMiniText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  historyBidder: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  historyBidderMe: {
    color: '#22c55e',
  },
  historyTime: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 13,
    fontWeight: '900',
  },
  historyAmountMe: {
    color: '#22c55e',
  },
  historyAmountRival: {
    color: '#ffffff',
  },
});
