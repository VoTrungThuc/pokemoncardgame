import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MapLocation from './MapLocation';

export default function Chat() {
  const { activeUser } = useAuth();
  const isAdmin = activeUser?.role === 'ADMIN';

  if (isAdmin) {
    return <AdminChatView />;
  }

  return <CustomerChatView />;
}

function AdminChatView() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const chatBottomRef = useRef(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getAdminChatUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async (userId, showLoading = false) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const data = await api.getAdminCustomerChatHistory(userId);
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  
  useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
      api.getAdminChatUsers()
        .then(data => setUsers(data || []))
        .catch(err => console.warn('Failed to poll chat users:', err));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }
    
    const loadInitMessages = async () => {
      setLoadingMessages(true);
      await fetchMessages(selectedUser.id);
      setLoadingMessages(false);
    };
    loadInitMessages();

    
    const interval = setInterval(() => {
      fetchMessages(selectedUser.id);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !inputText.trim()) return;

    setSending(true);
    const text = inputText;
    setInputText('');

    try {
      const res = await api.sendAdminChatMessage(selectedUser.id, text);
      setMessages(prev => [...prev, res]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const username = u.username || '';
    const email = u.email || '';
    return username.toLowerCase().includes(searchQuery.toLowerCase()) || 
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full flex h-[620px] bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-premium animate-fade-in">
      {}
      <div className="w-1/3 border-r border-gray-150 flex flex-col bg-gray-50/50">
        <div className="p-5 border-b border-gray-150 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Trainer Inbox</h3>
            <button 
              type="button"
              onClick={fetchUsers} 
              disabled={loadingUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-[#e53935] bg-red-50 hover:bg-red-100/70 transition-all border border-red-100 hover:border-red-200 cursor-pointer disabled:opacity-50 group active:scale-95 shadow-xs"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="13" 
                height="13" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`transition-transform duration-500 group-hover:rotate-180 ${loadingUsers ? 'animate-spin' : ''}`}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span>Làm mới</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="Tìm trainer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 text-xs text-gray-800 rounded-full px-4 py-2 focus:outline-none focus:border-[#e53935] font-semibold shadow-inner"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingUsers && users.length === 0 ? (
            <p className="text-xs text-center text-gray-400 font-bold py-10">Đang tải danh sách...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-xs text-center text-gray-400 font-bold py-10">Không có đoạn chat nào</p>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#e53935] to-red-500 text-white shadow-premium' 
                      : 'bg-white hover:bg-gray-50 border border-gray-150 text-gray-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0 ${
                    isSelected ? 'bg-white/20 border-white/40 text-white' : 'bg-red-50 border-red-100 text-[#e53935]'
                  }`}>
                    {u.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">@{u.username}</p>
                    <p className={`text-[9px] truncate ${isSelected ? 'text-red-100/85' : 'text-gray-400'}`}>{u.email}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-350">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm">Chưa chọn phòng chat</h4>
              <p className="text-xs text-gray-450 mt-1 max-w-xs leading-relaxed font-semibold">
                Chọn một Trainer từ danh sách bên trái để xem tin nhắn và hỗ trợ trực tiếp.
              </p>
            </div>
          </div>
        ) : (
          <>
            {}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between flex-shrink-0">
              <div>
                <h4 className="text-sm font-black text-gray-950 truncate">Đang chat với @{selectedUser.username}</h4>
                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Hỗ trợ trực tiếp (Admin Mode)</p>
              </div>
              <button 
                type="button"
                onClick={() => fetchMessages(selectedUser.id, true)} 
                disabled={loadingMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-[#e53935] bg-red-50 hover:bg-red-100/70 transition-all border border-red-100 hover:border-red-200 cursor-pointer disabled:opacity-50 group active:scale-95 shadow-xs"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="13" 
                  height="13" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`transition-transform duration-500 group-hover:rotate-180 ${loadingMessages ? 'animate-spin' : ''}`}
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
                <span>Cập nhật</span>
              </button>
            </div>

            {}
            <div className="flex-1 min-h-0 bg-gray-50/50 p-5 overflow-y-auto space-y-4 relative shadow-inner">
              {loadingMessages && messages.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <div className="text-center space-y-2">
                    <svg className="animate-spin h-6 w-6 text-[#e53935] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xs text-gray-400 font-bold">Đang tải lịch sử chat...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    
                    const isMe = msg.sender === 'STORE';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div className={`max-w-[75%] p-3.5 space-y-1 relative shadow-sm ${
                          isMe 
                            ? 'bg-gradient-to-br from-[#e53935] to-red-500 text-white shadow-premium rounded-2xl rounded-tr-none'
                            : 'bg-white border border-gray-150 text-gray-800 rounded-2xl rounded-tl-none'
                        }`}>
                          <span className={`text-[8px] font-black uppercase tracking-wider block ${
                            isMe ? 'text-red-100/90' : 'text-[#e53935]'
                          }`}>
                            {isMe ? 'PokeCard Store (Admin)' : `@${selectedUser.username}`}
                          </span>
                          <p className="text-xs leading-relaxed break-words font-semibold">{msg.message}</p>
                          <span className={`text-[8px] font-bold block text-right mt-1 ${
                            isMe ? 'text-red-100/80' : 'text-gray-400'
                          }`}>
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </>
              )}
            </div>

            {}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-150 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Trả lời @${selectedUser.username}...`}
                disabled={sending}
                className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#e53935] focus:outline-none focus:ring-2 focus:ring-red-100 rounded-full px-5 py-2.5 text-sm text-gray-800 font-semibold"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black active:bg-black disabled:opacity-30 text-white text-xs font-black rounded-full transition-all shadow-md cursor-pointer flex-shrink-0 uppercase tracking-widest"
              >
                <span className="flex items-center gap-1.5">
                  <span>Gửi</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function CustomerChatView() {
  const { messages, loading, sendMessage, fetchHistory } = useChat();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    const text = inputText;
    setInputText('');

    try {
      await sendMessage(text);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {}
      <div className="lg:col-span-5 flex flex-col h-[600px] space-y-4 bg-white border border-gray-200 rounded-[32px] p-5 shadow-premium">
        <div className="pb-3 border-b border-gray-150 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e53935]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Hỗ Trợ Trực Tuyến</span>
            </h2>
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mt-0.5">Tự động & Trực tiếp 24/7</span>
          </div>
          <button 
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-[#e53935] bg-red-50 hover:bg-red-100/70 transition-all border border-red-100 hover:border-red-200 cursor-pointer disabled:opacity-50 group active:scale-95 shadow-xs"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="13" 
              height="13" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={`transition-transform duration-500 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>

        {}
        <div className="flex-1 min-h-0 bg-gray-50 border border-gray-150 rounded-2xl p-4 overflow-y-auto space-y-4 relative shadow-inner">
          {loading && messages.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xs">
              <div className="text-center space-y-2">
                <svg className="animate-spin h-8 w-8 text-[#e53935] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xs text-gray-550 font-bold">Đang tải tin nhắn...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <div>
                <h4 className="font-black text-gray-900 text-sm">Chưa có tin nhắn nào</h4>
                <p className="text-xs text-gray-555 mt-1 leading-relaxed font-semibold">
                  Hỏi về sản phẩm, độ hiếm thẻ, xuất xứ chính hãng, khuyến mãi hot, hoặc theo dõi đơn hàng của bạn!
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isStore = msg.sender === 'STORE';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isStore ? 'justify-start' : 'justify-end'} animate-fade-in`}
                  >
                    <div className={`max-w-[85%] p-3.5 space-y-1 relative shadow-xs ${
                      isStore 
                        ? 'bg-white border border-gray-150 text-gray-800 rounded-2xl rounded-tl-none' 
                        : 'bg-gradient-to-br from-[#e53935] to-red-500 text-white shadow-premium rounded-2xl rounded-tr-none'
                    }`}>
                      {}
                      <span className={`text-[8px] font-black uppercase tracking-wider block ${
                        isStore ? 'text-[#e53935]' : 'text-red-100/90'
                      }`}>
                        {isStore ? 'PokeCard Store' : 'Trainer'}
                      </span>
                      
                      {}
                      <p className="text-xs leading-relaxed break-words font-semibold">{msg.message}</p>
                      
                      {}
                      <span className={`text-[8px] font-bold block text-right mt-1 ${
                        isStore ? 'text-gray-400' : 'text-red-100/80'
                      }`}>
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </>
          )}
        </div>

        {}
        <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0 bg-white border border-gray-200 focus-within:border-[#e53935] focus-within:ring-2 focus-within:ring-red-100 rounded-full p-1.5 shadow-xs transition-all duration-300">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={sending}
            className="flex-1 bg-transparent px-4 py-2 text-xs text-gray-800 outline-none placeholder-gray-400 font-semibold"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="px-5 py-2 bg-[#e53935] hover:bg-[#d32f2f] active:bg-[#b71c1c] disabled:opacity-30 text-white text-xs font-black rounded-full transition-all shadow-xs cursor-pointer flex-shrink-0 uppercase tracking-widest flex items-center gap-1.5"
          >
            <span>{sending ? 'Đang gửi...' : 'Gửi'}</span>
            {!sending && (
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            )}
          </button>
        </form>
      </div>

      {}
      <div className="lg:col-span-7 bg-white border border-gray-200 rounded-[32px] p-5 shadow-premium flex flex-col h-[600px]">
        <div className="pb-3 border-b border-gray-150 flex-shrink-0">
          <h2 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e53935]"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Hệ Thống Cửa Hàng</span>
          </h2>
          <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mt-0.5">Tìm địa điểm PokeCard Store gần bạn</span>
        </div>
        <div className="flex-1 min-h-0 pt-4">
          <MapLocation isEmbedded={true} />
        </div>
      </div>
    </div>
  );
}
