import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);

  const flatListRef = useRef();

  
  const fetchChat = async () => {
    try {
      const data = await api.getChatHistory();
      setMessages(data || []);
    } catch (e) {
      console.log('Error fetching chat history:', e.message || e);
    }
  };

  
  const fetchAdminUsers = async () => {
    try {
      const data = await api.getAdminChatUsers();
      setChatUsers(data || []);
    } catch (e) {
      console.log('Error fetching admin chat users:', e.message || e);
    }
  };

  
  const fetchAdminChat = async (custUserId) => {
    try {
      const data = await api.getAdminCustomerChatHistory(custUserId);
      setMessages(data || []);
    } catch (e) {
      console.log('Error fetching customer chat history:', e.message || e);
    }
  };

  
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.id);
          const adminCheck = user.role === 'ADMIN';
          setIsAdmin(adminCheck);

          if (adminCheck) {
            await fetchAdminUsers();
          } else {
            await fetchChat();
          }
        }
      } catch (e) {
        console.log('Init chat error:', e);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAdmin) {
        if (selectedUserId) {
          fetchAdminChat(selectedUserId);
        } else {
          fetchAdminUsers();
        }
      } else {
        fetchChat();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAdmin, selectedUserId]);

  const handleSendMessage = async () => {
    if (text.trim() === '') return;
    const msgText = text;
    setText('');
    setSending(true);

    try {
      let res;
      if (isAdmin) {
        res = await api.sendAdminChatMessage(selectedUserId, msgText);
      } else {
        res = await api.sendChatMessage(msgText);
      }
      
      
      setMessages(prev => [...prev, res]);
      
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (e) {
      console.log('Send message error:', e);
    } finally {
      setSending(false);
    }
  };

  const renderChatItem = ({ item }) => {
    
    
    const isMe = isAdmin ? item.sender === 'STORE' : item.sender === 'CUSTOMER';
    const senderLabel = isMe 
      ? 'Bạn' 
      : (isAdmin ? `@${selectedUsername}` : '@Support');
    
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        {!isMe && (
          <Text style={styles.senderName}>{senderLabel}</Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, isMe ? styles.textMe : styles.textOther]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {item.createdAt ? item.createdAt.replace('T', ' ').substring(11, 16) : ''}
        </Text>
      </View>
    );
  };

  const selectUser = async (user) => {
    setLoading(true);
    setSelectedUserId(user.id);
    setSelectedUsername(user.username);
    try {
      await fetchAdminChat(user.id);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setSelectedUserId(null);
    setSelectedUsername(null);
    setMessages([]);
    fetchAdminUsers();
  };

  const renderUserItem = ({ item }) => {
    const initial = item.username ? item.username.substring(0, 2).toUpperCase() : 'US';
    return (
      <TouchableOpacity style={styles.userRow} onPress={() => selectUser(item)} activeOpacity={0.7}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userTitle}>@{item.username}</Text>
          <Text style={styles.userSubtitle} numberOfLines={1}>Nhấp để xem cuộc trò chuyện và trả lời</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </TouchableOpacity>
    );
  };

  if (loading && !selectedUserId) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loaderText}>
          {isAdmin ? 'Đang tải danh sách hộp thư...' : 'Đang kết nối tới Trung tâm Hỗ trợ...'}
        </Text>
      </View>
    );
  }

  
  if (isAdmin && !selectedUserId) {
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderTitleRow}>
            <Ionicons name="mail-unread-outline" size={20} color="#e53935" style={{ marginRight: 8 }} />
            <Text style={styles.chatHeaderTitle}>Hộp Thư Hỗ Trợ</Text>
          </View>
          <Text style={styles.chatHeaderSubtitle}>Các cuộc trò chuyện đang chờ xử lý</Text>
        </View>

        <FlatList
          data={chatUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.usersList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubbles-outline" size={48} color="#e53935" />
              </View>
              <Text style={styles.emptyText}>Hộp thư hiện đang trống</Text>
              <Text style={styles.emptySubtitle}>Khi khách hàng gửi tin nhắn hỗ trợ, cuộc trò chuyện sẽ xuất hiện ở đây.</Text>
            </View>
          }
        />
      </View>
    );
  }

  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {}
      <View style={styles.chatHeader}>
        {isAdmin ? (
          <View style={styles.adminHeaderRow}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
              <Ionicons name="arrow-back-outline" size={22} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.adminAvatarMini}>
              <Text style={styles.adminAvatarMiniText}>
                {selectedUsername ? selectedUsername.substring(0, 2).toUpperCase() : 'US'}
              </Text>
            </View>
            <View style={styles.adminHeaderInfo}>
              <Text style={styles.chatHeaderTitle}>@{selectedUsername}</Text>
              <View style={styles.onlineStatusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Đang kết nối</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.chatHeaderCenter}>
            <View style={styles.chatHeaderTitleRow}>
              <Ionicons name="chatbubbles-outline" size={18} color="#e53935" style={{ marginRight: 6 }} />
              <Text style={styles.chatHeaderTitle}>Trò Chuyện Hỗ Trợ</Text>
            </View>
            <Text style={styles.chatHeaderSubtitle}>Nhân viên hỗ trợ PokeCard Store trực tuyến</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.threadLoader}>
          <ActivityIndicator size="small" color="#e53935" />
          <Text style={styles.threadLoaderText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={isAdmin ? "Nhập tin nhắn trả lời khách hàng..." : "Nhập tin nhắn hỗ trợ..."}
          placeholderTextColor="#9ca3af"
          value={text}
          onChangeText={setText}
          multiline
          autoCorrect={false}
          spellCheck={false}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, text.trim() === '' && styles.sendBtnDisabled]} 
          onPress={handleSendMessage}
          disabled={text.trim() === '' || sending}
        >
          <Ionicons name="send" size={16} color="#ffffff" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loaderText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '750',
    marginTop: 12,
  },
  chatHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    justifyContent: 'center',
  },
  chatHeaderCenter: {
    alignItems: 'center',
  },
  chatHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  chatHeaderSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
    textAlign: 'center',
  },
  adminHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  adminAvatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e53935',
  },
  adminAvatarMiniText: {
    color: '#e53935',
    fontWeight: '850',
    fontSize: 12,
  },
  adminHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10b981',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrapper: {
    marginBottom: 14,
    maxWidth: '85%',
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9ca3af',
    marginBottom: 4,
    marginLeft: 6,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#e53935',
    borderTopRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  textMe: {
    color: '#ffffff',
  },
  textOther: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 8,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 13,
    color: '#1f2937',
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: '#e53935',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#fca5a5',
  },
  usersList: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e53935',
  },
  avatarText: {
    color: '#e53935',
    fontWeight: '900',
    fontSize: 14,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1f2937',
  },
  userSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  threadLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadLoaderText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '700',
    marginTop: 8,
  },
});
