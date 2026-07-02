import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/png?seed=Ash',
  'https://api.dicebear.com/7.x/pixel-art/png?seed=Misty',
  'https://api.dicebear.com/7.x/pixel-art/png?seed=Red',
  'https://api.dicebear.com/7.x/pixel-art/png?seed=Brock',
  'https://api.dicebear.com/7.x/pixel-art/png?seed=Cynthia',
];

export default function Profile({ activeUser }) {
  const { refreshProfile, updateProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(activeUser?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(activeUser?.shippingAddress || '');
  const [avatarUrl, setAvatarUrl] = useState(activeUser?.avatarUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [userOrders, updatedProfile] = await Promise.all([
          api.getOrders(),
          refreshProfile()
        ]);
        setOrders(userOrders || []);
        if (updatedProfile) {
          setPhone(updatedProfile.phone || '');
          setShippingAddress(updatedProfile.shippingAddress || '');
          setAvatarUrl(updatedProfile.avatarUrl || '');
        }
      } catch (err) {
        console.error('Không thể tải thông tin profile', err);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({
        phone: phone.trim(),
        shippingAddress: shippingAddress.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setSuccess(true);
      setIsEditing(false);
      // Auto-hide success notification after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Header Info Card */}
      <div className="bg-white border border-gray-150 rounded-[32px] p-8 shadow-premium flex flex-col md:flex-row items-center gap-6 transition-all duration-300 hover:border-red-100/50 hover:shadow-premium-hover relative">
        {activeUser.avatarUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-[3px] border-white ring-4 ring-red-100 transition-transform duration-300 hover:scale-105 bg-white shrink-0">
            <img 
              src={activeUser.avatarUrl} 
              alt={activeUser.username} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = isAdmin ? '/images/admin_logo.png' : 'https://api.dicebear.com/7.x/pixel-art/png?seed=Ash';
              }}
            />
          </div>
        ) : isAdmin ? (
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-[3px] border-white ring-4 ring-red-100 transition-transform duration-300 hover:scale-105 bg-white shrink-0">
            <img src="/images/admin_logo.png" alt="Admin Logo" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#e53935] to-red-500 flex items-center justify-center text-3xl font-black text-white shadow-md border-[3px] border-white ring-4 ring-red-100 transition-transform duration-300 hover:scale-105 shrink-0">
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

        {/* Edit Button in Header */}
        {!isEditing && (
          <button 
            onClick={() => {
              setIsEditing(true);
              setPhone(activeUser.phone || '');
              setShippingAddress(activeUser.shippingAddress || '');
              setAvatarUrl(activeUser.avatarUrl || '');
              setError(null);
            }}
            className="absolute top-6 right-6 px-4 py-2 bg-gray-50 hover:bg-red-50 text-gray-650 hover:text-[#e53935] border border-gray-200 hover:border-red-200 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            ✏️ Chỉnh sửa thông tin
          </button>
        )}
      </div>

      {/* Success & Error alerts */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-bold rounded-2xl shadow-sm animate-scale-in">
          ✅ Cập nhật thông tin cá nhân thành công!
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-[#e53935] text-xs font-bold rounded-2xl shadow-sm animate-scale-in">
          ⚠️ {error}
        </div>
      )}

      {/* Stats row */}
      {!isAdmin && (
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
      )}

      {/* Information Panels */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-gray-150 rounded-[32px] p-8 shadow-premium space-y-6 animate-scale-in">
          <h3 className="text-base font-black text-gray-900 tracking-wide pb-2 border-b border-gray-100">
            Chỉnh sửa thông tin cá nhân
          </h3>

          <div className="space-y-4">
            {/* Predefined Avatars Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Chọn ảnh đại diện có sẵn</label>
              <div className="flex flex-wrap gap-3">
                {PREDEFINED_AVATARS.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 cursor-pointer shrink-0 ${
                      avatarUrl === url ? 'border-[#e53935] ring-2 ring-red-100 scale-105' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover rounded-full bg-gray-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Avatar Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Hoặc dán URL ảnh đại diện tùy chỉnh</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-2.5 text-xs text-gray-800 outline-none transition-all"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Số điện thoại</label>
              <input
                type="text"
                placeholder="Nhập số điện thoại liên lạc"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-2.5 text-xs text-gray-800 outline-none transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Shipping Address Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Địa chỉ giao hàng</label>
              <textarea
                placeholder="Nhập địa chỉ nhận hàng chi tiết"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-3 text-xs text-gray-800 outline-none transition-all resize-none"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-2xl text-xs font-black bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all cursor-pointer"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#e53935] hover:bg-[#d32f2f] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Read-only Personal Information */}
          <div className="bg-white border border-gray-150 rounded-[32px] p-6.5 shadow-premium space-y-4">
            <h3 className="text-base font-black text-gray-900 tracking-wide pb-2 border-b border-gray-100">
              Thông tin cá nhân
            </h3>
            <div className="space-y-3.5 text-xs text-gray-650 font-bold">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-450 font-normal">Số điện thoại:</span>
                <span className="text-gray-900 font-mono">{activeUser.phone || 'Chưa cập nhật ⚠️'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-450 font-normal">Địa chỉ giao hàng:</span>
                <span className="text-gray-900 text-right max-w-[300px] truncate" title={activeUser.shippingAddress}>
                  {activeUser.shippingAddress || 'Chưa cập nhật ⚠️'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-450 font-normal">Số dư tài khoản:</span>
                <span className="text-emerald-600 font-black">${(activeUser.balance || 0.0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Security details */}
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
        </>
      )}
    </div>
  );
}
