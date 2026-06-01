import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  search, 
  setSearch, 
  selectedCategory, 
  setSelectedCategory 
}) {
  const { activeUser, logout } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();

  const handleTabClick = (tab, category = '') => {
    setSelectedCategory(category);
    setActiveTab(tab);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-premium border-b border-gray-150">
      {}
      <div className="w-full px-4 py-3 md:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => handleTabClick('market', '')}
        >
          {}
          <div className="w-10 h-10 rounded-full border-[3px] border-gray-800 bg-[#e53935] relative overflow-hidden flex items-center justify-center transition-transform duration-500 ease-out group-hover:rotate-180
            after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1/2 after:bg-white after:border-t-[3px] after:border-gray-800
            before:content-[''] before:absolute before:z-10 before:w-3.5 before:h-3.5 before:rounded-full before:bg-white before:border-[3px] before:border-gray-800 shadow-inner">
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 leading-none">
              Poke<span className="text-[#e53935]">Card</span> Store
            </h1>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mt-0.5">Thẻ Bài & Đồ Chơi Pokemon</span>
          </div>
        </div>

        {}
        <div className="w-full md:max-w-xl relative">
          <input
            type="text"
            placeholder="Nhập từ khóa cần tìm..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 focus:bg-white rounded-full px-5 py-2.5 pl-12 pr-10 focus:outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100 transition-all text-sm shadow-inner"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (activeTab !== 'market') {
                setActiveTab('market');
              }
            }}
          />
          <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</div>
          {search && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 text-xs font-bold cursor-pointer"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        {}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          
          {}
          {activeUser?.role !== 'ADMIN' && (
            <button
              className={`p-2.5 rounded-full relative transition-all duration-300 hover:bg-gray-50 cursor-pointer ${
                activeTab === 'notifications' ? 'text-[#e53935] bg-red-50' : 'text-gray-500'
              }`}
              onClick={() => handleTabClick('notifications')}
              title="Thông báo"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#e53935] text-white text-[9px] font-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center border border-white px-1">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {}
          {activeUser?.role !== 'ADMIN' && (
            <button
              className={`flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#e53935] rounded-full relative transition-all duration-300 text-sm font-black hover:bg-red-50/50 hover:shadow-xs cursor-pointer ${
                activeTab === 'cart' ? 'text-[#e53935] border-[#e53935] bg-red-50' : 'text-gray-700'
              }`}
              onClick={() => handleTabClick('cart')}
            >
              <span>🛒 Giỏ Hàng</span>
              {totalItems > 0 ? (
                <span className="bg-[#e53935] text-white text-[10px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1">
                  {totalItems}
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-500 text-[10px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1">
                  0
                </span>
              )}
            </button>
          )}

          {}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <button 
              className="flex items-center gap-2 text-left cursor-pointer group"
              onClick={() => handleTabClick('profile')}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e53935] to-red-400 text-white flex items-center justify-center text-xs font-black border border-white ring-2 ring-red-100 group-hover:scale-105 transition-transform">
                {getInitials(activeUser?.username)}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-xs font-black text-gray-750 group-hover:text-gray-950">@{activeUser?.username || 'Trainer'}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  {activeUser?.role === 'ADMIN' ? '🛡️ Admin' : '🎮 Trainer'}
                </span>
              </div>
            </button>

            <button
              className="ml-2 px-2.5 py-1.5 text-xs font-black text-gray-400 hover:text-[#e53935] hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              onClick={logout}
              title="Đăng xuất"
            >
              Đăng Xuất
            </button>
          </div>

        </div>
      </div>

      {}
      <div className="bg-[#e53935] text-white shadow-inner">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <nav className="flex flex-wrap items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
            
            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'market' && selectedCategory === '' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('market', '')}
            >
              Trang Chủ
            </button>

            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'market' && selectedCategory === 'single' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('market', 'single')}
            >
              Thẻ Bài TCG
            </button>

            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'market' && selectedCategory === 'Sealed' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('market', 'Sealed')}
            >
              Pack Chưa Mở
            </button>

            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'market' && selectedCategory === 'Plush' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('market', 'Plush')}
            >
              Gấu Bông Pokemon
            </button>

            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'market' && selectedCategory === 'Figure' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('market', 'Figure')}
            >
              Mô Hình Figure
            </button>

            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'market' && selectedCategory === 'Accessory' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('market', 'Accessory')}
            >
              Phụ Kiện TCG
            </button>

            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'orders' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('orders')}
            >
              {activeUser?.role === 'ADMIN' ? 'Quản Lý Đơn' : 'Đơn Hàng'}
            </button>

            {}
            {activeUser?.role === 'ADMIN' && (
              <button
                className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                  activeTab === 'analytics' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
                }`}
                onClick={() => handleTabClick('analytics')}
              >
                Thống Kê
              </button>
            )}

            {}
            <button
              className={`relative px-4.5 py-3.5 text-xs md:text-sm font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer hover:bg-black/10 ${
                activeTab === 'chat' ? 'bg-black/20 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white' : ''
              }`}
              onClick={() => handleTabClick('chat')}
            >
              {activeUser?.role === 'ADMIN' ? 'Quản Lý Chat' : 'Cửa Hàng & Hỗ Trợ'}
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
}
