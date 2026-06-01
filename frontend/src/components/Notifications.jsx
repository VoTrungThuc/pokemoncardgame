import React from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function Notifications() {
  const { notifications, loading, markAsRead, fetchNotifications } = useNotifications();

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleMarkRead = (n) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-150 rounded-[32px] shadow-premium animate-fade-in">
        <div className="text-5xl animate-spin text-[#e53935] font-light">◓</div>
        <p className="text-gray-400 text-xs mt-4 font-black tracking-wider uppercase">Đang tải thông báo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>🔔</span> Thông Báo Hệ Thống
        </h2>
        <button 
          type="button"
          onClick={fetchNotifications}
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

      {notifications.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white border border-gray-150 rounded-[32px] shadow-premium space-y-5">
          <div className="text-7xl opacity-40">🔔</div>
          <h3 className="text-lg font-black text-gray-950">Bạn không có thông báo nào</h3>
          <p className="text-xs text-gray-500 font-bold leading-relaxed">
            Các tin tức khuyến mãi mới nhất hoặc cập nhật về đơn hàng của bạn sẽ được hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => handleMarkRead(n)}
              className={`border rounded-2xl p-4 transition-all duration-300 flex items-start gap-3.5 cursor-pointer hover:shadow-premium-hover hover:border-red-100/50 ${
                n.isRead 
                  ? 'bg-white border-gray-150 text-gray-700' 
                  : 'bg-red-50/30 border-red-200/80 text-gray-900 shadow-premium'
              }`}
            >
              {}
              <div className="mt-1.5 flex-shrink-0">
                {!n.isRead ? (
                  <span className="w-2.5 h-2.5 bg-[#e53935] shadow-[0_0_8px_rgba(229,57,53,0.6)] rounded-full block animate-pulse" />
                ) : (
                  <span className="w-2.5 h-2.5 bg-gray-300 rounded-full block" />
                )}
              </div>

              {}
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-black text-sm text-gray-900 tracking-tight">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{formatTime(n.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">{n.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
