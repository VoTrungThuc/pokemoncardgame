import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function TradeModal({ card, activeUser, onClose }) {
  const [cards, setCards] = useState([]);
  const [selectedOfferedId, setSelectedOfferedId] = useState('');
  const [targetListings, setTargetListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        
        const allListings = await api.getListings(true);

        
        const activeCardListings = allListings.filter(
          l => l.card.id === card.id && l.user.id !== activeUser.id
        );
        setTargetListings(activeCardListings);

        if (activeCardListings.length > 0) {
          setSelectedListingId(activeCardListings[0].id.toString());
        }

        
        const myActiveListings = allListings.filter(l => l.user.id === activeUser.id);
        
        const others = myActiveListings
          .map(l => l.card)
          .filter(c => c.id !== card.id);

        setCards(others);
        if (others.length > 0) {
          setSelectedOfferedId(others[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [card.id, activeUser.id]);

  const selectedOfferedCard = cards.find(c => c.id.toString() === selectedOfferedId);
  const selectedListing = targetListings.find(l => l.id.toString() === selectedListingId);
  const toUserId = selectedListing ? selectedListing.user.id : null;
  const toUserName = selectedListing ? `@${selectedListing.user.username}` : 'chủ sở hữu';

  
  const offeredScore = selectedOfferedCard?.score || 0;
  const requestedScore = card.score || 0;
  const scoreDifference = Math.abs(offeredScore - requestedScore);
  const isFairTrade = scoreDifference <= 1.5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfferedId) {
      alert('Vui lòng chọn thẻ muốn đổi');
      return;
    }
    if (!toUserId) {
      alert('Không xác định được chủ sở hữu thẻ yêu cầu');
      return;
    }
    setSubmitting(true);
    try {
      await api.createTrade({
        fromUserId: activeUser.id,
        toUserId: toUserId,
        offeredCardId: parseInt(selectedOfferedId),
        requestedCardId: card.id
      });
      alert(`🎴 Đã gửi đề xuất trao đổi tới ${toUserName}!`);
      onClose();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể gửi đề xuất trao đổi. Đảm bảo cả hai thẻ đều có tin đăng bán đang hoạt động.';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 overflow-hidden animate-in fade-in zoom-in duration-200">

        {}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="text-indigo-400">⇄</span> Đề Xuất Trao Đổi Thẻ
          </h3>
          <button
            className="text-slate-400 hover:text-white transition-colors duration-200 text-2xl font-bold cursor-pointer leading-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl animate-spin text-indigo-500">◓</div>
            <p className="text-slate-400 text-sm mt-4 font-semibold">Đang tải danh sách thẻ...</p>
          </div>
        ) : targetListings.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Thẻ này hiện không có ai đăng bán <strong className="text-indigo-400">CÒN HÀNG</strong> trên chợ thẻ.
            </p>
            <p className="text-xs text-slate-505 font-medium">
              Để trao đổi, phải có ít nhất một người dùng khác đăng bán thẻ này.
            </p>
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer w-full mt-2"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Bạn chưa có thẻ nào đăng bán <strong className="text-emerald-400">CÒN HÀNG</strong> trên chợ thẻ.
            </p>
            <p className="text-xs text-slate-500">
              Để đề xuất trao đổi, bạn cần đăng bán thẻ của mình trong tab <strong>Đăng Bán</strong> để có thẻ đưa ra.
            </p>
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer w-full mt-2"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {}
            <div className="grid grid-cols-2 gap-4">
              {}
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex flex-col items-center justify-between text-center relative min-h-[140px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider absolute top-3">Thẻ Của Bạn</span>
                {selectedOfferedCard ? (
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-sm font-bold text-indigo-300 line-clamp-1">{selectedOfferedCard.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{selectedOfferedCard.pokemonName}</span>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-500/20">{selectedOfferedCard.rarity}</span>
                      <span className="text-xs font-bold text-emerald-400">★ {selectedOfferedCard.score?.toFixed(1)}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 mt-8">Chọn thẻ...</span>
                )}
              </div>

              {}
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex flex-col items-center justify-between text-center relative min-h-[140px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider absolute top-3">
                  {selectedListing ? `@${selectedListing.user.username} Nhận` : 'Chủ Sở Hữu Nhận'}
                </span>
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-sm font-bold text-purple-300 line-clamp-1">{card.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{card.pokemonName}</span>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-purple-950 text-purple-300 border border-purple-500/20">{card.rarity}</span>
                    <span className="text-xs font-bold text-emerald-400">★ {card.score?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {}
            {targetListings.length === 1 && (
              <div className="flex justify-between items-center px-4 py-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                <span className="text-xs font-bold text-slate-400">Đối Tác Trao Đổi:</span>
                <span className="text-xs font-extrabold text-indigo-400">@{targetListings[0].user.username}</span>
              </div>
            )}

            {}
            {targetListings.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chọn Đối Tác Trao Đổi *
                </label>
                <select
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none cursor-pointer"
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(e.target.value)}
                >
                  {targetListings.map(l => (
                    <option key={l.id} value={l.id}>
                      @{l.user.username} (Giá rao bán: ${l.price?.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Chọn Thẻ Của Bạn Để Đưa Ra *
              </label>
              <select
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none cursor-pointer"
                value={selectedOfferedId}
                onChange={(e) => setSelectedOfferedId(e.target.value)}
              >
                {cards.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.pokemonName} - Điểm: {c.score?.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>

            {}
            {selectedOfferedCard && (
              <div className={`p-4 rounded-xl border ${
                isFairTrade
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
              }`}>
                <div className="flex items-start gap-2.5">
                  <span className="text-base">{isFairTrade ? '✅' : '⚠️'}</span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {isFairTrade ? 'Trao Đổi Công Bằng' : 'Cảnh Báo Không Công Bằng'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Chênh lệch điểm: <strong className={isFairTrade ? 'text-emerald-400' : 'text-rose-400'}>{scoreDifference.toFixed(2)}</strong>.
                      {isFairTrade
                        ? ` Trao đổi hợp lệ. Chênh lệch trong giới hạn cho phép (tối đa 1.5).`
                        : ` Chênh lệch vượt ngưỡng cho phép (1.5). Đề xuất này sẽ bị từ chối bởi server.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                💡 Yêu cầu trao đổi: Cả hai thẻ phải có tin đăng bán <strong>CÒN HÀNG</strong> trên chợ thẻ. Đề xuất sẽ được gửi tới dashboard của người nhận để họ chấp nhận hoặc từ chối.
              </p>
            </div>

            {}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/30 transition-all cursor-pointer"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={submitting || !isFairTrade}
              >
                {submitting ? 'Đang gửi...' : 'Gửi Đề Xuất Trao Đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
