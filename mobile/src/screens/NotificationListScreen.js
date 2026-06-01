import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function NotificationListScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const data = await api.getNotifications();
      
      const sorted = (data || []).sort((a, b) => b.id - a.id);
      setNotifications(sorted);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  const handleMarkAsRead = async (item) => {
    if (item.isRead) return;

    try {
      
      setNotifications(prev => 
        prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
      );
      await api.markNotificationRead(item.id);
    } catch (e) {
      console.error('Error marking notification as read:', e);
      
      fetchNotifications(false);
    }
  };

  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => handleMarkAsRead(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, !item.isRead && styles.unreadIconContainer]}>
            <Ionicons 
              name={item.title.includes('🔥') ? 'flame' : item.title.includes('📦') ? 'cube' : 'notifications'} 
              size={18} 
              color={!item.isRead ? '#ffffff' : '#64748b'} 
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt ? item.createdAt.replace('T', ' ').substring(0, 16) : ''}
            </Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.content}>{item.content}</Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loaderText}>Đang tải thông báo hệ thống...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#e53935']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyText}>Hộp thư thông báo trống</Text>
            <Text style={styles.emptySubtitle}>Các thông báo quan trọng sẽ xuất hiện ở đây.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#fee2e2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  unreadIconContainer: {
    backgroundColor: '#e53935',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    lineHeight: 18,
  },
  unreadTitle: {
    color: '#1e293b',
    fontWeight: '900',
  },
  timestamp: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e53935',
    marginLeft: 8,
  },
  content: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '600',
    paddingLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
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
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});
