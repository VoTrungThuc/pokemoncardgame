import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-16 border-t border-gray-100">

      {/* ── BENEFITS STRIP ── */}
      <div className="w-full gradient-animated pokeball-bg pokemon-pattern py-5 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🚀', title: 'Giao Hàng Siêu Tốc', sub: 'Hỏa tốc toàn quốc • COD' },
            { icon: '🛡️', title: '100% Chính Hãng', sub: 'Cam kết Pokemon Center' },
            { icon: '🎁', title: 'Tích Điểm Trainer', sub: 'Ưu đãi khi tích lũy mua sắm' },
            { icon: '📞', title: 'Hỗ Trợ 9:00 - 21:00', sub: 'Hotline: 0909.123.456' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/15 hover:bg-white/20 transition-all duration-300"
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider leading-none">{item.title}</h4>
                <p className="text-[9px] text-white/70 font-semibold mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN FOOTER ── */}
      <div className="w-full bg-gray-950 px-4 py-10 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e53935] border-[3px] border-white/20 relative overflow-hidden flex items-center justify-center shadow-lg">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white border-t-[2.5px] border-white/30" />
                <div className="absolute z-10 w-3 h-3 rounded-full bg-white border-[2px] border-white/40" />
              </div>
              <div>
                <span className="text-lg font-black text-white leading-none block">
                  Poke<span className="text-[#e53935]">Card</span> Store
                </span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Thẻ Bài &amp; Đồ Chơi Pokemon</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed max-w-xs font-medium">
              Chuyên kinh doanh thẻ bài Pokemon TCG, Pack Sealed Box, gấu bông và mô hình Pokemon Center chính hãng tại Việt Nam.
            </p>

            {/* Locations */}
            <div className="space-y-2">
              {[
                { label: 'PokeCard Q7', addr: '123 Nguyễn Văn Linh, Quận 7, TP.HCM' },
                { label: 'PokeCard Q1', addr: '45 Bùi Thị Xuân, Quận 1, TP.HCM' },
              ].map((loc, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="text-[#e53935] flex-shrink-0 mt-0.5">📍</span>
                  <span>
                    <span className="text-gray-300 font-black">{loc.label}: </span>
                    <span className="text-gray-500 font-medium">{loc.addr}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { bg: '#1877f2', icon: '📘', label: 'Facebook' },
                { bg: '#ff0000', icon: '📺', label: 'YouTube' },
                { bg: '#000000', icon: '🎵', label: 'TikTok' },
                { bg: 'linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)', icon: '📸', label: 'Instagram' },
              ].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  title={s.label}
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm hover:scale-110 transition-all duration-300 shadow-md"
                  style={{ background: s.bg }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Hotline */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.16em] pb-2 border-b border-gray-800">
              Đường Dây Nóng
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-wider">TP. Hồ Chí Minh</p>
                <a href="tel:0909123456" className="text-[#e53935] font-black text-lg hover:text-red-400 transition-colors">
                  0909.123.456
                </a>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-wider">Hà Nội / COD Toàn Quốc</p>
                <a href="tel:0909654321" className="text-[#e53935] font-black text-lg hover:text-red-400 transition-colors">
                  0909.654.321
                </a>
              </div>
              <div className="pt-1">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-wider mb-1">Email hỗ trợ</p>
                <a href="mailto:support@pokecardstore.com" className="text-xs text-gray-400 hover:text-white transition-colors font-medium">
                  support@pokecardstore.com
                </a>
              </div>
              <div className="bg-gray-900 rounded-xl px-3 py-2.5 border border-gray-800">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Giờ mở cửa</p>
                <p className="text-xs text-white font-bold">⏰ 9:00 – 21:00 (Hằng ngày)</p>
              </div>
            </div>
          </div>

          {/* Support links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.16em] pb-2 border-b border-gray-800">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2.5">
              {[
                '📄 Điều khoản giao dịch',
                '🔒 Chính sách bảo mật',
                '🚚 Phương thức giao hàng',
                '🔄 Chính sách đổi trả',
                '🛡️ Bảo hành &amp; bọc thẻ',
                '💳 Phương thức thanh toán',
              ].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-[11px] text-gray-500 hover:text-[#e53935] transition-colors font-medium flex items-start gap-1">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.16em] pb-2 border-b border-gray-800">
              Về PokeCard Store
            </h4>
            <div className="space-y-3">
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Mã số doanh nghiệp: <span className="text-gray-400 font-black">031953881</span>
                <br/>do Sở KH&ĐT TP.HCM cấp.
              </p>

              {/* Trust badges */}
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 bg-[#0277bd]/20 border border-[#0288d1]/30 text-white px-3 py-2 rounded-xl hover:bg-[#0288d1]/30 transition-all text-[10px] font-black">
                  <span className="w-5 h-5 rounded-full bg-[#0288d1] text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">✓</span>
                  <div className="leading-none">
                    <p className="text-[7px] font-black uppercase tracking-wider text-blue-300">Đã thông báo</p>
                    <p className="text-[9px] font-black">Bộ Công Thương</p>
                  </div>
                </a>
              </div>

              {/* Cam kết */}
              <div className="space-y-1.5 pt-1">
                {['100% Thẻ Pokemon chính hãng', 'Đóng gói sleeve + toploader kĩ', 'Hỗ trợ đổi trả trong 7 ngày'].map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                    <span className="text-emerald-500 font-black text-xs flex-shrink-0">✓</span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="w-full bg-black py-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
          © {year} PokeCard Store. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          {['Visa', 'MasterCard', 'MoMo', 'VNPay', 'COD'].map((p, i) => (
            <span key={i} className="text-[8px] font-black text-gray-700 bg-gray-900 border border-gray-800 px-2 py-1 rounded-md uppercase tracking-wider">
              {p}
            </span>
          ))}
        </div>
      </div>

    </footer>
  );
}
