import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

export default function TradeProposeScreen({ route, navigation }) {
  const { card } = route.params;

  const [activeUser, setActiveUser] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [selectedMyCardId, setSelectedMyCardId] = useState(null);
  
  const [targetListings, setTargetListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    const initData = async () => {
      try {
        setLoading(true);
        const userJson = await AsyncStorage.getItem('user');
        if (!userJson) return;
        const user = JSON.parse(userJson);
        setActiveUser(user);

        
        const allListings = await api.getListings(true);

        
        const activeCardListings = allListings.filter(
          l => l.card?.id === card.id && l.user?.id !== user.id
        );
        setTargetListings(activeCardListings);
        if (activeCardListings.length > 0) {
          setSelectedListingId(activeCardListings[0].id);
        }

        
        const myActiveListings = allListings.filter(l => l.user?.id === user.id);
        
        const others = myActiveListings
          .map(l => l.card)
          .filter(c => c && c.id !== card.id);

        setMyCards(others);
        if (others.length > 0) {
          setSelectedMyCardId(others[0].id);
        }
      } catch (err) {
        console.error(err);
        showPopup('error', 'Lỗi', 'Không thể tải danh sách thẻ bài.');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [card.id]);

  const selectedOfferedCard = myCards.find(c => c.id === selectedMyCardId);
  const selectedListing = targetListings.find(l => l.id === selectedListingId);
  const toUserId = selectedListing ? selectedListing.user?.id : null;
  const partnerUsername = selectedListing ? selectedListing.user?.username : '';

  
  const offeredScore = selectedOfferedCard?.score || 0;
  const requestedScore = card.score || 0;
  const scoreDifference = Math.abs(offeredScore - requestedScore);
  const isFairTrade = scoreDifference <= 1.5;

  const handleSubmit = async () => {
    if (!selectedMyCardId) {
      showPopup('warning', 'Chưa chọn thẻ', 'Vui lòng chọn một thẻ bài của bạn để đưa ra trao đổi.');
      return;
    }
    if (!toUserId) {
      showPopup('error', 'Không hợp lệ', 'Không thể xác định đối tác nhận giao dịch.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createTrade({
        fromUserId: activeUser.id,
        toUserId: toUserId,
        offeredCardId: selectedMyCardId,
        requestedCardId: card.id,
      });

      showPopup(
        'success',
        'Đã gửi đề xuất! 📤',
        `Yêu cầu trao đổi thẻ bài đã được gửi tới Trainer @${partnerUsername}.`,
        () => {
          navigation.replace('TradeDashboard');
        },
        'Xem Bảng Trao Đổi'
      );
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể tạo đề xuất trao đổi. Đảm bảo cả hai thẻ đều có tin đăng bán.';
      showPopup('error', 'Thất bại', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loaderText}>Đang kiểm tra thẻ bài phù hợp...</Text>
      </View>
    );
  }

  if (targetListings.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e53935" style={{ marginBottom: 16 }} />
        <Text style={styles.errorTitle}>Thẻ bài không sẵn sàng</Text>
        <Text style={styles.errorSubtitle}>
          Thẻ bài này hiện không có Trainer nào khác đăng bán hoạt động trên chợ.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>QUAY LẠI CHI TIẾT</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (myCards.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="card-outline" size={64} color="#f59e0b" style={{ marginBottom: 16 }} />
        <Text style={styles.errorTitle}>Thiếu thẻ đối ứng</Text>
        <Text style={styles.errorSubtitle}>
          Bạn chưa có thẻ bài nào đăng bán hoạt động trên chợ để làm vật phẩm đối ứng. Vui lòng đăng bán thẻ của bạn trên phiên bản Web trước.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>QUAY LẠI CHI TIẾT</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {}
        <View style={styles.previewPanel}>
          <View style={styles.previewBox}>
            <Text style={styles.previewBoxLabel}>Thẻ của bạn đưa ra</Text>
            {selectedOfferedCard ? (
              <View style={styles.previewCardContent}>
                <Text style={styles.previewCardName} numberOfLines={2}>{selectedOfferedCard.name}</Text>
                <Text style={styles.previewCardBrand}>{selectedOfferedCard.brand}</Text>
                <View style={styles.previewBadgeRow}>
                  <Text style={styles.previewRarity}>{selectedOfferedCard.ram}</Text>
                  <Text style={styles.previewScore}>★ {selectedOfferedCard.score?.toFixed(1)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.selectText}>Chưa chọn thẻ</Text>
            )}
          </View>

          <View style={styles.swapArrow}>
            <Ionicons name="swap-horizontal" size={24} color="#94a3b8" />
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewBoxLabel}>Thẻ bạn yêu cầu</Text>
            <View style={styles.previewCardContent}>
              <Text style={styles.previewCardName} numberOfLines={2}>{card.name}</Text>
              <Text style={styles.previewCardBrand}>{card.brand}</Text>
              <View style={styles.previewBadgeRow}>
                <Text style={styles.previewRarity}>{card.ram}</Text>
                <Text style={styles.previewScore}>★ {card.score?.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        {}
        {targetListings.length > 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn Trainer đối tác *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnerList}>
              {targetListings.map((l) => {
                const isSelected = selectedListingId === l.id;
                return (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.partnerCard, isSelected && styles.selectedPartnerCard]}
                    onPress={() => setSelectedListingId(l.id)}
                  >
                    <Ionicons 
                      name="person" 
                      size={18} 
                      color={isSelected ? '#ffffff' : '#64748b'} 
                      style={{ marginBottom: 4 }} 
                    />
                    <Text style={[styles.partnerName, isSelected && styles.selectedPartnerName]}>
                      @{l.user?.username}
                    </Text>
                    <Text style={[styles.partnerPrice, isSelected && styles.selectedPartnerPrice]}>
                      Giá: ${l.price?.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.singlePartnerRow}>
            <Ionicons name="person-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
            <Text style={styles.singlePartnerText}>
              Đối tác giao dịch: <Text style={styles.singlePartnerVal}>@{partnerUsername}</Text>
            </Text>
          </View>
        )}

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn thẻ của bạn để đưa ra *</Text>
          {myCards.map((c) => {
            const isSelected = selectedMyCardId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.selectableCard, isSelected && styles.selectedSelectableCard]}
                onPress={() => setSelectedMyCardId(c.id)}
                activeOpacity={0.8}
              >
                <View style={styles.selectableCardHeader}>
                  <Text style={[styles.selectableCardName, isSelected && styles.selectedSelectableCardText]}>
                    {c.name}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#e53935" />}
                </View>
                <View style={styles.selectableCardFooter}>
                  <Text style={styles.selectableCardBrand}>{c.brand}</Text>
                  <View style={styles.selectableCardStats}>
                    <Text style={styles.selectableCardRarity}>{c.ram}</Text>
                    <Text style={styles.selectableCardScore}>★ {c.score?.toFixed(1)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {}
        {selectedOfferedCard && (
          <View style={[styles.fairPanel, isFairTrade ? styles.fairGreen : styles.fairRed]}>
            <View style={styles.fairHeaderRow}>
              <Ionicons 
                name={isFairTrade ? 'checkmark-circle' : 'alert-circle'} 
                size={18} 
                color={isFairTrade ? '#059669' : '#dc2626'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.fairTitle, { color: isFairTrade ? '#059669' : '#dc2626' }]}>
                {isFairTrade ? 'GIAO DỊCH CÔNG BẰNG' : 'GIAO DỊCH KHÔNG HỢP LỆ'}
              </Text>
            </View>
            <Text style={styles.fairDesc}>
              Chênh lệch điểm sức mạnh giữa 2 thẻ bài là <Text style={styles.fairHighlight}>{scoreDifference.toFixed(1)}</Text>.
              {isFairTrade 
                ? ' Yêu cầu trao đổi hợp lệ và có thể gửi đi.' 
                : ' Vượt quá giới hạn chênh lệch cho phép (tối đa 1.5). Nút đề xuất đã bị khóa.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.proposeBtn, (!isFairTrade || submitting) && styles.proposeBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isFairTrade || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.proposeBtnText}>GỬI ĐỀ XUẤT TRAO ĐỔI</Text>
          )}
        </TouchableOpacity>
      </View>
      <CustomPopup {...popupConfig} onClose={hidePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 110,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: '#e53935',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  previewPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  previewBox: {
    flex: 1,
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 10,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  previewBoxLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  previewCardContent: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 4,
  },
  previewCardName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#334155',
    lineHeight: 14,
  },
  previewCardBrand: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  previewRarity: {
    fontSize: 7,
    color: '#6366f1',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '800',
  },
  previewScore: {
    fontSize: 8,
    color: '#059669',
    fontWeight: '850',
  },
  selectText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 24,
  },
  swapArrow: {
    paddingHorizontal: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  partnerList: {
    paddingVertical: 4,
  },
  partnerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    width: 110,
  },
  selectedPartnerCard: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  partnerName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  selectedPartnerName: {
    color: '#ffffff',
  },
  partnerPrice: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 2,
  },
  selectedPartnerPrice: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  singlePartnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  singlePartnerText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  singlePartnerVal: {
    color: '#e53935',
    fontWeight: '900',
  },
  selectableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  selectedSelectableCard: {
    borderColor: '#e53935',
    backgroundColor: '#fff5f5',
  },
  selectableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  selectableCardName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#334155',
    flex: 1,
    marginRight: 10,
  },
  selectedSelectableCardText: {
    color: '#1e293b',
  },
  selectableCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectableCardBrand: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  selectableCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectableCardRarity: {
    fontSize: 8,
    color: '#6366f1',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    fontWeight: '800',
  },
  selectableCardScore: {
    fontSize: 9,
    color: '#059669',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    fontWeight: '900',
  },
  fairPanel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  fairGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bcf0da',
  },
  fairRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  fairHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fairTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fairDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '600',
  },
  fairHighlight: {
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 10,
  },
  proposeBtn: {
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
  proposeBtnDisabled: {
    opacity: 0.5,
  },
  proposeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
