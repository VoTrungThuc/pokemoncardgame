import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLoginSuccess }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    shippingAddress: '',
    role: 'USER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Tên đăng nhập không được để trống.');
      return false;
    }
    if (formData.username.trim().length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return false;
    }
    if (!isLogin) {
      if (!formData.email.trim()) {
        setError('Email không được để trống.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Email không đúng định dạng.');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Số điện thoại không được để trống.');
        return false;
      }
    }
    if (!formData.password) {
      setError('Mật khẩu không được để trống.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(formData.username, formData.password);
        onLoginSuccess(user);
      } else {
        await register(
          formData.username,
          formData.email,
          formData.password,
          formData.phone,
          formData.shippingAddress,
          formData.role
        );
        const user = await login(formData.username, formData.password);
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const resData = err.response.data;
        if (resData.message === 'Validation failed' && resData.data && typeof resData.data === 'object') {
          const errors = Object.values(resData.data).join(', ');
          setError(`Lỗi xác thực: ${errors}`);
        } else if (resData.message) {
          setError(resData.message);
        } else {
          setError(JSON.stringify(resData));
        }
      } else {
        setError('Không thể kết nối. Vui lòng kiểm tra lại server backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-3 text-sm text-gray-855 placeholder-gray-400 transition-all outline-none shadow-xs";
  const labelClass = "text-[10px] font-black text-gray-455 uppercase tracking-widest block mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {}
      <div className="absolute top-1/6 left-1/6 w-80 h-80 bg-red-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/6 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-gray-150 rounded-[32px] p-8 md:p-10 shadow-2xl space-y-6 animate-scale-in">
        <div className="text-center space-y-2.5 flex flex-col items-center">
          
          {}
          <div className="w-14 h-14 rounded-full border-[4px] border-gray-850 bg-[#e53935] relative overflow-hidden flex items-center justify-center after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1/2 after:bg-white after:border-t-[4px] after:border-gray-850 before:content-[''] before:absolute before:z-10 before:w-4 before:h-4 before:rounded-full before:bg-white before:border-[4px] before:border-gray-855 shadow-md mb-2 transition-transform duration-500 hover:rotate-180">
          </div>
          
          <h2 className="text-2xl font-black tracking-tight text-gray-950">
            {isLogin ? 'PokeCard Store – Đăng Nhập' : 'Tạo Tài Khoản Trainer'}
          </h2>
          <p className="text-[10px] text-gray-450 font-extrabold uppercase tracking-wider">
            {isLogin ? 'Đăng nhập để mua sắm & sưu tầm Pokemon' : 'Tham gia cộng đồng Pokemon chính hãng'}
          </p>
        </div>

        {}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-150 shadow-inner">
          <button
            type="button"
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
              isLogin ? 'bg-[#e53935] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
              !isLogin ? 'bg-[#e53935] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-[#e53935] text-xs font-bold px-4 py-3 rounded-2xl animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={labelClass}>Tên Đăng Nhập (Username)</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="e.g. ash_ketchum"
              className={inputClass}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className={labelClass}>Địa Chỉ Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. ash@kanto.com"
                  className={inputClass}
                  required={!isLogin}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Số Điện Thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 0909123456"
                  className={inputClass}
                  required={!isLogin}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Địa Chỉ Mặc Định (Để giao hàng)</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="e.g. 123 Pallet Town, Kanto"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className={labelClass}>Mật Khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#e53935] hover:bg-[#d32f2f] active:bg-[#b71c1c] disabled:opacity-50 text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 glow-effect cursor-pointer mt-4 uppercase tracking-widest"
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="text-xs text-[#e53935] hover:text-[#d32f2f] font-black transition-colors cursor-pointer"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
