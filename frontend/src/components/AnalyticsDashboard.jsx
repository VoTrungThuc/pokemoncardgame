import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [subTab, setSubTab] = useState('sales');
  
  
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForOrders, setSelectedUserForOrders] = useState(null);

  
  const { activeUser } = useAuth();
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    shippingAddress: ''
  });
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const [fetchedOrders, fetchedUsers] = await Promise.all([
        api.getOrders(),
        api.getUsers()
      ]);

      setOrders(fetchedOrders || []);
      setUsers(fetchedUsers || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng kiểm tra kết nối tới server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminFormError('');
    setAdminFormSuccess('');
    try {
      await api.createAdmin(adminFormData);
      setAdminFormSuccess('Tạo tài khoản Admin mới thành công!');
      setAdminFormData({
        username: '',
        email: '',
        password: '',
        phone: '',
        shippingAddress: ''
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setAdminFormError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản Admin.');
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMessage = currentRole === 'ADMIN'
      ? 'Bạn có chắc chắn muốn hạ cấp tài khoản này xuống USER?'
      : 'Bạn có chắc chắn muốn nâng cấp tài khoản này lên ADMIN?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await api.updateUserRole(userId, newRole);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể cập nhật quyền tài khoản.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-150 rounded-[32px] shadow-premium animate-fade-in">
        <div className="text-5xl animate-spin text-[#e53935] font-light">◓</div>
        <p className="text-gray-400 text-xs mt-4 font-black tracking-wider uppercase">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-150 rounded-[32px] p-8 text-center max-w-lg mx-auto shadow-premium animate-fade-in">
        <p className="text-[#e53935] font-black">⚠️ {error}</p>
        <button 
          className="mt-4 px-6 py-2.5 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider" 
          onClick={loadData}
        >
          Thử lại
        </button>
      </div>
    );
  }

  
  
  const activeOrders = orders.filter(o => o.status !== 'CANCELLED');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const totalItemsSold = activeOrders.reduce((sum, o) => {
    const orderItemsQty = o.items ? o.items.reduce((qtySum, item) => qtySum + (item.quantity || 0), 0) : 0;
    return sum + orderItemsQty;
  }, 0);

  
  const dailyStatsMap = {};
  orders.forEach(order => {
    if (!order.createdAt) return;
    
    const dateStr = order.createdAt.substring(0, 10);
    
    if (!dailyStatsMap[dateStr]) {
      dailyStatsMap[dateStr] = {
        date: dateStr,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        itemsSold: 0,
        revenue: 0, 
      };
    }
    
    const dayData = dailyStatsMap[dateStr];
    dayData.totalOrders += 1;
    
    if (order.status === 'COMPLETED') {
      dayData.completedOrders += 1;
    } else if (order.status === 'CANCELLED') {
      dayData.cancelledOrders += 1;
    }
    
    if (order.status !== 'CANCELLED') {
      dayData.revenue += (order.totalAmount || 0);
      const itemsQty = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
      dayData.itemsSold += itemsQty;
    }
  });

  
  const dailyStatsList = Object.values(dailyStatsMap).sort((a, b) => b.date.localeCompare(a.date));

  
  const userStatsList = users
    .map(user => {
      
      const userOrders = orders.filter(o => o.userId === user.id);
      const userActiveOrders = userOrders.filter(o => o.status !== 'CANCELLED');
      const spent = userActiveOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        ...user,
        orderCount: userOrders.length,
        activeOrderCount: userActiveOrders.length,
        totalSpent: spent
      };
    });

  
  const filteredUserStats = userSearch.trim() === ''
    ? userStatsList
    : userStatsList.filter(u => 
        u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.phone && u.phone.includes(userSearch))
      );

  const labelClass = "text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="space-y-6 animate-fade-in">
      {}
      <div className="bg-white p-6 rounded-[32px] border border-gray-150 shadow-premium flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
            📊 Trung Tâm Quản Trị & Báo Cáo
          </h2>
          <p className="text-sm text-gray-550 mt-1">
            Báo cáo thống kê bán hàng theo ngày, theo dõi doanh thu thực và quản lý hồ sơ mua sắm của khách hàng (Trainer).
          </p>
        </div>
        
        {}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-150 shadow-inner">
          <button
            onClick={() => setSubTab('sales')}
            className={`px-4.5 py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
              subTab === 'sales' ? 'bg-[#e53935] text-white shadow' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            📈 DOANH THU THEO NGÀY
          </button>
          <button
            onClick={() => setSubTab('users')}
            className={`px-4.5 py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
              subTab === 'users' ? 'bg-[#e53935] text-white shadow' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            👤 THÀNH VIÊN & ADMIN
          </button>
        </div>
      </div>

      {}
      {subTab === 'sales' && (
        <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:border-red-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Doanh Thu Thực Tế</span>
              <span className="text-2xl font-black text-[#e53935] mt-1 block">
                ${completedRevenue.toFixed(2)}
              </span>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">
                Từ các đơn hàng thành công (COMPLETED)
              </span>
            </div>

            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:border-red-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Doanh Thu Dự Kiến</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">
                ${totalRevenue.toFixed(2)}
              </span>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">
                Gồm tất cả đơn (trừ đơn Hủy)
              </span>
            </div>

            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:border-red-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tổng Sản Phẩm Đã Bán</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {totalItemsSold} món
              </span>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">
                Tổng số lượng card, plushies, figures
              </span>
            </div>

            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:border-red-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tổng Đơn Hàng</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {orders.length} đơn
              </span>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">
                Hủy: {orders.filter(o => o.status === 'CANCELLED').length} đơn ({((orders.filter(o => o.status === 'CANCELLED').length / (orders.length || 1)) * 100).toFixed(0)}%)
              </span>
            </div>

          </div>

          {}
          <div className="bg-white border border-gray-150 rounded-[32px] p-6.5 shadow-premium space-y-5">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-150">
              📅 Bảng Thống Kê Doanh Thu Mỗi Ngày
            </h3>

            {dailyStatsList.length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center py-8">Chưa có dữ liệu đơn hàng nào được ghi nhận.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                      <th className="py-3.5 px-4">Ngày giao dịch</th>
                      <th className="py-3.5 px-4 text-center">Tổng đơn đặt</th>
                      <th className="py-3.5 px-4 text-center text-emerald-700">Đơn thành công</th>
                      <th className="py-3.5 px-4 text-center text-red-600">Đơn đã hủy</th>
                      <th className="py-3.5 px-4 text-center text-indigo-600">Sản phẩm bán được</th>
                      <th className="py-3.5 px-4 text-right pr-6 text-gray-900">Doanh thu ngày ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-bold text-xs text-gray-700">
                    {dailyStatsList.map(item => (
                      <tr key={item.date} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-gray-900 font-black">{item.date}</td>
                        <td className="py-3.5 px-4 text-center">{item.totalOrders}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-600">
                          {item.completedOrders}
                        </td>
                        <td className="py-3.5 px-4 text-center text-rose-500">
                          {item.cancelledOrders}
                        </td>
                        <td className="py-3.5 px-4 text-center text-indigo-600">{item.itemsSold} sản phẩm</td>
                        <td className="py-3.5 px-4 text-right pr-6 text-[#e53935] font-black text-sm">
                          ${item.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {subTab === 'users' && (
        <div className="space-y-6">
          {}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="bg-white border border-gray-150 rounded-3xl p-4 shadow-premium flex items-center justify-between gap-4 max-w-md flex-grow">
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="Tìm tên Trainer, SĐT, Email..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder-gray-400 transition-all outline-none shadow-xs"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                {userSearch && (
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold" onClick={() => setUserSearch('')}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setAdminFormError('');
                setAdminFormSuccess('');
                setIsCreateAdminModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-3xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              ➕ Thêm Admin Mới
            </button>
          </div>

          {}
          <div className="bg-white border border-gray-150 rounded-[32px] p-6.5 shadow-premium space-y-5">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-150">
              👤 Quản Lý Tài Khoản Thành Viên & Admin
            </h3>

            {filteredUserStats.length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center py-8">Không tìm thấy tài khoản thành viên nào khớp.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                      <th className="py-3 px-4">Thông tin Thành viên</th>
                      <th className="py-3 px-4">Vai trò</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Địa chỉ giao hàng</th>
                      <th className="py-3 px-4 text-center">Số đơn đặt</th>
                      <th className="py-3 px-4 text-right text-gray-900">Tổng chi tiêu ($)</th>
                      <th className="py-3 px-4 text-center pr-6">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-bold text-xs text-gray-700">
                    {filteredUserStats.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        
                        {}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {user.role === 'ADMIN' ? (
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-200 shadow-sm bg-white">
                                <img src="/images/admin_logo.png" alt="Admin Logo" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#e53935] to-red-400 text-white flex items-center justify-center font-black text-xs shadow-sm`}>
                                {user.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900">@{user.username}</span>
                              <span className="text-[10px] text-gray-400 font-bold mt-0.5">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        {}
                        <td className="py-4 px-4">
                          {user.role === 'ADMIN' ? (
                            <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                              🛡️ ADMIN
                            </span>
                          ) : (
                            <span className="text-[9px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                              🎮 USER
                            </span>
                          )}
                        </td>

                        {}
                        <td className="py-4 px-4 font-mono">{user.phone || 'N/A'}</td>

                        {}
                        <td className="py-4 px-4 font-semibold text-gray-500 max-w-[200px] truncate" title={user.shippingAddress}>
                          {user.shippingAddress || 'Chưa cập nhật'}
                        </td>

                        {}
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-black uppercase tracking-wider">
                            {user.orderCount} đơn
                          </span>
                        </td>

                        {}
                        <td className="py-4 px-4 text-right text-[#e53935] font-black text-sm">
                          ${user.totalSpent.toFixed(2)}
                        </td>

                        {}
                        <td className="py-4 px-4 text-center pr-6 flex items-center justify-center gap-2 flex-wrap min-w-[200px]">
                          <button
                            onClick={() => setSelectedUserForOrders(user)}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 hover:bg-indigo-600 text-indigo-755 hover:text-white border border-indigo-100 hover:border-indigo-600 transition-all duration-250 cursor-pointer hover:scale-105"
                          >
                            XEM ĐƠN
                          </button>

                          {user.id === activeUser?.id ? (
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-gray-100 text-gray-400 border border-gray-250 uppercase cursor-not-allowed">
                              Tài khoản của bạn
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUpdateRole(user.id, user.role)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-250 cursor-pointer hover:scale-105 uppercase ${
                                user.role === 'ADMIN'
                                  ? 'bg-amber-50 hover:bg-amber-600 text-amber-705 hover:text-white border border-amber-200 hover:border-amber-600'
                                  : 'bg-purple-50 hover:bg-purple-600 text-purple-755 hover:text-white border border-purple-100 hover:border-purple-600'
                              }`}
                            >
                              {user.role === 'ADMIN' ? 'Hạ cấp USER' : 'Nâng cấp ADMIN'}
                            </button>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {}
      {selectedUserForOrders && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedUserForOrders(null)}
          />
          
          <div className="bg-white rounded-[32px] border border-gray-150 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden z-10 flex flex-col transform scale-100 transition-all duration-300 animate-scale-in">
            {}
            <div className="bg-[#e53935] text-white px-7 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Lịch Sử Mua Hàng</h3>
                <p className="text-[10px] opacity-80 font-bold">Trainer: @{selectedUserForOrders.username} ({selectedUserForOrders.email})</p>
              </div>
              <button 
                onClick={() => setSelectedUserForOrders(null)}
                className="text-white hover:text-gray-200 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>
            
            {}
            <div className="p-7 overflow-y-auto space-y-5 flex-grow bg-gray-50/50">
              {orders.filter(o => o.userId === selectedUserForOrders.id).length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-bold bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-3xl">📦</p>
                  <p className="text-xs mt-2">Trainer này chưa thực hiện đơn hàng nào.</p>
                </div>
              ) : (
                orders.filter(o => o.userId === selectedUserForOrders.id).map(order => {
                  const statusColors = {
                    PENDING: 'bg-amber-50 text-amber-705 border-amber-200',
                    PROCESSING: 'bg-blue-50 text-blue-705 border-blue-200',
                    SHIPPED: 'bg-indigo-50 text-indigo-705 border-indigo-200',
                    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-250',
                    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200'
                  };
                  
                  return (
                    <div key={order.id} className="bg-white border border-gray-150 rounded-3xl p-5 shadow-premium space-y-4 text-left transition-all duration-200 hover:border-red-100/50">
                      {}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-905">Đơn hàng #{order.id}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {order.createdAt ? order.createdAt.replace('T', ' ').substring(0, 16) : ''}
                          </span>
                        </div>
                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[order.status] || 'bg-gray-50 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      {}
                      <div className="text-[10px] text-gray-500 font-semibold grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 bg-gray-50/50 border border-gray-100 rounded-2xl p-3.5 shadow-inner">
                        <p>👤 Người nhận: <span className="font-extrabold text-gray-700">{order.recipientName}</span></p>
                        <p>📞 Số điện thoại: <span className="font-extrabold text-gray-700">{order.phone}</span></p>
                        <p className="col-span-full">📍 Địa chỉ: <span className="font-extrabold text-gray-700">{order.shippingAddress}</span></p>
                        {order.note && <p className="col-span-full">📝 Ghi chú: <span className="font-extrabold text-gray-700">{order.note}</span></p>}
                      </div>
                      
                      {}
                      <div className="space-y-2">
                        {order.items && order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-100/50 last:border-0 pb-1.5 last:pb-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 font-bold">SL: {item.quantity}x</span>
                              <span className="text-gray-800 font-extrabold">{item.product?.name}</span>
                            </div>
                            <span className="text-gray-955 font-black">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {}
                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 font-black text-xs">
                        <span className="text-gray-400 uppercase text-[9px] tracking-wider">Tổng tiền thanh toán ({order.paymentMethod}):</span>
                        <span className="text-[#e53935] text-sm">${order.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {}
            <div className="border-t border-gray-150 p-4 flex justify-end bg-white">
              <button 
                onClick={() => setSelectedUserForOrders(null)}
                className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#e53935] hover:bg-[#d32f2f] text-white shadow-md hover:shadow-lg cursor-pointer transition-all duration-200"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsCreateAdminModalOpen(false)}
          />
          
          <div className="bg-white rounded-[32px] border border-gray-150 shadow-2xl max-w-md w-full overflow-hidden z-10 flex flex-col transform scale-100 transition-all duration-300 animate-scale-in">
            {}
            <div className="bg-emerald-600 text-white px-7 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">➕ Tạo Tài Khoản Admin</h3>
                <p className="text-[10px] opacity-80 font-bold">Thêm tài khoản quản trị hệ thống mới</p>
              </div>
              <button 
                onClick={() => setIsCreateAdminModalOpen(false)}
                className="text-white hover:text-gray-200 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>
            
            {}
            <form onSubmit={handleCreateAdmin} className="p-7 space-y-4 text-left bg-gray-50/50">
              {adminFormError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3.5 rounded-2xl">
                  ⚠️ {adminFormError}
                </div>
              )}
              {adminFormSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-bold p-3.5 rounded-2xl">
                  ✅ {adminFormSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className={labelClass}>Username</label>
                <input
                  type="text"
                  required
                  placeholder="Tên tài khoản (ví dụ: admin_ketoan)"
                  className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl px-4 py-2.5 text-xs text-gray-800 outline-none transition-all shadow-xs"
                  value={adminFormData.username}
                  onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="Địa chỉ Email (ví dụ: name@pokecardstore.com)"
                  className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl px-4 py-2.5 text-xs text-gray-800 outline-none transition-all shadow-xs"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Mật khẩu</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl px-4 py-2.5 text-xs text-gray-800 outline-none transition-all shadow-xs"
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Số điện thoại liên lạc"
                  className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl px-4 py-2.5 text-xs text-gray-800 outline-none transition-all shadow-xs"
                  value={adminFormData.phone}
                  onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Địa chỉ làm việc/Giao hàng</label>
                <input
                  type="text"
                  placeholder="Địa chỉ văn phòng/cửa hàng"
                  className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl px-4 py-2.5 text-xs text-gray-800 outline-none transition-all shadow-xs"
                  value={adminFormData.shippingAddress}
                  onChange={(e) => setAdminFormData({ ...adminFormData, shippingAddress: e.target.value })}
                />
              </div>

              {}
              <div className="pt-3 flex justify-end gap-3 border-t border-gray-150 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-black bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 cursor-pointer"
                >
                  HUỶ BỎ
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  TẠO ADMIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
