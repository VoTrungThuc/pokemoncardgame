import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Profile({ activeUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userOrders = await api.getOrders();
        setOrders(userOrders || []);
      } catch (err) {
        console.error('Không thể tải lịch sử đơn hàng cho profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [activeUser.id]);

  const totalSpent = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-150 rounded-[32px] shadow-premium animate-fade-in">
        <div className="text-5xl animate-spin text-[#e53935] font-light">◓</div>
        <p className="text-gray-400 text-xs mt-4 font-black tracking-wider uppercase">Đang tải hồ sơ Trainer...</p>
      </div>
    );
  }

  const isAdmin = activeUser?.role === 'ADMIN';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {}
      <div className="bg-white border border-gray-150 rounded-[32px] p-8 shadow-premium flex flex-col md:flex-row items-center gap-6 transition-all duration-300 hover:border-red-100/50 hover:shadow-premium-hover">
        {isAdmin ? (
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-[3px] border-white ring-4 ring-red-100 transition-transform duration-300 hover:scale-105 bg-white">
            <img src="/images/admin_logo.png" alt="Admin Logo" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#e53935] to-red-500 flex items-center justify-center text-3xl font-black text-white shadow-md border-[3px] border-white ring-4 ring-red-100 transition-transform duration-300 hover:scale-105">
            {activeUser.username ? activeUser.username.substring(0, 2).toUpperCase() : 'US'}
          </div>
        )}
        
        <div className="text-center md:text-left space-y-1.5 flex-grow">
          <h2 className="text-2xl font-black text-gray-900">@{activeUser.username}</h2>
          <p className="text-xs text-gray-500 font-bold">{activeUser.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2.5 mt-2">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
              isAdmin 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : 'bg-red-55 text-[#e53935] border-red-200'
            }`}>
              {activeUser.role}
            </span>
            <span className="text-xs text-gray-450 font-bold">• Thành viên PokeCard Store</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-150 rounded-3xl p-6 text-center shadow-premium hover:shadow-premium-hover hover:border-red-50 transition-all duration-300">
          <span className="text-3xl font-black text-gray-900 block">{orders.length}</span>
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mt-1.5">Đơn hàng đã đặt</span>
        </div>
        <div className="bg-white border border-gray-150 rounded-3xl p-6 text-center shadow-premium hover:shadow-premium-hover hover:border-red-50 transition-all duration-300">
          <span className="text-3xl font-black text-amber-500 block">{pendingOrders}</span>
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mt-1.5">Đơn đang xử lý</span>
        </div>
        <div className="bg-white border border-gray-150 rounded-3xl p-6 text-center shadow-premium hover:shadow-premium-hover hover:border-red-50 transition-all duration-300">
          <span className="text-3xl font-black text-emerald-600 block">${totalSpent.toFixed(2)}</span>
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mt-1.5">Tổng tiền hoàn tất</span>
        </div>
      </div>

      {}
      <div className="bg-white border border-gray-150 rounded-[32px] p-6.5 shadow-premium space-y-4">
        <h3 className="text-base font-black text-gray-900 tracking-wide pb-2 border-b border-gray-100">Thông tin bảo mật</h3>
        <div className="space-y-3.5 text-xs text-gray-650 font-bold">
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-450 font-normal">Mã Trainer ID:</span>
            <span className="text-gray-900 font-mono">{activeUser.id}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-450 font-normal">Trạng thái tài khoản:</span>
            <span className="text-emerald-600 font-black">Kích hoạt 🟢</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-gray-450 font-normal">Phiên đăng nhập:</span>
            <span className="text-gray-900 font-black">JWT Token hoạt động</span>
          </div>
        </div>
      </div>
    </div>
  );
}
