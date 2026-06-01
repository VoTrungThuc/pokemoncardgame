import React from 'react';
import { useCart } from '../context/CartContext';

export default function Cart({ onCheckout }) {
  const { 
    cartItems, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    totalAmount, 
    totalItems,
    clearCart 
  } = useCart();

  const handleQtyChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= item.product.stock) {
      try {
        await updateQuantity(item.id, newQty);
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể cập nhật số lượng.');
      }
    }
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      try {
        await removeFromCart(itemId);
      } catch (err) {
        alert('Không thể xóa sản phẩm.');
      }
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-150 rounded-[32px] shadow-premium animate-fade-in">
        <div className="text-5xl animate-spin text-[#e53935] font-light">◓</div>
        <p className="text-gray-400 text-xs mt-4 font-black tracking-wider uppercase">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-gray-150 rounded-[32px] shadow-premium space-y-6 animate-fade-in">
        <div className="text-7xl animate-bounce">🛒</div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-gray-500 font-bold leading-relaxed">
          Hãy khám phá cửa hàng PokeCard Store và thêm các sản phẩm yêu thích vào giỏ hàng ngay!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>🛒</span> Giỏ Hàng Của Bạn
        </h2>
        <button 
          onClick={clearCart}
          className="text-xs font-black text-[#e53935] hover:text-[#d32f2f] transition-colors cursor-pointer uppercase tracking-widest"
        >
          Xóa toàn bộ giỏ hàng 🗑️
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const price = item.product.promoPrice !== null ? item.product.promoPrice : item.product.price;
            const subtotal = price * item.quantity;
            const isNonCard = ['Sealed', 'Plush', 'Figure', 'Accessory'].includes(item.product.cpu);
            
            return (
              <div 
                key={item.id} 
                className="bg-white border border-gray-150 rounded-3xl p-4.5 flex gap-4 items-center justify-between shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:border-red-100"
              >
                {}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-18 h-18 rounded-2xl bg-gray-50 border border-gray-150 flex items-center justify-center p-2 flex-shrink-0 transition-transform duration-300 hover:scale-105">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = isNonCard ? '/images/booster_box_151.png' : 'https://images.pokemontcg.io/xy12/1.png';
                      }}
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="font-black text-gray-900 text-sm truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-extrabold block uppercase tracking-wider">
                      Phân loại: {item.product.brand}
                    </span>
                    <span className="text-sm font-black text-gray-900 block pt-0.5">
                      ${price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {}
                <div className="flex items-center gap-6">
                  {}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Số lượng</span>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1 justify-between w-24">
                      <button
                        onClick={() => handleQtyChange(item, -1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-650 disabled:opacity-30 cursor-pointer font-black text-xs transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-650 disabled:opacity-30 cursor-pointer font-black text-xs transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {}
                  <div className="text-right min-w-[80px]">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Thành tiền</span>
                    <span className="text-sm font-black text-[#e53935] mt-1 block">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {}
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-2.5 bg-red-50 hover:bg-[#e53935] text-[#e53935] hover:text-white rounded-xl transition-all border border-red-100 hover:border-[#e53935] cursor-pointer hover:scale-105"
                    title="Xóa khỏi giỏ hàng"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-150 rounded-[32px] p-6 space-y-5 shadow-premium">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
              Tóm Tắt Đơn Hàng
            </h3>
            
            <div className="space-y-2.5 text-xs text-gray-500 font-bold">
              <div className="flex justify-between">
                <span>Số lượng sản phẩm:</span>
                <span className="text-gray-900 font-black">{totalItems} món</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="text-emerald-600 font-black">Miễn phí (Freeship)</span>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex justify-between items-baseline py-1">
              <span className="text-sm font-bold text-gray-700">Tổng cộng:</span>
              <span className="text-2xl font-black text-[#e53935]">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-3.5 bg-[#e53935] hover:bg-[#d32f2f] text-white text-sm font-black rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 glow-effect cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              🚀 Tiến Hành Thanh Toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
