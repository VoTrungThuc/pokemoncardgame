import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

const STATUS_CONFIG = {
  ACCEPTED: { label: 'Đã Chấp Nhận', color: '#10b981', bg: '#ecfdf5', border: '#d1fae5' },
  REJECTED: { label: 'Đã Từ Chối', color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' },
  PENDING: { label: 'Chờ Xử Lý', color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
};

export default function TradeDashboardScreen() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('received'); 
  const [userId, setUserId] = useState(null);

  const [popupConfig, setPopupConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
  });

  const showPopup = (type, title, message, onConfirm = null) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm: () => {
        setPopupConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  const hidePopup = () => {
    setPopupConfig(prev => ({ ...prev, visible: false }));
  };

  const fetchTrades = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      
      const userJson = await AsyncStorage.getItem('user');
      if (!userJson) return;
      
      const user = JSON.parse(userJson);
      setUserId(user.id);
      
      const data = await api.getUserTrades(user.id);
      const sorted = (data || []).sort((a, b) => b.id - a.id);
      setTrades(sorted);
    } catch (e) {
      console.error('Error fetching trades:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrades(false);
  };

  const handleAccept = async (id) => {
    showPopup(
      'confirm',
      'Xác nhận trao đổi',
      'Bạn có chắc chắn muốn chấp nhận giao dịch trao đổi thẻ bài này?',
      async () => {
        try {
          setLoading(true);
          await api.acceptTrade(id);
          showPopup('success', 'Thành công', 'Đã thực hiện trao đổi! Chủ sở hữu của hai thẻ bài đã được cập nhật.');
          fetchTrades(false);
        } catch (err) {
          console.error(err);
          showPopup('error', 'Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện trao đổi.');
          setLoading(false);
        }
      }
    );
  };

  const handleReject = async (id) => {
    showPopup(
      'confirm',
      'Xác nhận từ chối',
      'Bạn có chắc chắn muốn từ chối đề xuất trao đổi thẻ bài này?',
      async () => {
        try {
          setLoading(true);
          await api.rejectTrade(id);
          showPopup('success', 'Thành công', 'Đã từ chối đề xuất trao đổi.');
          fetchTrades(false);
        } catch (err) {
          console.error(err);
          showPopup('error', 'Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi từ chối trao đổi.');
          setLoading(false);
        }
      }
    );
  };

  const getFilteredTrades = () => {
    if (!userId) return [];
    return trades.filter(t => {
      const isReceived = t.toUser?.id === userId;
      return activeTab === 'received' ? isReceived : !isReceived;
    });
  };

  const renderTradeItem = ({ item }) => {
    const isReceived = item.toUser?.id === userId;
    const partnerName = isReceived ? item.fromUser?.username : item.toUser?.username;
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const scoreDiff = Math.abs((item.offeredCard?.score || 0) - (item.requestedCard?.score || 0));

    return (
      <View style={styles.tradeCard}>
        {}
        <View style={styles.cardHeader}>
          <View style={styles.headerLabelRow}>
            <Ionicons 
              name={isReceived ? 'download-outline' : 'upload-outline'} 
              size={14} 
              color={isReceived ? '#10b981' : '#3b82f6'} 
              style={{ marginRight: 6 }}
            />
            <Text style={styles.partnerText}>
              {isReceived ? `Nhận từ: @${partnerName}` : `Gửi tới: @${partnerName}`}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {}
        <View style={styles.swapPanel}>
          {}
          <View style={styles.swapCardBox}>
            <Text style={styles.swapCardLabel}>Thẻ Đưa Ra</Text>
            <Text style={styles.swapCardName} numberOfLines={1}>{item.offeredCard?.name}</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.rarityBadge}>{item.offeredCard?.ram || 'Common'}</Text>
              <Text style={styles.scoreBadge}>★ {item.offeredCard?.score?.toFixed(1)}</Text>
            </View>
          </View>

          {}
          <View style={styles.swapIconContainer}>
            <Ionicons name="swap-horizontal" size={18} color="#94a3b8" />
          </View>

          {}
          <View style={styles.swapCardBox}>
            <Text style={styles.swapCardLabel}>Thẻ Yêu Cầu</Text>
            <Text style={styles.swapCardName} numberOfLines={1}>{item.requestedCard?.name}</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.rarityBadge}>{item.requestedCard?.ram || 'Common'}</Text>
              <Text style={styles.scoreBadge}>★ {item.requestedCard?.score?.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.scoreRow}>
          <Ionicons name="shield-checkmark" size={14} color="#10b981" style={{ marginRight: 6 }} />
          <Text style={styles.scoreDiffText}>
            Chênh lệch sức mạnh: <Text style={styles.scoreDiffVal}>{scoreDiff.toFixed(1)}</Text> (tối đa 1.5)
          </Text>
        </View>

        {}
        {item.status === 'PENDING' && isReceived && (
          <View style={styles.actionPanel}>
            <TouchableOpacity 
              style={styles.rejectBtn} 
              onPress={() => handleReject(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>TỪ CHỐI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.acceptBtn} 
              onPress={() => handleAccept(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptBtnText}>CHẤP NHẬN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing && trades.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loaderText}>Đang tải danh sách giao dịch...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Đề xuất nhận ({trades.filter(t => t.toUser?.id === userId).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Đề xuất gửi ({trades.filter(t => t.fromUser?.id === userId).length})
          </Text>
        </TouchableOpacity>
      </View>

      {}
      <FlatList
        data={getFilteredTrades()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTradeItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#e53935']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="swap-horizontal" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyText}>Chưa có yêu cầu trao đổi nào</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'received' 
                ? 'Các đề xuất đổi thẻ của Trainer khác gửi tới bạn sẽ hiển thị tại đây.'
                : 'Các thẻ bài bạn gửi đề xuất đổi sang Trainer khác sẽ hiển thị tại đây.'}
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
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#e53935',
  },
  tabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '800',
  },
  activeTabText: {
    color: '#e53935',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '800',
    marginTop: 12,
  },
  tradeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  headerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerText: {
    fontSize: 12,
    fontWeight: '850',
    color: '#1e293b',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  swapPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  swapCardBox: {
    flex: 1,
    alignItems: 'center',
  },
  swapCardLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  swapCardName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155',
    textAlign: 'center',
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  rarityBadge: {
    fontSize: 8,
    color: '#6366f1',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '800',
  },
  scoreBadge: {
    fontSize: 8,
    color: '#059669',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '850',
  },
  swapIconContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  scoreDiffText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  scoreDiffVal: {
    color: '#10b981',
    fontWeight: '900',
  },
  actionPanel: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rejectBtnText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '850',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  acceptBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '850',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
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
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '650',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
