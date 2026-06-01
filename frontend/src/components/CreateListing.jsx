import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CreateListing({ activeUser, onListingSuccess }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const data = await api.getCards();
        setCards(data);
        if (data.length > 0) {
          setSelectedCard(data[0]);
          setPrice(data[0].basePrice.toString());
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Không thể tải danh mục thẻ bài.');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleCardChange = (e) => {
    const cardId = parseInt(e.target.value);
    const card = cards.find(c => c.id === cardId);
    setSelectedCard(card);
    if (card) {
      setPrice(card.basePrice.toString());
    }
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCard || !price || parseFloat(price) <= 0) {
      setErrorMsg('Vui lòng chọn thẻ bài và nhập giá rao bán hợp lệ.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.createListing({
        userId: activeUser.id,
        cardId: selectedCard.id,
        price: parseFloat(price)
      });
      setSuccessMsg(`🎴 Đã rao bán "${selectedCard.name}" trên chợ thẻ với giá $${parseFloat(price).toFixed(2)}.`);
      setPrice('');
      if (onListingSuccess) {
        setTimeout(() => {
          onListingSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Không thể đăng bán thẻ. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-4xl animate-spin text-indigo-500">◓</div>
        <p className="text-slate-400 text-sm mt-4 font-semibold">Đang tải danh mục thẻ bài...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">🎴 Đăng Bán Thẻ Bài</h2>
        <p className="text-sm text-slate-400 mt-1">Chọn thẻ Pokemon và đặt giá để đăng bán trên chợ thẻ.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
        {}
        <form onSubmit={handleSubmit} className="space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chọn Thẻ Bài *</label>
              <select
                value={selectedCard?.id || ''}
                onChange={handleCardChange}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none cursor-pointer"
              >
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.rarity})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giá Rao Bán ($) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                placeholder="vd: 150.00"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 font-medium block">Giá tham khảo: ${selectedCard?.basePrice?.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {successMsg && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-3 rounded-xl">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer text-center"
            >
              {submitting ? 'Đang đăng bán...' : 'Đăng Bán Thẻ'}
            </button>
          </div>
        </form>

        {}
        {selectedCard ? (
          <div className="bg-slate-950/50 border border-slate-850 p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-slate-800 transition-colors">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-start">Xem Trước Thẻ Bài</h4>

            <div className="w-40 h-52 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative shadow-lg group">
              {selectedCard.imageUrl ? (
                <img
                  src={selectedCard.imageUrl}
                  alt={selectedCard.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.pokemontcg.io/xy12/1.png';
                  }}
                />
              ) : (
                <span className="text-4xl text-slate-700">🎴</span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white leading-none">{selectedCard.name}</h3>
              <span className="text-xs text-slate-400 font-medium block mt-1.5">{selectedCard.pokemonName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-800 text-indigo-400 border border-indigo-500/10">
                {selectedCard.rarity}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-800 text-emerald-400 border border-emerald-500/10">
                {selectedCard.condition}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-indigo-950/60 text-indigo-300 border border-indigo-500/20">
                ⭐ {selectedCard.score?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/20 border border-slate-850 p-6 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
            Chọn thẻ để xem trước
          </div>
        )}
      </div>
    </div>
  );
}
