import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MapLocation({ isEmbedded = false }) {
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await api.getLocations();
      setLocations(data || []);
      if (data && data.length > 0) {
        setSelectedLoc(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openDirections = (loc) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm animate-fade-in">
        <div className="text-4xl animate-spin text-[#e53935]">◓</div>
        <p className="text-gray-500 text-sm mt-4 font-black tracking-wider uppercase">Đang tải vị trí cửa hàng...</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${isEmbedded ? 'h-full flex flex-col' : 'space-y-6'}`}>
      {!isEmbedded && (
        <div className="pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Hệ Thống Cửa Hàng PokeCard Store
          </h2>
          <p className="text-xs text-gray-500 font-bold">Tìm cửa hàng gần nhất để được tư vấn trực tiếp và khám phá bộ sưu tập sản phẩm Pokemon chính hãng.</p>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isEmbedded ? 'flex-1 min-h-0' : ''}`}>
        {}
        <div className={`lg:col-span-5 space-y-4 ${isEmbedded ? 'overflow-y-auto max-h-[500px] pr-2' : ''}`}>
          {locations.map((loc) => {
            const isSelected = selectedLoc?.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className={`border-2 rounded-2xl p-4.5 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xs ${
                  isSelected 
                    ? 'bg-red-50/40 border-[#e53935] text-gray-900 shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#e53935]/10 rounded-bl-full flex items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-[#e53935] font-black rotate-45 translate-x-2 -translate-y-2">CHỌN</span>
                  </div>
                )}
                <h3 className="font-extrabold text-sm tracking-tight mb-2.5 flex items-center gap-2 text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e53935]"><path d="m2 7 4.41-3.67A2 2 0 0 1 7.7 3h8.6a2 2 0 0 1 1.3.33L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M3 12h18"/></svg>
                  {loc.name}
                </h3>
                <div className="text-xs space-y-1.5 text-gray-550 font-semibold">
                  <p className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-gray-400 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span><span className="text-gray-450 font-normal">Địa chỉ:</span> {loc.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span><span className="text-gray-450 font-normal">Hotline:</span> {loc.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span><span className="text-gray-450 font-normal">Giờ mở cửa:</span> {loc.workingHours}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-150 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(loc);
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-250 hover:border-gray-300 text-gray-700 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    <span>Chỉ đường</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div className={`lg:col-span-7 flex flex-col gap-4 ${isEmbedded ? 'h-full' : ''}`}>
          {selectedLoc && (
            <div className={`bg-white border border-gray-200 rounded-3xl p-4 flex flex-col shadow-xs ${isEmbedded ? 'h-full min-h-[380px]' : 'h-[480px]'}`}>
              <div className="flex justify-between items-center pb-3 border-b border-gray-150 mb-3">
                <div>
                  <h4 className="text-sm font-black text-gray-900">{selectedLoc.name}</h4>
                  <span className="text-[10px] text-gray-450 font-bold block">{selectedLoc.address}</span>
                </div>
                <button
                  onClick={() => openDirections(selectedLoc)}
                  className="px-3.5 py-2 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  <span>Bản đồ</span>
                </button>
              </div>

              {}
              <div className="flex-1 w-full bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden relative min-h-[220px]">
                <iframe
                  title="Store Map Location"
                  src={`https://maps.google.com/maps?q=${selectedLoc.latitude},${selectedLoc.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
