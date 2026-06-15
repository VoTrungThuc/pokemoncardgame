import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLoginSuccess }) {
  const { login, register, verifyOtp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
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
  const [showPassword, setShowPassword] = useState(false);

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
        setShowOtpStep(true);
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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (otpCode.length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số.');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(formData.email, otpCode);
      const user = await login(formData.username, formData.password);
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const resData = err.response.data;
        if (resData.message) {
          setError(resData.message);
        } else {
          setError(JSON.stringify(resData));
        }
      } else {
        setError('Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full bg-white border border-gray-200
    focus:border-[#e53935] focus:ring-2 focus:ring-red-100
    rounded-2xl px-4 py-3.5 text-sm text-gray-800
    placeholder-gray-400 transition-all outline-none shadow-sm
    hover:border-gray-300
  `;
  const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-[0.14em] block mb-1.5";

  const features = [
    { icon: '🎴', text: 'Thẻ bài Pokemon TCG chính hãng' },
    { icon: '📦', text: 'Pack Sealed Box chưa mở' },
    { icon: '🧸', text: 'Gấu bông & Mô hình Pokemon Center' },
    { icon: '🚀', text: 'Giao hàng hỏa tốc toàn quốc' },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT HERO PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-animated pokeball-bg pokemon-pattern flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute w-72 h-72 rounded-full border-[40px] border-white/5 -top-20 -right-20 animate-spin-slow" />
        <div className="absolute w-48 h-48 rounded-full border-[30px] border-white/5 -bottom-16 -left-16 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        <div className="absolute w-32 h-32 rounded-full bg-white/5 top-1/3 right-8 animate-float" />

        {/* Pokeball large */}
        <div className="relative mb-8 animate-float">
          <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/30 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1/2 flex items-center justify-center">
              <span className="text-5xl drop-shadow-lg">⚡</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white/10 border-t-4 border-white/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/20 border-4 border-white/40" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl xl:text-5xl font-black text-white text-center leading-tight mb-3">
          Poke<span className="text-yellow-300">Card</span>
          <br/>
          <span className="text-white/80 font-light text-3xl">Store</span>
        </h1>
        <p className="text-white/70 text-sm font-bold text-center mb-10 max-w-xs leading-relaxed">
          Thiên đường thẻ bài &amp; đồ chơi Pokemon chính hãng dành cho Trainer Việt Nam
        </p>

        {/* Feature list */}
        <div className="w-full max-w-xs space-y-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/15 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-xl flex-shrink-0">{f.icon}</span>
              <span className="text-white/90 text-xs font-bold">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div className="mt-10 flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-wider">
          <div className="w-8 h-0.5 bg-white/20 rounded" />
          100% Chính Hãng · Uy Tín · Chất Lượng
          <div className="w-8 h-0.5 bg-white/20 rounded" />
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-50/50 relative overflow-hidden">
        {/* Subtle background blobs */}
        <div className="absolute top-1/5 left-1/5 w-64 h-64 bg-red-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/5 right-1/5 w-80 h-80 bg-amber-400/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-full bg-[#e53935] border-[3px] border-gray-800 relative overflow-hidden flex items-center justify-center shadow-lg">
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white border-t-[2.5px] border-gray-800" />
              <div className="absolute z-10 w-3 h-3 rounded-full bg-white border-[2px] border-gray-800" />
            </div>
            <span className="text-2xl font-black text-gray-900">
              Poke<span className="text-[#e53935]">Card</span> Store
            </span>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-[0_8px_48px_rgba(0,0,0,0.08)] space-y-6 animate-scale-in">

            {showOtpStep ? (
              <>
                {/* Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">
                    Xác Thực OTP 🔐
                  </h2>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email <strong className="text-gray-700">{formData.email}</strong>. Vui lòng nhập mã để hoàn thành đăng ký.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-[#e53935] text-xs font-bold px-4 py-3 rounded-2xl animate-fade-in flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Mã Xác Thực OTP</label>
                    <input
                      type="text"
                      name="otpCode"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                      }}
                      placeholder="******"
                      className="w-full bg-white border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-3.5 text-center text-2xl font-black tracking-[0.5em] text-gray-800 placeholder-gray-300 outline-none transition-all shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 gradient-animated hover:opacity-90 disabled:opacity-50 text-white text-sm font-black rounded-2xl shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-200 transition-all duration-300 glow-effect cursor-pointer mt-2 uppercase tracking-widest btn-press relative overflow-hidden"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xác thực...
                      </span>
                    ) : (
                      '🔐 Xác Nhận OTP'
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-[#e53935] font-bold transition-colors cursor-pointer"
                    onClick={() => {
                      setShowOtpStep(false);
                      setError('');
                      setOtpCode('');
                    }}
                  >
                    ← Quay lại đăng ký
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">
                    {isLogin ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản Trainer 🎮'}
                  </h2>
                  <p className="text-xs text-gray-400 font-semibold">
                    {isLogin
                      ? 'Đăng nhập để khám phá bộ sưu tập Pokemon'
                      : 'Tham gia cộng đồng Trainer Pokemon Việt Nam'}
                  </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                  {[{ label: 'Đăng Nhập', value: true }, { label: 'Đăng Ký', value: false }].map(({ label, value }) => (
                    <button
                      key={label}
                      type="button"
                      className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
                        isLogin === value
                          ? 'bg-[#e53935] text-white shadow-lg shadow-red-100'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => { setIsLogin(value); setError(''); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-[#e53935] text-xs font-bold px-4 py-3 rounded-2xl animate-fade-in flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className={labelClass}>Tên Đăng Nhập</label>
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

                  {/* Register fields */}
                  {!isLogin && (
                    <>
                      <div className="space-y-1.5">
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

                      <div className="space-y-1.5">
                        <label className={labelClass}>Số Điện Thoại</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="e.g. 0909 123 456"
                          className={inputClass}
                          required={!isLogin}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelClass}>Địa Chỉ Giao Hàng</label>
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

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className={labelClass}>Mật Khẩu</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`${inputClass} pr-12`}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e53935] transition-colors cursor-pointer text-sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 gradient-animated hover:opacity-90 disabled:opacity-50 text-white text-sm font-black rounded-2xl shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-200 transition-all duration-300 glow-effect cursor-pointer mt-2 uppercase tracking-widest btn-press relative overflow-hidden"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                      </span>
                    ) : (
                      isLogin ? '🚀 Đăng Nhập' : '✨ Đăng Ký Tài Khoản'
                    )}
                  </button>
                </form>

                {/* Switch mode */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-[#e53935] font-bold transition-colors cursor-pointer"
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  >
                    {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <span className="text-[#e53935] font-black underline underline-offset-2">
                      {isLogin ? 'Đăng ký ngay →' : 'Đăng nhập →'}
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-50">
              {['🔒 Bảo mật SSL', '✅ Chính hãng', '⚡ Nhanh chóng'].map((b, i) => (
                <span key={i} className="text-[9px] text-gray-400 font-bold">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
