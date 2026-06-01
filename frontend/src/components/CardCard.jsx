import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import CustomModal from './CustomModal';

export default function CardCard({ card, onSelectCard, activeUser, onEditCard, onDeleteCard, onRefresh }) {
  const { addToCart } = useCart();

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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart(card.id, 1);
      showModal({
        title: 'Thành công',
        message: `🎉 Đã thêm "${card.name}" vào giỏ hàng!`,
        type: 'alert',
        confirmText: 'Đóng',
        icon: '🛒',
        onConfirm: () => {}
      });
    } catch (err) {
      showModal({
        title: 'Thất bại',
        message: err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng.',
        type: 'alert',
        confirmText: 'Đóng',
        icon: '⚠️',
        onConfirm: () => {}
      });
    }
  };

  
  const isNonCard = ['Sealed', 'Plush', 'Figure', 'Accessory'].includes(card.cpu);

  
  const getBadgeStyle = () => {
    if (isNonCard) {
      if (card.cpu === 'Sealed') return 'bg-amber-100 text-amber-800 border-amber-200';
      if (card.cpu === 'Plush') return 'bg-pink-100 text-pink-850 border-pink-200';
      if (card.cpu === 'Figure') return 'bg-purple-100 text-purple-800 border-purple-200';
      if (card.cpu === 'Accessory') return 'bg-teal-100 text-teal-800 border-teal-200';
    }
    
    
    const rarity = card.ram ? card.ram.toLowerCase() : '';
    if (rarity.includes('illustrator')) return 'bg-yellow-100 text-yellow-800 border-yellow-350 shadow-sm';
    if (rarity.includes('gold star')) return 'bg-yellow-50 text-yellow-750 border-yellow-250';
    if (rarity.includes('secret')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (rarity.includes('special art') || rarity.includes('sar')) return 'bg-pink-100 text-pink-750 border-pink-200';
    if (rarity.includes('vmax')) return 'bg-red-50 text-red-700 border-red-200';
    if (rarity.includes('vstar')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (rarity.includes('full art')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (rarity.includes('holo')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getBadgeLabel = () => {
    if (isNonCard) {
      if (card.cpu === 'Sealed') return 'Hộp/Gói sealed';
      if (card.cpu === 'Plush') return 'Gấu bông';
      if (card.cpu === 'Figure') return 'Mô hình';
      if (card.cpu === 'Accessory') return 'Phụ kiện';
    }
    return card.ram || 'Common';
  };

  const getBorderColor = () => {
    if (isNonCard) return 'border-gray-200';
    
    const rarity = card.ram ? card.ram.toLowerCase() : '';
    if (rarity.includes('illustrator')) return 'border-yellow-450';
    if (rarity.includes('gold star')) return 'border-yellow-350';
    if (rarity.includes('secret')) return 'border-purple-300';
    if (rarity.includes('special art') || rarity.includes('sar')) return 'border-pink-300';
    if (rarity.includes('vmax')) return 'border-red-300';
    if (rarity.includes('vstar')) return 'border-orange-350';
    return 'border-gray-200';
  };

  const getTypeColor = (type) => {
    if (!type) return 'text-gray-500';
    const t = type.toLowerCase();
    if (t === 'fire') return 'text-red-600';
    if (t === 'water') return 'text-blue-600';
    if (t === 'grass') return 'text-green-600';
    if (t === 'lightning') return 'text-yellow-600';
    if (t === 'psychic') return 'text-purple-600';
    if (t === 'fighting') return 'text-orange-600';
    if (t === 'dragon') return 'text-teal-650';
    if (t === 'trainer') return 'text-pink-600';
    return 'text-gray-500';
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

  const hasPromo = card.promoPrice !== null && card.promoPrice < card.price;
  const formattedPrice = card.price?.toLocaleString('vi-VN') || card.price?.toFixed(2);
  const formattedPromoPrice = card.promoPrice?.toLocaleString('vi-VN') || card.promoPrice?.toFixed(2);

  return (
    <div
      className={`relative overflow-hidden group rounded-3xl bg-white border-2 ${getBorderColor()} shadow-premium hover:shadow-premium-hover hover:-translate-y-1.5 transition-all duration-500 ease-out flex flex-col h-full cursor-pointer`}
      onClick={() => onSelectCard(card.id)}
    >
      
      {}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getBadgeStyle()}`}>
          {getBadgeLabel()}
        </span>
      </div>

      {}
      <div className="absolute top-2.5 right-2.5 z-10">
        {card.stock > 0 ? (
          <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Còn {card.stock}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-gray-800 text-white border border-gray-800">
            Hết hàng
          </span>
        )}
      </div>

      {}
      <div className="mx-3 mt-11 aspect-[2.5/2.8] rounded-2xl bg-gray-50 group-hover:bg-white flex items-center justify-center overflow-hidden border border-gray-150 relative shadow-inner transition-colors duration-500">
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            
            e.target.src = isNonCard ? '/images/booster_box_151.png' : 'https://images.pokemontcg.io/xy12/1.png';
          }}
        />

        {}
        {card.stock <= 0 && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-black/80 text-white font-black text-xs px-3.5 py-1.5 rounded uppercase tracking-widest shadow-md">
              Hết Hàng
            </span>
          </div>
        )}

        {}
        {!isNonCard && card.ram && (card.ram.toLowerCase().includes('holo') || card.ram.toLowerCase().includes('vmax') || card.ram.toLowerCase().includes('secret')) && (
          <div className="holographic-shine" />
        )}
      </div>

      {}
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-[#e53935] transition-colors duration-200 h-10 overflow-hidden" title={card.name}>
            {card.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5">
            {isNonCard ? (
              <span className="text-xs font-bold text-gray-500">
                🏷️ {card.brand}
              </span>
            ) : (
              <span className={`text-xs font-bold ${getTypeColor(card.cpu)}`}>
                {getTypeIcon(card.cpu)} {card.brand}
              </span>
            )}

            {card.camera && card.camera !== 'N/A' && (
              <span className="text-[9px] text-gray-400 font-extrabold">• {card.camera}</span>
            )}
          </div>

          <div className="flex gap-1.5 mt-2 flex-wrap">
            {card.battery && card.battery !== 'N/A' && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-gray-100 text-gray-500 border border-gray-200">
                {isNonCard ? 'MÃ: ' : '#'}{card.battery}
              </span>
            )}
            {card.rom && card.rom !== 'N/A' && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-gray-105 text-gray-600 border border-gray-150">
                {card.rom}
              </span>
            )}
            {card.ram && isNonCard && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-50 text-[#e53935] border border-red-100">
                {card.ram}
              </span>
            )}
          </div>
        </div>

        {}
        <div className="mt-3 pt-2.5 border-t border-gray-150 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">Giá bán</span>
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              {hasPromo ? (
                <>
                  <span className="text-sm font-black text-[#e53935]">${formattedPromoPrice}</span>
                  <span className="text-[9px] text-gray-400 line-through">${formattedPrice}</span>
                </>
              ) : (
                <span className="text-sm font-black text-gray-900">${formattedPrice}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeUser?.role === 'ADMIN' ? (
              <>
                {card.stock > 0 ? (
                  <button
                    className="px-2 py-1 rounded-lg text-xs font-black bg-gray-800 hover:bg-black text-white border border-gray-800 transition-all duration-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
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
                            await api.updateProduct(card.id, payload);
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
                  >
                    Hết Hàng
                  </button>
                ) : (
                  <button
                    className="px-2 py-1 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 transition-all duration-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
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
                              message: 'Số lượng nhập vào không hợp lệ!',
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
                            await api.updateProduct(card.id, payload);
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
                  >
                    Nhập Kho
                  </button>
                )}
                <button
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-500 transition-all duration-200 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onEditCard(card); }}
                >
                  Sửa
                </button>
                <button
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-red-50 hover:bg-[#e53935] text-[#e53935] hover:text-white border border-red-200 hover:border-[#e53935] transition-all duration-200 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }}
                >
                  Xóa
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-250 transition-all cursor-pointer"
                  onClick={() => onSelectCard(card.id)}
                >
                  Chi Tiết
                </button>
                
                {card.stock > 0 ? (
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-black bg-[#e53935] hover:bg-[#d32f2f] text-white shadow-sm transition-all cursor-pointer"
                    onClick={handleAddToCart}
                  >
                    MUA
                  </button>
                ) : (
                  <button
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-gray-300 text-gray-500 border border-gray-350 cursor-not-allowed"
                    disabled
                  >
                    LIÊN HỆ
                  </button>
                )}
              </>
            )}
          </div>
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
