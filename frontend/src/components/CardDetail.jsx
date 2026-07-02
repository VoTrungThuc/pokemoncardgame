import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import CustomModal from './CustomModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function CardDetail({ cardId, onBack, activeUser, onEditCard, onDeleteCard, onRefresh }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);

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

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const list = await api.getComments(cardId);
      setComments(list || []);
    } catch (err) {
      console.error("Lỗi khi tải nhận xét:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

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
    fetchComments();
  }, [cardId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);
    try {
      await api.addComment(cardId, { content: newCommentText.trim() });
      setNewCommentText('');
      fetchComments();
    } catch (err) {
      console.error(err);
      setCommentError(err.response?.data?.message || 'Không thể gửi nhận xét. Vui lòng thử lại.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSendReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    setReplyError(null);
    try {
      await api.addComment(cardId, { content: replyText.trim(), parentId });
      setReplyText('');
      setReplyingToCommentId(null);
      fetchComments();
    } catch (err) {
      console.error(err);
      setReplyError(err.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmittingReply(false);
    }
  };

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

  const parents = comments.filter(c => c.parentId === null || c.parentId === undefined);

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

      {/* Comments Section */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-6 md:p-8 shadow-premium space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-150">
          <span className="text-xl">💬</span>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Nhận xét từ Huấn luyện viên</h3>
          {!commentsLoading && (
            <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-gray-200">
              {comments.length}
            </span>
          )}
        </div>

        {/* Add comment form */}
        {activeUser ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            {commentError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-[#e53935] text-xs font-bold rounded-xl">
                ⚠️ {commentError}
              </div>
            )}
            <div className="flex gap-3 items-start">
              {/* User Initials Badge */}
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center font-black text-[#e53935] text-sm shrink-0">
                {activeUser.username ? activeUser.username.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Chia sẻ cảm nghĩ, nhận xét của bạn về thẻ bài này..."
                  rows={3}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-[#e53935] focus:outline-none text-sm font-semibold transition-colors duration-200"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentText.trim()}
                    className="px-6 py-2.5 bg-[#e53935] hover:bg-[#d32f2f] disabled:opacity-50 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {submittingComment ? 'Đang gửi...' : 'Gửi nhận xét 🚀'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-5 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-800">🔑 Đăng nhập để viết nhận xét</p>
              <p className="text-xs text-gray-500 font-semibold">Chỉ các thành viên đã đăng nhập mới có thể gửi nhận xét sản phẩm.</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event('auth-logout'))}
              className="px-5 py-2.5 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
            >
              ĐĂNG NHẬP NGAY
            </button>
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-2xl animate-spin text-[#e53935]">◓</div>
            <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-wider">Đang tải nhận xét...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-semibold text-sm space-y-2">
            <div className="text-4xl opacity-40">📭</div>
            <p>Chưa có nhận xét nào cho sản phẩm này.</p>
            <p className="text-xs text-gray-450 font-normal">Hãy là người đầu tiên chia sẻ nhận xét của bạn!</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
            {parents.map((parent) => {
              const replies = comments.filter(c => c.parentId === parent.id);
              const parentHasAvatar = parent.avatarUrl && parent.avatarUrl.trim().length > 0;
              const parentFormattedDate = parent.createdAt
                ? new Date(parent.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Gần đây';
              
              const isReplyingThis = replyingToCommentId === parent.id;
              const isAdmin = activeUser?.role === 'ADMIN';

              return (
                <div key={parent.id} className="space-y-3">
                  {/* Parent Comment */}
                  <div className="p-4 bg-gray-50/50 border border-gray-150 rounded-2xl flex gap-3.5 hover:border-red-100 hover:shadow-premium-hover transition-all duration-300">
                    {parentHasAvatar ? (
                      <img
                        src={parent.avatarUrl.startsWith('http') ? parent.avatarUrl : `${API_BASE_URL}${parent.avatarUrl}`}
                        alt={parent.username}
                        className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: parentHasAvatar ? 'none' : 'flex' }}
                      className="w-10 h-10 rounded-full bg-[#FFEAEA] flex items-center justify-center font-black text-[#e53935] text-sm shrink-0"
                    >
                      {parent.username ? parent.username.substring(0, 2).toUpperCase() : 'US'}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-gray-900">@{parent.username}</span>
                        <span className="text-[10px] text-gray-400 font-extrabold">{parentFormattedDate}</span>
                      </div>
                      <p className="text-sm text-gray-700 font-semibold leading-relaxed whitespace-pre-line">
                        {parent.content}
                      </p>
                      
                      {activeUser && isAdmin && (
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              if (isReplyingThis) {
                                setReplyingToCommentId(null);
                                setReplyText('');
                              } else {
                                setReplyingToCommentId(parent.id);
                                setReplyText(`@${parent.username} `);
                              }
                            }}
                            className="text-xs font-black text-[#e53935] hover:underline cursor-pointer uppercase tracking-wider flex items-center gap-1"
                          >
                            💬 {isReplyingThis ? 'Hủy phản hồi' : 'Phản hồi tương tác'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Reply Form */}
                  {isReplyingThis && (
                    <form onSubmit={(e) => handleSendReply(e, parent.id)} className="ml-10 p-4 bg-red-50/20 border border-red-100 rounded-2xl space-y-2">
                      {replyError && (
                        <div className="p-2 bg-red-50 text-[#e53935] text-xs font-bold rounded-lg">
                          ⚠️ {replyError}
                        </div>
                      )}
                      <div className="flex gap-2 items-start">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Phản hồi cho @${parent.username}...`}
                          rows={2}
                          className="flex-1 p-3 border border-gray-200 bg-white rounded-xl focus:border-[#e53935] focus:outline-none text-xs font-semibold"
                        />
                        <button
                          type="submit"
                          disabled={submittingReply || !replyText.trim()}
                          className="px-4 py-2 bg-[#e53935] hover:bg-[#d32f2f] disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer shrink-0"
                        >
                          Gửi
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies */}
                  {replies.length > 0 && (
                    <div className="ml-10 pl-4 border-l-2 border-gray-150 space-y-3">
                      {replies.map((reply) => {
                        const replyHasAvatar = reply.avatarUrl && reply.avatarUrl.trim().length > 0;
                        const replyFormattedDate = reply.createdAt
                          ? new Date(reply.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Gần đây';

                        return (
                          <div
                            key={reply.id}
                            className="p-3 bg-gray-50/30 border border-gray-150 rounded-xl flex gap-3 hover:border-red-100/70 hover:shadow-premium-hover transition-all duration-300"
                          >
                            {replyHasAvatar ? (
                              <img
                                src={reply.avatarUrl.startsWith('http') ? reply.avatarUrl : `${API_BASE_URL}${reply.avatarUrl}`}
                                alt={reply.username}
                                className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              style={{ display: replyHasAvatar ? 'none' : 'flex' }}
                              className="w-8 h-8 rounded-full bg-[#FFEAEA] flex items-center justify-center font-black text-[#e53935] text-xs shrink-0"
                            >
                              {reply.username ? reply.username.substring(0, 2).toUpperCase() : 'US'}
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-gray-900">@{reply.username}</span>
                                <span className="text-[9px] text-gray-400 font-extrabold">{replyFormattedDate}</span>
                              </div>
                              <p className="text-xs text-gray-650 font-semibold leading-relaxed whitespace-pre-line">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
