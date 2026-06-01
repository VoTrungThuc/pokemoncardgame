import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput, FlatList, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';
import * as WebBrowser from 'expo-web-browser';
import qrcode from 'qrcode-generator';

function PackageSelectionModal({ visible, onClose, onSelectPackage }) {
  const packages = [10, 20, 50, 100, 500, 1000];
  const [selectedAmount, setSelectedAmount] = useState(null);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '60%', borderTopLeftRadius: 32, borderTopRightRadius: 32 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { fontSize: 16, fontWeight: '900' }]}>💰 CHỌN MỨC NẠP TIỀN</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
            Vui lòng chọn một trong các mệnh giá dưới đây để nạp vào ví của bạn.
          </Text>

          <FlatList
            data={packages}
            numColumns={2}
            keyExtractor={(item) => `pkg-${item}`}
            columnWrapperStyle={{ justifyContent: 'space-between', gap: 12, marginBottom: 12 }}
            renderItem={({ item }) => {
              const isSelected = selectedAmount === item;
              return (
                <TouchableOpacity
                  style={[
                    packageStyles.packageCard,
                    isSelected && packageStyles.packageCardSelected
                  ]}
                  onPress={() => setSelectedAmount(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="wallet" 
                    size={24} 
                    color={isSelected ? '#ffffff' : '#e53935'} 
                    style={{ marginBottom: 6 }} 
                  />
                  <Text style={[packageStyles.packageText, isSelected && packageStyles.packageTextSelected]}>
                    ${item.toFixed(2)}
                  </Text>
                  <Text style={[packageStyles.packageSubText, isSelected && packageStyles.packageSubTextSelected]}>
                    {(item * 25000).toLocaleString('vi-VN')} VNĐ
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            style={[packageStyles.continueBtn, !selectedAmount && packageStyles.continueBtnDisabled]}
            disabled={!selectedAmount}
            onPress={() => {
              if (selectedAmount) {
                onSelectPackage(selectedAmount);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={packageStyles.continueBtnText}>TIẾP TỤC</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function TopUpVNPayQRModal({ visible, txnRef, paymentUrl, totalAmount, onSuccess, onClose }) {
  const [pollingStatus, setPollingStatus] = useState('PENDING');

  useEffect(() => {
    if (!visible || !txnRef) return;

    setPollingStatus('PENDING');
    const intervalId = setInterval(async () => {
      try {
        const res = await api.getTopUpStatus(txnRef);
        if (res && res.status) {
          setPollingStatus(res.status);
          if (res.status === 'SUCCESS') {
            clearInterval(intervalId);
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else if (res.status === 'FAILED') {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.warn('Error polling top-up status:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [visible, txnRef]);

  if (!visible || !paymentUrl) return null;

  const amountVnd = Math.round(totalAmount * 25000);

  
  let qrBase64 = null;
  try {
    const qr = qrcode(0, 'M');
    qr.addData(paymentUrl);
    qr.make();
    qrBase64 = qr.createDataURL(5, 10);
  } catch (err) {
    console.error('[TopUpVNPayQRModal] Failed to generate local QR Code:', err);
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
            <Text style={modalStyles.title}>🇻🇳 NẠP TIỀN QUA VNPAY</Text>
            <Text style={modalStyles.subtitle}>
              Quét mã QR dưới đây bằng ứng dụng Ngân hàng / Ví VNPay để thanh toán nạp tiền.
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
              <Text style={modalStyles.infoLabel}>Mã giao dịch:</Text>
              <Text style={modalStyles.infoValue} numberOfLines={1} ellipsizeMode="tail">{txnRef}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.infoLabel}>Số tiền nạp:</Text>
              <Text style={[modalStyles.infoValue, { color: '#e53935' }]}>
                ${totalAmount.toFixed(2)} ({amountVnd.toLocaleString('vi-VN')} VNĐ)
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
            {pollingStatus === 'SUCCESS' && (
              <View style={modalStyles.statusRow}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginRight: 6 }} />
                <Text style={[modalStyles.statusText, { color: '#059669' }]}>
                  Thành công! Đang cộng tiền vào ví...
                </Text>
              </View>
            )}
            {pollingStatus === 'FAILED' && (
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
              <Text style={modalStyles.secondaryBtnText}>Hủy giao dịch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen({ route, navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(1000.00);
  const [adminStats, setAdminStats] = useState({ totalDrawn: 0, totalRareDrawn: 0 });
  const [drawnCardsLog, setDrawnCardsLog] = useState([]);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [selectPackageModalVisible, setSelectPackageModalVisible] = useState(false);
  const [vnPayQRModalVisible, setVnPayQRModalVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [vnPayTxnRef, setVnPayTxnRef] = useState('');
  const [vnPayUrl, setVnPayUrl] = useState('');
  const isFocused = useIsFocused();
  const onLogout = route?.params?.onLogout;

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

  const loadUser = async () => {
    try {
      setLoading(true);
      const userJson = await AsyncStorage.getItem('user');
      let currentUser = null;
      if (userJson) {
        currentUser = JSON.parse(userJson);
        setUser(currentUser);
      }
      
      const notifications = await api.getNotifications();
      const unread = (notifications || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);

      const username = currentUser?.username || 'guest';
      const balanceKey = `wallet_balance_${username}`;
      const balanceStr = await AsyncStorage.getItem(balanceKey);
      if (balanceStr) {
        setWalletBalance(parseFloat(balanceStr));
      } else {
        const DEMO_USERS = ['ash_ketchum', 'gary_oak', 'admin', 'user_test', 'admin_test', 'user', 'admin_new', 'admin_custom'];
        const initialBalance = DEMO_USERS.includes(username) ? '1000.00' : '0.00';
        await AsyncStorage.setItem(balanceKey, initialBalance);
        setWalletBalance(parseFloat(initialBalance));
      }

      
      if (currentUser?.role === 'ADMIN') {
        const drawnStr = await AsyncStorage.getItem('admin_total_drawn_count');
        const rareStr = await AsyncStorage.getItem('admin_total_rare_drawn_count');
        setAdminStats({
          totalDrawn: drawnStr ? parseInt(drawnStr) : 0,
          totalRareDrawn: rareStr ? parseInt(rareStr) : 0,
        });

        const logStr = await AsyncStorage.getItem('admin_drawn_cards_log');
        setDrawnCardsLog(logStr ? JSON.parse(logStr) : []);
        console.log('[DEBUG] ProfileScreen loaded. totalDrawn:', drawnStr, 'rare:', rareStr, 'logStr length:', logStr ? JSON.parse(logStr).length : 0);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadUser();
    }
  }, [isFocused]);

  const handleLogout = () => {
    showPopup(
      'confirm',
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi PokeCard Store?',
      async () => {
        try {
          await api.logout();
          if (onLogout) {
            onLogout();
          }
        } catch (e) {
          console.warn(e);
        }
      },
      'Đăng xuất',
      'Hủy'
    );
  };

  const handleDeposit = () => {
    setSelectPackageModalVisible(true);
  };

  const handleSelectPackage = async (amount) => {
    setSelectPackageModalVisible(false);
    setLoading(true);
    try {
      const response = await api.createTopUpPayment(amount);
      if (response && response.paymentUrl) {
        setTopUpAmount(amount);
        setVnPayUrl(response.paymentUrl);
        setVnPayTxnRef(response.txnRef);
        setVnPayQRModalVisible(true);
      } else {
        showPopup('error', 'Thất Bại', 'Không thể khởi tạo giao dịch VNPay.');
      }
    } catch (err) {
      console.warn('Error initiating topup:', err);
      showPopup('error', 'Thất Bại', 'Có lỗi xảy ra khi tạo giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpSuccess = async () => {
    setVnPayQRModalVisible(false);
    try {
      const username = user?.username || 'guest';
      const balanceKey = `wallet_balance_${username}`;
      const nextBalance = walletBalance + topUpAmount;
      await AsyncStorage.setItem(balanceKey, nextBalance.toFixed(2));
      setWalletBalance(nextBalance);
      showPopup(
        'success',
        'Nạp Tiền Thành Công',
        `Đã nạp $${topUpAmount.toFixed(2)} vào ví của bạn. Số dư mới là $${nextBalance.toFixed(2)}.`,
        () => {
          navigation.navigate('Main', { screen: 'HomeTab' });
        }
      );
    } catch (e) {
      console.warn(e);
      showPopup('error', 'Lỗi cập nhật', 'Giao dịch thành công nhưng có lỗi khi cộng tiền vào ví.');
    }
  };

  const handleTopUpClose = () => {
    setVnPayQRModalVisible(false);
    showPopup('info', 'Thông báo', 'Giao dịch nạp tiền đã đóng.');
  };

  const getFilteredLogs = () => {
    if (!logSearch.trim()) return drawnCardsLog;
    const query = logSearch.toLowerCase();
    return drawnCardsLog.filter(log => 
      (log.username || '').toLowerCase().includes(query) ||
      (log.cardName || '').toLowerCase().includes(query)
    );
  };

  const handleClearLog = () => {
    showPopup(
      'confirm',
      'Xác nhận xóa lịch sử',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử mở thẻ của người dùng trên thiết bị này?',
      async () => {
        try {
          await AsyncStorage.removeItem('admin_drawn_cards_log');
          await AsyncStorage.removeItem('admin_total_drawn_count');
          await AsyncStorage.removeItem('admin_total_rare_drawn_count');
          setDrawnCardsLog([]);
          setAdminStats({ totalDrawn: 0, totalRareDrawn: 0 });
          showPopup('success', 'Thành công', 'Đã xóa lịch sử mở thẻ.');
        } catch (e) {
          console.warn(e);
        }
      },
      'Xóa hết',
      'Hủy'
    );
  };

  const handleGenerateTestData = async () => {
    try {
      const mockLogs = [
        {
          username: 'ash_ketchum',
          cardId: 'sv151-120',
          cardName: 'Alakazam ex',
          imageUrl: 'https://images.pokemontcg.io/sv1/120.png',
          rarity: 'Double Rare',
          price: 12.50,
          packName: 'Scarlet & Violet 151',
          openedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          isRare: true
        },
        {
          username: 'gary_oak',
          cardId: 'crown-gg44',
          cardName: 'Mewtwo VSTAR',
          imageUrl: 'https://images.pokemontcg.io/cz/gg44.png',
          rarity: 'Galarian Gallery Rare',
          price: 85.00,
          packName: 'Crown Zenith',
          openedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          isRare: true
        },
        {
          username: 'user',
          cardId: 'evolving-10',
          cardName: 'Pikachu Common',
          imageUrl: 'https://images.pokemontcg.io/swsh35/20.png',
          rarity: 'Common',
          price: 1.20,
          packName: 'Evolving Skies',
          openedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          isRare: false
        }
      ];
      await AsyncStorage.setItem('admin_drawn_cards_log', JSON.stringify(mockLogs));
      await AsyncStorage.setItem('admin_total_drawn_count', '3');
      await AsyncStorage.setItem('admin_total_rare_drawn_count', '2');
      
      setDrawnCardsLog(mockLogs);
      setAdminStats({ totalDrawn: 3, totalRareDrawn: 2 });
      showPopup('success', 'Thành công', 'Đã tạo 3 bản ghi mở thẻ mẫu để kiểm thử!');
    } catch (e) {
      console.warn(e);
      showPopup('error', 'Lỗi', 'Không thể tạo dữ liệu kiểm thử.');
    }
  };

  const renderLogItem = ({ item }) => {
    const imageUrl = api.resolveImageUrl(item.imageUrl);
    const dateStr = item.openedAt ? item.openedAt.replace('T', ' ').substring(0, 16) : '';
    
    return (
      <View style={[styles.logRow, item.isRare && styles.logRowRare]}>
        <Image 
          source={{ uri: imageUrl || 'https://images.pokemontcg.io/swsh35/20.png' }} 
          style={styles.logImage}
          resizeMode="contain"
        />
        <View style={styles.logInfo}>
          <View style={styles.logHeaderRow}>
            <Text style={styles.logCardName} numberOfLines={1}>{item.cardName}</Text>
            {item.isRare && (
              <View style={styles.rareBadge}>
                <Text style={styles.rareBadgeText}>HIẾM</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.logMeta}>Gói: {item.packName} | Rarity: {item.rarity}</Text>
          
          <View style={styles.logUserRow}>
            <Text style={styles.logUserLabel}>Người mở: </Text>
            <Text style={styles.logUserVal}>@{item.username}</Text>
            <Text style={styles.logTime}>{dateStr}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {}
      <LinearGradient 
        colors={['#1e293b', '#0f172a']} 
        style={styles.trainerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.trainerHeader}>
          <LinearGradient colors={['#f43f5e', '#e11d48']} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'TR'}
            </Text>
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.username}>@{user?.username || 'Trainer'}</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.roleBadge}>{user?.role || 'USER'}</Text>
              <Text style={styles.levelBadge}>LV. 50</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>150+</Text>
            <Text style={styles.statLabel}>Cards</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>Kanto</Text>
            <Text style={styles.statLabel}>League</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>Master</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>

        {}
        {user?.role !== 'ADMIN' && (
          <View style={styles.balanceRowWrapper}>
            <View style={styles.balanceContainer}>
              <Ionicons name="wallet-outline" size={16} color="#38bdf8" style={{ marginRight: 6 }} />
              <Text style={styles.balanceLabel}>Số dư ví: </Text>
              <Text style={styles.balanceValue}>${walletBalance.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.depositBtn} onPress={handleDeposit} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.depositBtnText}>Nạp tiền</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {}
      {user?.role === 'ADMIN' && (
        <View style={styles.adminStatsCard}>
          <Text style={styles.adminStatsTitle}>📊 Thống kê mở thẻ hệ thống</Text>
          <View style={styles.adminStatsRow}>
            <View style={styles.adminStatItem}>
              <Text style={styles.adminStatVal}>{adminStats.totalDrawn}</Text>
              <Text style={styles.adminStatLabel}>Tổng thẻ đã mở</Text>
            </View>
            <View style={styles.adminStatDivider} />
            <View style={styles.adminStatItem}>
              <Text style={styles.adminStatVal}>{adminStats.totalRareDrawn}</Text>
              <Text style={styles.adminStatLabel}>Số thẻ hiếm</Text>
            </View>
          </View>
        </View>
      )}

      {}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>
          {user?.role === 'ADMIN' ? 'Công cụ kiểm thử Admin' : 'Bảng điều khiển Trainer'}
        </Text>

        {user?.role !== 'ADMIN' && (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('TradeDashboard')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="swap-horizontal" size={20} color="#e53935" />
              <Text style={styles.menuText}>Bàn trao đổi thẻ (Trades)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="notifications" size={20} color="#e53935" />
            <Text style={styles.menuText}>Thông báo hệ thống</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Locations')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="map" size={20} color="#e53935" />
            <Text style={styles.menuText}>Hệ thống chi nhánh cửa hàng</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('AuctionList')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="hammer" size={20} color="#e53935" />
            <Text style={styles.menuText}>
              {user?.role === 'ADMIN' ? 'Kiểm tra Đấu giá thẻ bài trực tuyến' : 'Đấu giá thẻ bài trực tuyến'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('PackSimulator')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="gift" size={20} color="#e53935" />
            <Text style={styles.menuText}>
              {user?.role === 'ADMIN' ? 'Kiểm tra Giả lập mở gói bài (Booster Pack)' : 'Giả lập mở gói bài (Booster Pack)'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {user?.role === 'ADMIN' && (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setLogModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="list-circle-outline" size={20} color="#e53935" />
              <Text style={styles.menuText}>Xem lịch sử mở thẻ của người dùng</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}

        {user?.role !== 'ADMIN' && (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('MyCollection')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="albums" size={20} color="#e53935" />
              <Text style={styles.menuText}>Bộ sưu tập cá nhân</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Thông Tin Trainer</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Địa chỉ Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'Chưa cập nhật'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Số điện thoại</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Địa chỉ nhận hàng mặc định</Text>
          <Text style={styles.infoValue}>{user?.shippingAddress || 'Chưa cập nhật'}</Text>
        </View>
      </View>

      {}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>ĐĂNG XUẤT TÀI KHOẢN</Text>
      </TouchableOpacity>
      </ScrollView>

      {}
      <Modal
        visible={logModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLogModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>LỊCH SỬ MỞ THẺ CỦA USER 🎴</Text>
              <TouchableOpacity onPress={() => setLogModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.logSearchContainer}>
              <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.logSearchInput}
                placeholder="Tìm theo Trainer hoặc Tên thẻ..."
                placeholderTextColor="#94a3b8"
                value={logSearch}
                onChangeText={setLogSearch}
                autoCorrect={false}
              />
              {logSearch ? (
                <TouchableOpacity onPress={() => setLogSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {}
            {getFilteredLogs().length === 0 ? (
              <View style={styles.emptyLogContainer}>
                <Ionicons name="file-tray-outline" size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                {logSearch.trim() ? (
                  <>
                    <Text style={styles.emptyLogText}>Không tìm thấy lịch sử nào khớp với "{logSearch}".</Text>
                    <TouchableOpacity 
                      style={styles.clearSearchBtn} 
                      onPress={() => setLogSearch('')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.clearSearchBtnText}>Xóa bộ lọc tìm kiếm</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.emptyLogText}>Không có lịch sử mở thẻ nào.</Text>
                )}
              </View>
            ) : (
              <FlatList
                data={getFilteredLogs()}
                keyExtractor={(item, index) => `log-${index}`}
                renderItem={renderLogItem}
                contentContainerStyle={styles.logList}
                showsVerticalScrollIndicator={false}
              />
            )}

            {}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.testDataBtn} onPress={handleGenerateTestData} activeOpacity={0.8}>
                <Ionicons name="construct-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.testDataText}>TẠO MẪU TEST (DEV)</Text>
              </TouchableOpacity>
              
              {drawnCardsLog.length > 0 && (
                <TouchableOpacity style={styles.clearLogBtn} onPress={handleClearLog} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.clearLogText}>XÓA LỊCH SỬ</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <PackageSelectionModal
        visible={selectPackageModalVisible}
        onClose={() => setSelectPackageModalVisible(false)}
        onSelectPackage={handleSelectPackage}
      />

      <TopUpVNPayQRModal
        visible={vnPayQRModalVisible}
        txnRef={vnPayTxnRef}
        paymentUrl={vnPayUrl}
        totalAmount={topUpAmount}
        onSuccess={handleTopUpSuccess}
        onClose={handleTopUpClose}
      />

      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const packageStyles = StyleSheet.create({
  packageCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  packageCardSelected: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  packageText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  packageTextSelected: {
    color: '#ffffff',
  },
  packageSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  packageSubTextSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  continueBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  continueBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  trainerCard: {
    borderRadius: 28,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  roleBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    backgroundColor: 'rgba(244, 63, 94, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0f172a',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '750',
    color: '#334155',
  },
  logoutBtn: {
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  balanceRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    width: '100%',
  },
  balanceContainer: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 10,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '900',
  },
  depositBtn: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 10,
  },
  depositBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  unreadBadge: {
    backgroundColor: '#e53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  adminStatsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  adminStatsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  adminStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  adminStatVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  adminStatLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 4,
  },
  adminStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  logSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  logSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  logList: {
    paddingBottom: 24,
  },
  emptyLogContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyLogText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '800',
    marginTop: 8,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  logRowRare: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  logImage: {
    width: 48,
    height: 64,
    borderRadius: 6,
  },
  logInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  logHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logCardName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  rareBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rareBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#b45309',
  },
  logMeta: {
    fontSize: 9,
    fontWeight: '650',
    color: '#64748b',
    marginBottom: 4,
  },
  logUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logUserLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
  },
  logUserVal: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ef4444',
  },
  logTime: {
    fontSize: 8,
    fontWeight: '600',
    color: '#94a3b8',
    marginLeft: 'auto',
  },
  clearLogBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e53935',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLogText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  testDataBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testDataText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  clearSearchBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  clearSearchBtnText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '800',
  },
});
