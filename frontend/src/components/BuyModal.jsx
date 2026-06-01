import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BuyModal({ card, activeUser, onClose }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingListing, setSubmittingListing] = useState(false);

  
  const [showListForm, setShowListForm] = useState(false);
  const [listPrice, setListPrice] = useState(card.basePrice ? card.basePrice.toString() : '');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await api.getListings(true); 
      const cardListings = data.filter(item => item.card.id === card.id);
      setListings(cardListings);
    } catch (err) {
      console.error('Không thể tải danh sách bán', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [card.id]);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!listPrice || parseFloat(listPrice) <= 0) {
      alert('Vui lòng nhập giá hợp lệ');
      return;
    }
    setSubmittingListing(true);
    try {
      await api.createListing({
        userId: activeUser.id,
        cardId: card.id,
        price: parseFloat(listPrice)
      });
      alert('🎴 Đã đăng bán thẻ thành công trên marketplace!');
      setShowListForm(false);
      fetchListings();
    } catch (err) {
      console.error(err);
      alert('Không thể đăng bán thẻ. Kiểm tra kết nối server.');
    } finally {
      setSubmittingListing(false);
    }
  };

  const handlePurchase = (listing) => {
    alert(`🎉 Mua thành công! Bạn đã sở hữu "${card.name}" từ @${listing.user.username} với giá $${listing.price.toFixed(2)}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 overflow-hidden animate-in fade-in zoom-in duration-200">

        {}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛒</span>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">Chợ Thẻ Bài</h3>
              <span className="text-xs text-slate-400 font-medium block mt-1">{card.name}</span>
            </div>
          </div>
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
            <p className="text-slate-400 text-sm mt-4 font-semibold">Đang tải danh sách bán...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Danh Sách Đang Bán
              </h4>

              {listings.length === 0 ? (
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    Chưa có ai rao bán thẻ này.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {listings.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors duration-150">
                      <div>
                        <span className="text-base font-extrabold text-white block">${item.price.toFixed(2)}</span>
                        <span className="text-xs text-slate-400 font-medium block mt-0.5">Người bán: @{item.user.username}</span>
                      </div>

                      {item.user.id !== activeUser.id ? (
                        <button
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15 transition-colors cursor-pointer"
                          onClick={() => handlePurchase(item)}
                        >
                          Mua Ngay
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider border border-slate-700/50 select-none">
                          Của Bạn
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {}
            {!showListForm ? (
              <button
                className="w-full py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/30 transition-all cursor-pointer text-center"
                onClick={() => setShowListForm(true)}
              >
                + Rao Bán Thẻ Của Bạn
              </button>
            ) : (
              <form onSubmit={handleCreateListing} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">Tạo Tin Rao Bán</h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giá Rao Bán ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all outline-none"
                    placeholder="vd: 75.00"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2.5 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/30 transition-all cursor-pointer"
                    onClick={() => setShowListForm(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    disabled={submittingListing}
                  >
                    {submittingListing ? 'Đang đăng...' : 'Đăng Bán'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
