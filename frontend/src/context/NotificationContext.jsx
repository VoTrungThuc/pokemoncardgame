import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { activeUser } = useAuth();

  
  const notificationsRef = React.useRef(notifications);
  
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const fetchNotifications = async (isFirstLoad = false) => {
    if (!activeUser || activeUser.role === 'ADMIN') {
      setNotifications([]);
      return;
    }
    setLoading(isFirstLoad); 
    try {
      const data = await api.getNotifications();
      const newNotifications = data || [];
      
      
      if (!isFirstLoad && notificationsRef.current.length > 0 && newNotifications.length > 0) {
        const oldIds = new Set(notificationsRef.current.map(n => n.id));
        const newlyAdded = newNotifications.filter(n => !oldIds.has(n.id) && !n.isRead);
        
        if (newlyAdded.length > 0) {
          
          const latest = newlyAdded[0];
          setToast({
            id: latest.id,
            title: latest.title,
            content: latest.content
          });
          
          
          setTimeout(() => {
            setToast(current => current && current.id === latest.id ? null : current);
          }, 6000);
        }
      }
      
      setNotifications(newNotifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    
    const interval = setInterval(() => fetchNotifications(false), 8000);
    return () => clearInterval(interval);
  }, [activeUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      unreadCount,
      fetchNotifications,
      markAsRead
    }}>
      {children}

      {toast && (
        <div className="fixed top-24 right-6 z-[999] max-w-sm w-full bg-white border-2 border-red-250 rounded-xl shadow-2xl p-4 flex gap-3 animate-slide-in">
          <div className="text-2xl animate-bounce self-center select-none">🔔</div>
          <div className="flex-grow">
            <h4 className="text-sm font-black text-gray-900 leading-tight">{toast.title}</h4>
            <p className="text-xs text-gray-550 mt-1 leading-normal font-semibold">{toast.content}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-gray-450 hover:text-gray-700 font-bold self-start cursor-pointer text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
