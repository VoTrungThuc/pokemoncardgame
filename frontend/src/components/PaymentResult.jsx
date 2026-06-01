import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function PaymentResult() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); 
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(queryParams.entries());
    
    const verifyPayment = async () => {
      try {
        const response = await api.verifyPaymentCallback(params);
        setOrderId(response.orderId);
        
        if (response.success) {
          setStatus('success');
          setMessage('Chúc mừng! Đơn hàng của bạn đã được thanh toán thành công qua VNPay.');
        } else {
          setStatus('failure');
          setMessage('Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác thực giao dịch thanh toán.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  const handleGoHome = () => {
    
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 border-4 border-[#e53935] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-650 font-black text-sm uppercase tracking-widest">Đang xác thực giao dịch VNPay...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-[32px] p-8 text-center shadow-premium space-y-6">
        
        {status === 'success' ? (
          <>
            <div className="mx-auto w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-4xl shadow-sm text-emerald-600 animate-bounce">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Thanh Toán Thành Công!</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mã Đơn Hàng: #{orderId}</p>
            </div>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              {message} Đơn hàng của bạn đã được xác nhận và đang chờ cửa hàng đóng gói để vận chuyển.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-4xl shadow-sm text-[#e53935] animate-pulse">
              ✗
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Thanh Toán Thất Bại</h2>
              {orderId && <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Mã Đơn Hàng: #{orderId}</p>}
            </div>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              {message} Vui lòng thử lại hoặc chọn hình thức thanh toán khác khi nhận hàng (COD).
            </p>
          </>
        )}

        <div className="h-px bg-gray-100" />

        <button
          onClick={handleGoHome}
          className="w-full py-3.5 bg-[#e53935] hover:bg-[#d32f2f] text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-wider cursor-pointer"
        >
          🎮 Quay lại Cửa Hàng
        </button>
      </div>
    </div>
  );
}
