import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function Checkout({ onBackToCart, onOrderSuccess }) {
  const { cartItems, totalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    shippingAddress: '',
    note: '',
    paymentMethod: 'COD',
    deliveryType: 'ONLINE_COLLECTION'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);
  const [vnpayUrl, setVnpayUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (formData.deliveryType === 'ONLINE_COLLECTION') return true;

    if (!formData.recipientName.trim()) {
      setError('Vui lòng nhập họ tên người nhận.');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại liên hệ.');
      return false;
    }
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số).');
      return false;
    }
    if (!formData.shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        recipientName: formData.deliveryType === 'ONLINE_COLLECTION' ? 'Online Store' : formData.recipientName,
        phone: formData.deliveryType === 'ONLINE_COLLECTION' ? '0000000000' : formData.phone,
        shippingAddress: formData.deliveryType === 'ONLINE_COLLECTION' ? 'Online Store' : formData.shippingAddress,
        note: formData.note,
        paymentMethod: formData.paymentMethod,
        deliveryType: formData.deliveryType
      };

      const createdOrder = await api.placeOrder(payload);
      
      
      if (formData.paymentMethod === 'COD') {
        await clearCart();
        onOrderSuccess();
      } else if (formData.paymentMethod === 'VNPAY') {
        
        const paymentUrl = await api.createPaymentUrl(createdOrder.id);
        await clearCart();
        setNewOrderId(createdOrder.id);
        setVnpayUrl(paymentUrl);
      } else {
        
        setNewOrderId(createdOrder.id);
        setShowPaymentModal(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng kiểm tra lại số lượng tồn kho.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      await clearCart();
      setShowPaymentModal(false);
      onOrderSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  
  const exchangeRate = 25000;
  const amountVnd = Math.round(totalAmount * exchangeRate);

  const inputClass = "w-full bg-white border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-3 text-sm text-gray-850 placeholder-gray-400 transition-all outline-none shadow-xs";
  const labelClass = "text-[10px] font-black text-gray-455 uppercase tracking-widest block mb-1.5";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button 
        onClick={onBackToCart} 
        className="flex items-center gap-2 text-sm font-black text-gray-455 hover:text-[#e53935] transition-colors duration-200 cursor-pointer uppercase tracking-wider"
      >
        ← Quay lại giỏ hàng
      </button>

      <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 pb-3 border-b border-gray-200">
        <span>📋</span> Xác Nhận Đơn Hàng & Thanh Toán
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-150 rounded-[32px] p-6.5 space-y-5 shadow-premium">
            <h3 className="text-base font-black text-gray-900 tracking-wide pb-2 border-b border-gray-100">
              Hình Thức Nhận Thẻ & Giao Hàng
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-[#e53935] text-xs font-bold px-4 py-3 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Delivery Type Options */}
            <div className="space-y-1.5">
              <label className={labelClass}>Hình thức nhận thẻ bài *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'ONLINE_COLLECTION' }))}
                  className={`border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-300 ${
                    formData.deliveryType === 'ONLINE_COLLECTION'
                      ? 'border-[#e53935] bg-red-50/50 text-[#e53935] shadow-xs'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:shadow-xs'
                  }`}
                >
                  <span className="text-2xl">📦</span>
                  <span className="text-[10px] font-black uppercase tracking-wider block">Lưu giữ online</span>
                  <span className="text-[9px] font-bold text-gray-400 leading-tight">Đưa vào bộ sưu tập để trao đổi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'PHYSICAL_SHIPPING' }))}
                  className={`border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-300 ${
                    formData.deliveryType === 'PHYSICAL_SHIPPING'
                      ? 'border-[#e53935] bg-red-50/50 text-[#e53935] shadow-xs'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:shadow-xs'
                  }`}
                >
                  <span className="text-2xl">🚚</span>
                  <span className="text-[10px] font-black uppercase tracking-wider block">Giao hàng vật lý</span>
                  <span className="text-[9px] font-bold text-gray-400 leading-tight">Đóng gói và ship về nhà</span>
                </button>
              </div>
            </div>

            {formData.deliveryType === 'PHYSICAL_SHIPPING' && (
              <>
                <div className="space-y-1">
                  <label className={labelClass}>Họ tên người nhận *</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder="e.g. Nguyễn Văn A"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Số điện thoại liên hệ *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 0909123456"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Địa chỉ nhận hàng *</label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                    className={inputClass}
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className={labelClass}>Ghi chú giao hàng (Không bắt buộc)</label>
              <textarea
                rows="2"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="e.g. Giao giờ hành chính, gọi trước khi đến..."
                className="w-full bg-white border border-gray-200 focus:border-[#e53935] focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-3 text-sm text-gray-850 placeholder-gray-400 transition-all outline-none resize-none shadow-xs"
              />
            </div>
          </div>

          {}
          <div className="bg-white border border-gray-150 rounded-[32px] p-6.5 space-y-5 shadow-premium">
            <h3 className="text-base font-black text-gray-900 tracking-wide pb-2 border-b border-gray-100">
              Phương Thức Thanh Toán
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <label className={`border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-300 ${
                formData.paymentMethod === 'COD' 
                  ? 'border-[#e53935] bg-red-50/50 text-[#e53935] shadow-xs' 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:shadow-xs'
              }`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="COD" 
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleInputChange}
                  className="sr-only" 
                />
                <span className="text-2xl">💵</span>
                <span className="text-[10px] font-black uppercase tracking-wider block">COD</span>
                <span className="text-[9px] font-bold text-gray-400 leading-tight">Thanh toán khi nhận hàng</span>
              </label>

              <label className={`border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-300 ${
                formData.paymentMethod === 'VNPAY' 
                  ? 'border-[#e53935] bg-red-50/50 text-[#e53935] shadow-xs' 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:shadow-xs'
              }`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="VNPAY" 
                  checked={formData.paymentMethod === 'VNPAY'}
                  onChange={handleInputChange}
                  className="sr-only" 
                />
                <span className="text-2xl">🇻🇳</span>
                <span className="text-[10px] font-black uppercase tracking-wider block text-red-600">VNPay</span>
                <span className="text-[9px] font-bold text-gray-400 leading-tight">Cổng thanh toán VNPay</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#e53935] hover:bg-[#d32f2f] active:bg-[#b71c1c] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 glow-effect cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {loading ? 'Đang gửi đơn hàng...' : '🛒 Đặt Hàng Ngay'}
          </button>
        </form>

        {}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-150 rounded-[32px] p-6 space-y-5 shadow-premium">
            <h3 className="text-xs font-black text-gray-450 uppercase tracking-widest pb-2 border-b border-gray-100">
              Chi Tiết Sản Phẩm
            </h3>

            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const price = item.product.promoPrice !== null ? item.product.promoPrice : item.product.price;
                return (
                  <div key={item.id} className="flex gap-3 justify-between items-center text-xs border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-gray-900 truncate">{item.product.name}</p>
                      <span className="text-[10px] text-gray-400 font-bold">SL: {item.quantity} × ${price.toFixed(2)}</span>
                    </div>
                    <span className="font-black text-gray-800">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-gray-100" />

            <div className="space-y-2 text-xs text-gray-500 font-bold">
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span className="text-gray-900 font-black">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-600 font-black">Miễn phí</span>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex justify-between items-baseline py-1">
              <span className="text-sm font-bold text-gray-700">Tổng thanh toán:</span>
              <span className="text-2xl font-black text-[#e53935]">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white border border-gray-150 rounded-[32px] p-6.5 shadow-2xl max-w-md w-full text-center space-y-6 animate-scale-in">
            
            {}
            <div>
              <h3 className="text-lg font-black text-gray-950 flex items-center justify-center gap-2">
                <span>🏦</span> THANH TOÁN CHUYỂN KHOẢN
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 font-bold">
                {formData.paymentMethod === 'BANK_TRANSFER' 
                  ? 'Quét mã VietQR dưới đây để thanh toán tự động qua app ngân hàng.'
                  : 'Sử dụng ví điện tử (Momo, ZaloPay...) để quét mã thanh toán.'
                }
              </p>
            </div>

            {}
            <div className="mx-auto w-52 h-52 bg-white border border-gray-150 rounded-3xl flex items-center justify-center overflow-hidden p-2 shadow-inner relative transition-transform duration-300 hover:scale-105">
              <img
                src={`https://img.vietqr.io/image/MB-123456789999-print.png?amount=${amountVnd}&addInfo=POKECARD%20DH${newOrderId}&accountName=POKECARD%20STORE`}
                alt="QR Code thanh toán"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STK:123456789999-NganHang:MB-SoTien:${amountVnd}-NoiDung:POKECARD%20DH${newOrderId}`;
                }}
              />
            </div>

            {}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4.5 text-left text-xs space-y-2.5 font-bold text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-400 font-normal">Ngân hàng nhận:</span>
                <span className="text-gray-900 font-black">MB Bank (Ngân hàng Quân Đội)</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-400 font-normal">Số tài khoản:</span>
                <span className="text-[#e53935] font-black tracking-wider">1234 5678 9999</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-400 font-normal">Chủ tài khoản:</span>
                <span className="text-gray-900 font-black">POKECARD STORE MANAGEMENT</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-400 font-normal">Số tiền thanh toán:</span>
                <span className="text-[#e53935] font-black text-sm">
                  {amountVnd.toLocaleString('vi-VN')} VNĐ <span className="text-xs text-gray-400 font-normal">(${totalAmount.toFixed(2)})</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-normal">Nội dung chuyển khoản:</span>
                <span className="bg-red-50 text-[#e53935] px-2 py-0.5 rounded border border-red-200 font-black tracking-wide">
                  POKECARD DH{newOrderId}
                </span>
              </div>
            </div>

            {}
            <p className="text-[10px] text-amber-600 font-bold bg-amber-50/50 border border-amber-200/60 rounded-2xl p-3.5 leading-relaxed text-left">
              ⚠️ <strong>Lưu ý:</strong> Vui lòng giữ đúng nội dung chuyển khoản để hệ thống tự động xác nhận đơn hàng của bạn nhanh nhất.
            </p>

            {}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handlePaymentConfirm}
                className="w-full py-3 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-black rounded-2xl shadow-md transition-all hover:shadow-lg cursor-pointer uppercase tracking-wider transition-colors duration-250"
              >
                ✓ Tôi Đã Chuyển Khoản Thành Công
              </button>
              <button
                type="button"
                onClick={handlePaymentConfirm}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-650 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                Thanh toán sau (Vào đơn hàng của tôi)
              </button>
            </div>

          </div>
        </div>
      )}

      {}
      {vnpayUrl && (
        <VNPayModal 
          orderId={newOrderId} 
          paymentUrl={vnpayUrl} 
          onSuccess={onOrderSuccess} 
          onClose={() => setVnpayUrl(null)} 
        />
      )}
    </div>
  );
}

function VNPayModal({ orderId, paymentUrl, onSuccess, onClose }) {
  const [pollingStatus, setPollingStatus] = useState('PENDING');

  useEffect(() => {
    let intervalId = setInterval(async () => {
      try {
        const order = await api.getOrderById(orderId);
        if (order.status !== 'PENDING') {
          setPollingStatus(order.status);
          clearInterval(intervalId);
          if (order.status === 'PROCESSING' || order.status === 'COMPLETED') {
            setTimeout(() => {
              onSuccess();
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative bg-white border border-gray-150 rounded-[32px] p-6.5 shadow-2xl max-w-md w-full text-center space-y-6 animate-scale-in">
        
        {}
        <div>
          <h3 className="text-lg font-black text-gray-950 flex items-center justify-center gap-2">
            <span>🇻🇳</span> THANH TOÁN QUA VNPAY
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 font-bold">
            Quét mã QR dưới đây bằng ứng dụng Mobile Banking hoặc ví VNPay để thanh toán đơn hàng.
          </p>
        </div>

        {}
        <div className="mx-auto w-52 h-52 bg-white border border-gray-150 rounded-3xl flex items-center justify-center overflow-hidden p-2 shadow-inner relative transition-transform duration-300 hover:scale-105">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentUrl)}`}
            alt="VNPay QR Code"
            className="w-full h-full object-contain"
          />
        </div>

        {}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center text-xs font-bold text-gray-700">
          {pollingStatus === 'PENDING' && (
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Đang chờ quét mã thanh toán...</span>
            </div>
          )}
          {(pollingStatus === 'PROCESSING' || pollingStatus === 'COMPLETED') && (
            <div className="text-emerald-600 flex items-center justify-center gap-1.5">
              <span>✓</span>
              <span>Thanh toán thành công! Đang hoàn tất đơn hàng...</span>
            </div>
          )}
          {pollingStatus === 'CANCELLED' && (
            <div className="text-[#e53935] flex items-center justify-center gap-1.5">
              <span>✗</span>
              <span>Giao dịch thanh toán thất bại hoặc đã bị hủy.</span>
            </div>
          )}
        </div>

        {}
        <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
          Hoặc bạn có thể click nút dưới đây để chuyển đến trang thanh toán trực tiếp trên thiết bị này.
        </p>

        {}
        <div className="flex flex-col gap-2 pt-2">
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-black rounded-2xl shadow-md transition-all hover:shadow-lg flex items-center justify-center uppercase tracking-wider transition-colors duration-250"
          >
            💳 Mở trang thanh toán VNPay
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-650 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            Hủy / Chọn hình thức khác
          </button>
        </div>

      </div>
    </div>
  );
}
