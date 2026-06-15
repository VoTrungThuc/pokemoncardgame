import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Orders({ activeUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      const sorted = (data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeUser]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      alert(`🎉 Đã cập nhật trạng thái đơn hàng #${orderId} thành "${newStatus}"!`);
    } catch (err) {
      alert('Không thể cập nhật trạng thái đơn hàng.');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-750 border-yellow-250';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-750 border-blue-250';
      case 'SHIPPED':
        return 'bg-sky-50 text-sky-750 border-sky-250';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'CANCELLED':
        return 'bg-red-50 text-[#e53935] border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPaymentLabel = (method) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'E_WALLET':
        return 'Ví điện tử';
      case 'GACHA':
        return '🎟️ Đổi từ thẻ Gacha (Miễn phí)';
      case 'AUCTION':
        return '🔨 Thanh toán bằng Số Dư Đấu Giá';
      default:
        return method;
    }
  };

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

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-150 rounded-[32px] shadow-premium animate-fade-in">
        <div className="text-5xl animate-spin text-[#e53935] font-light">◓</div>
        <p className="text-gray-400 text-xs mt-4 font-black tracking-wider uppercase">Đang tải đơn hàng...</p>
      </div>
    );
  }

  const isAdmin = activeUser?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>📦</span> {isAdmin ? 'Quản Lý Đơn Hàng' : 'Lịch Sử Đơn Hàng'}
        </h2>
        <button 
          type="button"
          onClick={fetchOrders}
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

      {orders.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white border border-gray-150 rounded-[32px] shadow-premium space-y-5">
          <div className="text-7xl opacity-40">📦</div>
          <h3 className="text-lg font-black text-gray-900">Chưa có đơn hàng nào</h3>
          <p className="text-xs text-gray-500 font-bold leading-relaxed">
            {isAdmin ? 'Chưa có khách hàng nào đặt đơn hàng trên hệ thống.' : 'Hãy khám phá cửa hàng PokeCard Store và đặt đơn hàng đầu tiên của bạn!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white border border-gray-150 rounded-[32px] p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 space-y-6 hover:border-red-100/50"
            >
              {}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3.5 border-b border-gray-100">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-gray-950 flex items-center gap-2 flex-wrap">
                    <span>Đơn hàng #{order.id}</span>
                    {order.paymentMethod === 'GACHA' && (
                      <span className="bg-red-50 text-[#e53935] border border-red-200 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                        🎟️ Đổi Thẻ Gacha
                      </span>
                    )}
                    {order.paymentMethod === 'AUCTION' && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                        🔨 Đơn Đấu Giá
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold block">{formatTime(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>

                  {}
                  {isAdmin && (
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-gray-50 border border-gray-200 focus:border-[#e53935] text-[10px] font-black uppercase tracking-wider text-gray-700 rounded-xl px-3 py-1.5 transition-all cursor-pointer outline-none hover:bg-gray-100"
                    >
                      <option value="PENDING">Chờ xử lý (Pending)</option>
                      <option value="PROCESSING">Đang xử lý (Processing)</option>
                      <option value="SHIPPED">Đang giao (Shipped)</option>
                      <option value="COMPLETED">Thành công (Completed)</option>
                      <option value="CANCELLED">Hủy bỏ (Cancelled)</option>
                    </select>
                  )}
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {}
                <div className="md:col-span-7 space-y-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Sản Phẩm Đã Mua</span>
                  <div className="space-y-2">
                    {order.items?.map((item) => {
                      const isNonCard = ['Sealed', 'Plush', 'Figure', 'Accessory'].includes(item.product?.cpu);
                      return (
                        <div 
                          key={item.id} 
                          className="bg-gray-550 border border-gray-100 rounded-2xl p-3 flex items-center justify-between gap-4 transition-all duration-200 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-white border border-gray-150 flex items-center justify-center p-1.5 flex-shrink-0 transition-transform duration-350 hover:scale-105">
                              <img 
                                src={item.product?.imageUrl} 
                                alt={item.product?.name} 
                                className="max-h-full max-w-full object-contain rounded"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = isNonCard ? '/images/booster_box_151.png' : 'https://images.pokemontcg.io/xy12/1.png';
                                }}
                              />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-black text-gray-900 text-xs truncate" title={item.product?.name}>
                                {item.product?.name || 'Sản phẩm Pokemon'}
                              </p>
                              <span className="text-[9px] text-gray-400 block font-bold">
                                SL: {item.quantity} × {order.paymentMethod === 'GACHA' ? '$0.00 (Đổi Gacha)' : `$${item.price?.toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-[#e53935] text-xs whitespace-nowrap">
                            {order.paymentMethod === 'GACHA' ? 'Miễn phí' : `$${(item.price * item.quantity).toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {}
                <div className="md:col-span-5 space-y-4 bg-gray-50/60 border border-gray-150 rounded-[24px] p-5 shadow-inner">
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-200 pb-2">Thông Tin Giao Nhận</span>
                    <div className="text-xs space-y-2 text-gray-650 font-bold leading-relaxed">
                      <p className="flex items-center gap-2">👤 <span className="text-gray-400 font-normal">Người nhận:</span> <span className="text-gray-900 font-black">{order.recipientName}</span></p>
                      <p className="flex items-center gap-2">📞 <span className="text-gray-400 font-normal">SĐT:</span> <span className="text-gray-900 font-black">{order.phone}</span></p>
                      <p className="flex items-start gap-2">📍 <span className="text-gray-400 font-normal flex-shrink-0">Địa chỉ:</span> <span className="text-gray-800">{order.shippingAddress}</span></p>
                      {order.note && <p className="flex items-start gap-2">📝 <span className="text-gray-400 font-normal flex-shrink-0">Ghi chú:</span> <span className="text-gray-800 font-medium italic">{order.note}</span></p>}
                      <p className="flex items-center gap-2">💳 <span className="text-gray-400 font-normal">Hình thức:</span> <span className="text-gray-850 font-black">{getPaymentLabel(order.paymentMethod)}</span></p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tổng tiền:</span>
                    <span className="text-xl font-black text-[#e53935]">
                      {order.paymentMethod === 'GACHA' ? '$0.00 (Miễn phí)' : `$${order.totalAmount?.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
