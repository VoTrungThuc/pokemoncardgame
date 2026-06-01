import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function TradeDashboard({ activeUser }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const data = await api.getUserTrades(activeUser.id);
      setTrades(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải lịch sử trao đổi. Kiểm tra kết nối backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [activeUser.id]);

  const handleAccept = async (id) => {
    try {
      await api.acceptTrade(id);
      alert('🎉 Đã chấp nhận đề xuất trao đổi thẻ!');
      fetchTrades();
    } catch (err) {
      console.error(err);
      alert('Không thể chấp nhận trao đổi. Vui lòng thử lại.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectTrade(id);
      alert('Đã từ chối đề xuất trao đổi thẻ.');
      fetchTrades();
    } catch (err) {
      console.error(err);
      alert('Không thể từ chối trao đổi. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-4xl animate-spin text-indigo-500">◓</div>
        <p className="text-slate-400 text-sm mt-4 font-semibold">Đang tải lịch sử trao đổi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/40 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <p className="text-red-400 font-semibold">{error}</p>
        <button
          className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
          onClick={fetchTrades}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'Đã Chấp Nhận';
      case 'REJECTED': return 'Đã Từ Chối';
      case 'PENDING': return 'Chờ Xử Lý';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">🔄 Bảng Trao Đổi Thẻ Bài</h2>
        <p className="text-sm text-slate-400 mt-1">Quản lý các đề xuất trao đổi thẻ Pokemon với những Trainer khác.</p>
      </div>

      {trades.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-16 text-center max-w-2xl mx-auto">
          <div className="text-4xl text-slate-650 mb-2">⇄</div>
          <p className="text-slate-400 font-semibold text-base">Chưa có yêu cầu trao đổi nào.</p>
          <p className="text-slate-500 text-sm mt-1">
            Vào mục Thẻ Pokemon, chọn thẻ muốn đổi và nhấn nút trao đổi để đề xuất!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map(trade => {
            const isReceived = trade.toUser.id === activeUser.id;
            const partnerName = isReceived ? trade.fromUser.username : trade.toUser.username;

            return (
              <div key={trade.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
                <div className="flex-1 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isReceived ? `📩 Nhận đề xuất từ @${partnerName}` : `📤 Đã gửi tới @${partnerName}`}
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {}
                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 text-center min-w-[150px] w-full sm:w-auto shadow-inner">
                      <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block mb-1">Thẻ Đưa Ra</span>
                      <div className="font-bold text-white text-sm truncate">{trade.offeredCard.name}</div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider inline-block mt-1">
                        {trade.offeredCard.rarity}
                      </span>
                    </div>

                    <div className="text-slate-600 text-2xl font-bold select-none rotate-90 sm:rotate-0">⇆</div>

                    {}
                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 text-center min-w-[150px] w-full sm:w-auto shadow-inner">
                      <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block mb-1">Thẻ Yêu Cầu</span>
                      <div className="font-bold text-white text-sm truncate">{trade.requestedCard.name}</div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider inline-block mt-1">
                        {trade.requestedCard.rarity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t border-slate-800/40 md:border-t-0 pt-3 md:pt-0">
                  {}
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${getStatusStyles(trade.status)}`}>
                    {getStatusLabel(trade.status)}
                  </span>

                  {}
                  {trade.status === 'PENDING' && isReceived && (
                    <div className="flex gap-2">
                      <button
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleAccept(trade.id)}
                      >
                        Chấp Nhận
                      </button>
                      <button
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleReject(trade.id)}
                      >
                        Từ Chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
