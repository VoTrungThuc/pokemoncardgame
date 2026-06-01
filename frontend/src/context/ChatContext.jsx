import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { activeUser } = useAuth();

  const fetchHistory = async () => {
    if (!activeUser) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getChatHistory();
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    try {
      
      const tempMsg = {
        id: Date.now(),
        userId: activeUser.id,
        sender: 'CUSTOMER',
        message: messageText,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);

      
      await api.sendChatMessage(messageText);

      
      setTimeout(fetchHistory, 1500); 
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeUser]);

  return (
    <ChatContext.Provider value={{
      messages,
      loading,
      fetchHistory,
      sendMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
