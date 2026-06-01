import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import CustomModal from './CustomModal';

export default function CardDetail({ cardId, onBack, activeUser, onEditCard, onDeleteCard, onRefresh }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    defaultValue: '',
    placeholder: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: () => {},
    icon: '💡'
  });

  const showModal = (config) => {
    setModalConfig({
      isOpen: true,
      ...config
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(cardId);
        setCard(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [cardId]);

  const handleAddToCart = async () => {
    if (!card || card.stock <= 0) return;
    setAdding(true);
    setAddMessage(null);
    try {
      await addToCart(card.id, quantity);
      setAddMessage({ type: 'success', text: `🎉 Đã thêm ${quantity}x "${card.name}" vào giỏ hàng!` });
    } catch (err) {
      setAddMessage({ type: 'error', text: err.response?.data?.message || 'Không thể thêm vào giỏ hàng.' });
    } finally {
      setAdding(false);
    }
  };

  const isNonCard = card ? ['Sealed', 'Plush', 'Figure', 'Accessory'].includes(card.cpu) : false;

  const getRarityStyle = (rarity) => {
    if (!card) return 'text-gray-500 border-gray-200 bg-gray-50';
    if (isNonCard) {
      if (card.cpu === 'Sealed') return 'text-amber-700 border-amber-200 bg-amber-50';
      if (card.cpu === 'Plush') return 'text-pink-700 border-pink-200 bg-pink-50';
      if (card.cpu === 'Figure') return 'text-purple-700 border-purple-200 bg-purple-50';
      if (card.cpu === 'Accessory') return 'text-teal-700 border-teal-200 bg-teal-50';
    }

    if (!rarity) return 'text-gray-550 border-gray-200 bg-gray-50';
    const r = rarity.toLowerCase();
    if (r.includes('illustrator') || r.includes('gold star')) return 'text-yellow-700 border-yellow-300 bg-yellow-50';
    if (r.includes('secret') || r.includes('sar')) return 'text-purple-700 border-purple-250 bg-purple-50';
    if (r.includes('vmax') || r.includes('vstar')) return 'text-red-700 border-red-200 bg-red-50';
    if (r.includes('holo')) return 'text-blue-700 border-blue-200 bg-blue-50';
    return 'text-gray-655 border-gray-200 bg-gray-50';
  };

  const getCategoryLabel = () => {
    if (!card) return '';
    if (isNonCard) {
      if (card.cpu === 'Sealed') return 'Hộp/Gói sealed';
      if (card.cpu === 'Plush') return 'Gấu bông';
      if (card.cpu === 'Figure') return 'Mô hình';
      if (card.cpu === 'Accessory') return 'Phụ kiện';
    }
    return card.ram || 'Common';
  };

  const getTypeIcon = (type) => {
    if (!type) return '⚪';
    const t = type.toLowerCase();
    if (t === 'fire') return '🔥';
    if (t === 'water') return '💧';
    if (t === 'grass') return '🌿';
    if (t === 'lightning') return '⚡';
    if (t === 'psychic') return '🔮';
    if (t === 'fighting') return '👊';
    if (t === 'darkness') return '🌑';
    if (t === 'dragon') return '🐲';
    if (t === 'colorless') return '⭐';
    if (t === 'trainer') return '🧑‍🏫';
    return '⚪';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="text-4xl animate-spin text-[#e53935]">◓</div>
        <p className="text-gray-500 text-sm mt-4 font-black tracking-wider uppercase">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <p className="text-[#e53935] font-bold">{error || 'Không tìm thấy sản phẩm.'}</p>
        <button className="mt-4 px-5 py-2 bg-[#e53935] hover:bg-[#d32f2f] text-white text-sm font-bold rounded-lg cursor-pointer transition-colors" onClick={onBack}>
          Quay lại
        </button>
      </div>
    );
  }

  const rarityStyle = getRarityStyle(card.ram);
  const currentPrice = (card.promoPrice !== null && card.promoPrice < card.price) ? card.promoPrice : card.price;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-[#e53935] transition-colors cursor-pointer uppercase tracking-wider">
        ← Quay lại trang chủ
      </button>

      <div className="bg-white border border-gray-200 rounded-[32px] p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-premium">

        {}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="aspect-[2.5/2.8] bg-gray-50 border-2 border-gray-200 rounded-3xl flex items-center justify-center overflow-hidden relative p-4 shadow-inner">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.onerror = null; e.target.src = isNonCard ? '/images/booster_box_151.png' : 'https://images.pokemontcg.io/xy12/1.png'; }}
            />
            {card.stock <= 0 && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-black/80 text-white font-black text-sm px-4 py-2 rounded uppercase tracking-widest shadow-md">
                  Hết Hàng
                </span>
              </div>
            )}
          </div>

          {}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Tình trạng kho:</span>
              {card.stock > 0 ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Còn {card.stock} sản phẩm
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-800 text-white">
                  Hết hàng
                </span>
              )}
            </div>
            <div className="h-px bg-gray-200" />
            <div className="text-xs text-gray-500 space-y-1.5 font-semibold">
              <p>🛡️ Cam kết sản phẩm chính hãng, nhập khẩu từ Pokemon Center, Nhật, Mỹ.</p>
              <p>📦 Đóng gói cẩn thận, chống va đập, bảo vệ sản phẩm tuyệt đối.</p>
              <p>🚀 Giao hàng hỏa tốc trong nội thành và COD toàn quốc nhanh chóng.</p>
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {}
          <div className="pb-4 border-b border-gray-150">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${rarityStyle}`}>
                {getCategoryLabel()}
              </span>
              {card.cpu && !isNonCard && card.cpu !== 'Trainer' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-250">
                  {getTypeIcon(card.cpu)} Hệ {card.cpu}
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-snug">{card.name}</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">{card.description}</p>
          </div>

          {}
          <div className="bg-gradient-to-br from-red-50 to-orange-50/30 border border-red-100 rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-black text-[#e53935] uppercase tracking-wider block mb-1">Giá Bán Cửa Hàng</span>
            <div className="flex flex-wrap items-baseline gap-3">
              {card.promoPrice !== null && card.promoPrice < card.price ? (
                <>
                  <span className="text-3xl font-black text-[#e53935]">${card.promoPrice?.toFixed(2)}</span>
                  <span className="text-sm text-gray-400 line-through font-bold">${card.price?.toFixed(2)}</span>
                  <span className="text-xs text-red-750 bg-red-100 px-2 py-0.5 rounded-lg border border-red-200 font-black">
                    Khuyến mãi tiết kiệm: ${(card.price - card.promoPrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-gray-950">${card.price?.toFixed(2)}</span>
              )}
            </div>
          </div>

          {}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">Thông Tin Chi Tiết</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3">
                <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider block">
                  {isNonCard ? 'Quy cách / Kích thước' : 'Độ Hiếm'}
                </span>
                <span className="text-sm font-black text-gray-800 mt-1 block">{card.ram || '-'}</span>
              </div>
              
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3">
                <span className="text-[9px] font-extrabold text-gray-455 uppercase tracking-wider block">
                  {isNonCard ? 'Thương hiệu / Hãng' : 'Tình Trạng'}
                </span>
                <span className="text-sm font-black text-gray-800 mt-1 block">{card.rom || '-'}</span>
              </div>

              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3">
                <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider block">Danh mục</span>
                <span className="text-sm font-black text-gray-800 mt-1 block">
                  {isNonCard ? '' : getTypeIcon(card.cpu)} {isNonCard ? getCategoryLabel() : card.cpu || '-'}
                </span>
              </div>

              {card.camera && card.camera !== 'N/A' && (
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-3">
                  <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider block">
                    {isNonCard ? 'Chất liệu / Chi tiết' : 'HP'}
                  </span>
                  <span className="text-sm font-black text-[#e53935] mt-1 block">{card.camera}</span>
                </div>
              )}

              {card.battery && card.battery !== 'N/A' && (
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-3">
                  <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider block">
                    {isNonCard ? 'Mã sản phẩm / SKU' : 'Số Thẻ'}
                  </span>
                  <span className="text-sm font-black text-gray-800 mt-1 block">{card.battery}</span>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 col-span-full sm:col-span-1">
                <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider block">
                  {isNonCard ? 'Bộ sưu tập' : 'Bộ thẻ (Set)'}
                </span>
                <span className="text-xs font-black text-gray-700 mt-1 block leading-tight">{card.screen || '-'}</span>
              </div>

              {card.os && card.os !== 'N/A' && (
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-3">
                  <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider block">
                    {isNonCard ? 'Nhà phát hành / Hãng' : 'Họa Sĩ'}
                  </span>
                  <span className="text-xs font-black text-gray-700 mt-1 block">{card.os}</span>
                </div>
              )}

              {card.brand && (
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-3">
                  <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider block">Pokemon</span>
                  <span className="text-sm font-black text-[#e53935] mt-1 block">{card.brand}</span>
                </div>
              )}
            </div>
          </div>

          {}
          {activeUser?.role !== 'ADMIN' && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-inner">
              {addMessage && (
                <div className={`px-4 py-3 rounded-xl text-xs font-bold ${
                  addMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-250 text-emerald-700'
                    : 'bg-red-50 border border-red-200 text-[#e53935]'
                }`}>
                  {addMessage.text}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Số Lượng Mua</span>
                  <div className="flex items-center bg-white border-2 border-gray-250 rounded-xl p-1 w-28 justify-between">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={card.stock <= 0}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer font-black text-base">
                      -
                    </button>
                    <span className="font-black text-sm text-gray-800">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(card.stock, q + 1))} disabled={card.stock <= 0 || quantity >= card.stock}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer font-black text-base">
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Thành Tiền</span>
                  <span className="text-2xl font-black text-[#e53935]">${(currentPrice * quantity).toFixed(2)}</span>
                </div>
              </div>

              {card.stock > 0 ? (
                <button onClick={handleAddToCart} disabled={adding}
                  className="w-full py-3.5 bg-[#e53935] hover:bg-[#d32f2f] disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                  {adding ? 'Đang thêm...' : '🛒 THÊM VÀO GIỎ HÀNG'}
                </button>
              ) : (
                <button disabled className="w-full py-3.5 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed border border-gray-350">
                  🚫 Sản phẩm tạm thời hết hàng
                </button>
              )}
            </div>
          )}

          {}
          {activeUser?.role === 'ADMIN' && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-inner">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Bảng Điều Khiển Admin</span>
              
              <div className="grid grid-cols-2 gap-3">
                {card.stock > 0 ? (
                  <button
                    onClick={() => {
                      showModal({
                        title: 'Đánh dấu hết hàng',
                        message: `Bạn có chắc chắn muốn đánh dấu "${card.name}" là Hết Hàng không? Tồn kho sẽ được cập nhật về 0.`,
                        type: 'confirm',
                        confirmText: 'Xác nhận',
                        cancelText: 'Hủy',
                        icon: '🚫',
                        onConfirm: async () => {
                          try {
                            const payload = {
                              ...card,
                              stock: 0,
                              isAvailable: card.isAvailable
                            };
                            payload.price = parseFloat(card.price);
                            if (card.promoPrice !== null) payload.promoPrice = parseFloat(card.promoPrice);
                            const updated = await api.updateProduct(card.id, payload);
                            setCard(updated);
                            showModal({
                              title: 'Thành công',
                              message: 'Đã cập nhật sản phẩm thành Hết Hàng!',
                              type: 'alert',
                              confirmText: 'OK',
                              icon: '✓',
                              onConfirm: () => {
                                if (onRefresh) onRefresh();
                              }
                            });
                          } catch (err) {
                            showModal({
                              title: 'Lỗi',
                              message: 'Không thể cập nhật: ' + (err.response?.data?.message || err.message),
                              type: 'alert',
                              confirmText: 'Đóng',
                              icon: '⚠️',
                              onConfirm: () => {}
                            });
                          }
                        }
                      });
                    }}
                    className="py-3 bg-gray-800 hover:bg-black text-white font-black text-xs rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    🚫 ĐÁNH DẤU HẾT HÀNG
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      showModal({
                        title: 'Nhập tồn kho mới',
                        message: `Nhập số lượng tồn kho mới cho sản phẩm "${card.name}":`,
                        type: 'prompt',
                        defaultValue: '10',
                        placeholder: 'Nhập số lượng, ví dụ: 10',
                        confirmText: 'Cập nhật',
                        cancelText: 'Hủy',
                        icon: '📦',
                        onConfirm: async (newStockStr) => {
                          const newStock = parseInt(newStockStr);
                          if (isNaN(newStock) || newStock < 0) {
                            showModal({
                              title: 'Lỗi nhập liệu',
                              message: 'Số lượng không hợp lệ!',
                              type: 'alert',
                              confirmText: 'Thử lại',
                              icon: '⚠️',
                              onConfirm: () => {}
                            });
                            return;
                          }
                          try {
                            const payload = {
                              ...card,
                              stock: newStock,
                              isAvailable: card.isAvailable
                            };
                            payload.price = parseFloat(card.price);
                            if (card.promoPrice !== null) payload.promoPrice = parseFloat(card.promoPrice);
                            const updated = await api.updateProduct(card.id, payload);
                            setCard(updated);
                            showModal({
                              title: 'Thành công',
                              message: `Đã cập nhật tồn kho mới là ${newStock}!`,
                              type: 'alert',
                              confirmText: 'OK',
                              icon: '✓',
                              onConfirm: () => {
                                if (onRefresh) onRefresh();
                              }
                            });
                          } catch (err) {
                            showModal({
                              title: 'Lỗi',
                              message: 'Không thể cập nhật: ' + (err.response?.data?.message || err.message),
                              type: 'alert',
                              confirmText: 'Đóng',
                              icon: '⚠️',
                              onConfirm: () => {}
                            });
                          }
                        }
                      });
                    }}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    📦 NHẬP TỒN KHO MỚI
                  </button>
                )}

                <button
                  onClick={() => onEditCard(card)}
                  className="py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  ✏️ CHỈNH SỬA THẺ
                </button>
              </div>

              <button
                onClick={() => {
                  showModal({
                    title: 'Xóa sản phẩm',
                    message: `Bạn có chắc chắn muốn xóa sản phẩm "${card.name}" khỏi cửa hàng không? Hành động này không thể hoàn tác.`,
                    type: 'confirm',
                    confirmText: 'Xóa ngay',
                    cancelText: 'Hủy',
                    icon: '🗑️',
                    onConfirm: async () => {
                      try {
                        await api.deleteProduct(card.id);
                        showModal({
                          title: 'Thành công',
                          message: 'Đã xóa sản phẩm thành công!',
                          type: 'alert',
                          confirmText: 'OK',
                          icon: '✓',
                          onConfirm: () => {
                            onBack(); 
                          }
                        });
                      } catch (err) {
                        showModal({
                          title: 'Lỗi',
                          message: 'Không thể xóa sản phẩm. Có thể sản phẩm đang nằm trong đơn hàng.',
                          type: 'alert',
                          confirmText: 'Đóng',
                          icon: '⚠️',
                          onConfirm: () => {}
                        });
                      }
                    }
                  });
                }}
                className="w-full py-3 bg-red-600 hover:bg-[#e53935] text-white font-black text-xs rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                🗑️ XÓA SẢN PHẨM KHỎI CỬA HÀNG
              </button>
            </div>
          )}
        </div>
      </div>

      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        defaultValue={modalConfig.defaultValue}
        placeholder={modalConfig.placeholder}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        icon={modalConfig.icon}
      />
    </div>
  );
}
