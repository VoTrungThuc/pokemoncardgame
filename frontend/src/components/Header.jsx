import React, { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleTabClick = (tab, category = '') => {
    setSelectedCategory(category);
    setActiveTab(tab);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { label: 'Trang Chủ',       tab: 'market',  category: '',          icon: '🏠' },
    { label: 'Thẻ Bài TCG',     tab: 'market',  category: 'single',    icon: '🎴' },
    { label: 'Pack Chưa Mở',    tab: 'market',  category: 'Sealed',    icon: '📦' },
    { label: 'Gấu Bông',        tab: 'market',  category: 'Plush',     icon: '🧸' },
    { label: 'Mô Hình Figure',  tab: 'market',  category: 'Figure',    icon: '🤖' },
    { label: 'Phụ Kiện TCG',    tab: 'market',  category: 'Accessory', icon: '🛡️' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'shadow-[0_4px_24px_rgba(229,57,53,0.18)] bg-white/95 backdrop-blur-md'
          : 'bg-white shadow-sm'
      }`}
    >
      {/* ─── TOP BAR ─── */}
      <div className="w-full px-4 py-3 md:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3">

        {/* ── LOGO ── */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none group flex-shrink-0"
          onClick={() => handleTabClick('market', '')}
        >
          {/* Pokéball icon */}
          <div className="relative w-11 h-11 flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-[#e53935] border-[3px] border-gray-850 relative overflow-hidden flex items-center justify-center shadow-md group-hover:shadow-[0_0_16px_rgba(229,57,53,0.5)] transition-all duration-500 group-hover:rotate-[360deg]"
              style={{ transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease' }}
            >
              {/* White bottom half */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white border-t-[3px] border-gray-850" />
              {/* Center button */}
              <div className="absolute z-10 w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-gray-850 shadow-inner" />
            </div>
          </div>

          <div className="leading-none">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 leading-none">
              Poke<span className="text-[#e53935]">Card</span>
              <span className="text-gray-400 font-light text-xl"> Store</span>
            </h1>
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-[0.18em] mt-0.5 block">
              ⚡ Thẻ Bài &amp; Đồ Chơi Pokemon Chính Hãng
            </span>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className={`w-full md:max-w-2xl relative transition-all duration-300 ${searchFocused ? 'md:max-w-2xl' : 'md:max-w-xl'}`}>
          <div className={`relative rounded-full transition-all duration-300 ${
            searchFocused
              ? 'ring-2 ring-[#e53935]/30 shadow-[0_4px_20px_rgba(229,57,53,0.15)]'
              : 'shadow-inner'
          }`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none z-10">
              🔍
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm thẻ bài, gấu bông, mô hình Pokemon..."
              className="w-full bg-gray-50/80 border border-gray-200 text-gray-800 focus:bg-white rounded-full px-5 py-2.5 pl-10 pr-10 focus:outline-none focus:border-[#e53935] transition-all text-sm"
              value={search}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={(e) => {
                setSearch(e.target.value);
                if (activeTab !== 'market') setActiveTab('market');
              }}
            />
            {search && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e53935] text-xs font-black cursor-pointer transition-colors z-10"
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-shrink-0">

          {/* Notification Bell */}
          {activeUser?.role !== 'ADMIN' && (
            <button
              className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-red-50 text-[#e53935] shadow-inner'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-[#e53935]'
              }`}
              onClick={() => handleTabClick('notifications')}
              title="Thông báo"
            >
              <span className="text-xl leading-none">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#e53935] text-white text-[9px] font-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-white px-0.5 animate-badge-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button */}
          {activeUser?.role !== 'ADMIN' && (
            <button
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 text-sm font-black cursor-pointer btn-press ${
                activeTab === 'cart'
                  ? 'bg-[#e53935] text-white border-[#e53935] shadow-md shadow-red-200'
                  : 'border-gray-200 text-gray-700 hover:border-[#e53935] hover:bg-red-50/60 hover:text-[#e53935]'
              }`}
              onClick={() => handleTabClick('cart')}
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Giỏ Hàng</span>
              <span className={`min-w-[20px] h-[20px] rounded-full text-[10px] font-black flex items-center justify-center px-1 ${
                activeTab === 'cart'
                  ? 'bg-white/20 text-white'
                  : totalItems > 0
                    ? 'bg-[#e53935] text-white'
                    : 'bg-gray-100 text-gray-500'
              }`}>
                {totalItems}
              </span>
            </button>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-2 border-l border-gray-100 pl-3">
            <button
              className="flex items-center gap-2 text-left cursor-pointer group"
              onClick={() => handleTabClick('profile')}
            >
              {activeUser?.role === 'ADMIN' ? (
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white ring-2 ring-red-100 group-hover:ring-[#e53935]/30 group-hover:scale-105 transition-all shadow-md bg-white">
                  <img src="/images/admin_logo.png" alt="Admin Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e53935] via-[#ef5350] to-[#ff7043] text-white flex items-center justify-center text-xs font-black border-2 border-white ring-2 ring-red-100 group-hover:ring-[#e53935]/30 group-hover:scale-105 transition-all shadow-md">
                  {getInitials(activeUser?.username)}
                </div>
              )}
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-xs font-black text-gray-800 group-hover:text-[#e53935] transition-colors">
                  @{activeUser?.username || 'Trainer'}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {activeUser?.role === 'ADMIN' ? '🛡️ Admin' : '🎮 Trainer'}
                </span>
              </div>
            </button>

            <button
              className="ml-1 px-3 py-1.5 text-[10px] font-black text-gray-400 hover:text-white hover:bg-[#e53935] rounded-lg transition-all cursor-pointer border border-transparent hover:border-[#e53935] uppercase tracking-wider"
              onClick={logout}
              title="Đăng xuất"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>

      {/* ─── NAV BAR ─── */}
      <div className="gradient-animated pokeball-bg pokemon-pattern">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <nav className="flex items-center gap-0.5 overflow-x-auto py-0 scrollbar-none">

            {navItems.map((item) => {
              const isActive =
                activeTab === item.tab &&
                selectedCategory === item.category;
              return (
                <button
                  key={item.label}
                  className={`relative px-4 py-3.5 text-[11px] md:text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 group ${
                    isActive
                      ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white after:rounded-t-full bg-white/15'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => handleTabClick(item.tab, item.category)}
                >
                  <span className={`text-sm ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}

            {/* Orders */}
            <button
              className={`relative px-4 py-3.5 text-[11px] md:text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 group ${
                activeTab === 'orders'
                  ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white after:rounded-t-full bg-white/15'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleTabClick('orders')}
            >
              <span className={`text-sm ${activeTab === 'orders' ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                📋
              </span>
              {activeUser?.role === 'ADMIN' ? 'Quản Lý Đơn' : 'Đơn Hàng'}
            </button>

            {/* Analytics (Admin only) */}
            {activeUser?.role === 'ADMIN' && (
              <button
                className={`relative px-4 py-3.5 text-[11px] md:text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 group ${
                  activeTab === 'analytics'
                    ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white after:rounded-t-full bg-white/15'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => handleTabClick('analytics')}
              >
                <span className={`text-sm ${activeTab === 'analytics' ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                  📊
                </span>
                Thống Kê
              </button>
            )}

            {/* Chat */}
            <button
              className={`relative px-4 py-3.5 text-[11px] md:text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 group ${
                activeTab === 'chat'
                  ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white after:rounded-t-full bg-white/15'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleTabClick('chat')}
            >
              <span className={`text-sm ${activeTab === 'chat' ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                💬
              </span>
              {activeUser?.role === 'ADMIN' ? 'Quản Lý Chat' : 'Hỗ Trợ'}
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
}
