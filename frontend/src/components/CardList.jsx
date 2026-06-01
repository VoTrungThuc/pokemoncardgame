import React, { useState, useEffect } from 'react';
import CardCard from './CardCard';
import { api } from '../services/api';
import CustomModal from './CustomModal';


function BannerSlider() {
  const slides = [
    { image: '/images/home_banner.png', title: 'Mega Evolution Chaos Rising 22.05.2026' },
    { image: '/images/banner_sealed.png', title: 'Hộp bài & Gói bài Sealed Pokemon TCG chính hãng' },
    { image: '/images/banner_toys.png', title: 'Gấu bông & Mô hình Pokemon cao cấp' }
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full aspect-[2.6/1] md:aspect-[3.2/1] rounded-[32px] overflow-hidden shadow-premium group bg-white border border-gray-200 hover:shadow-premium-hover transition-all duration-500">
      {}
      <div className="w-full h-full relative">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md hover:scale-105 transition-all opacity-0 group-hover:opacity-100 cursor-pointer font-black text-sm"
      >
        &lt;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md hover:scale-105 transition-all opacity-0 group-hover:opacity-100 cursor-pointer font-black text-sm"
      >
        &gt;
      </button>

      {}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
              idx === current ? 'bg-[#e53935] w-5' : 'bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}


function NewArrivalsSlider({ newArrivalsCards, onSelectCard }) {
  const sliderRef = React.useRef(null);
  
  
  const newArrivals = React.useMemo(() => {
    return newArrivalsCards
      .filter(c => ['Plush', 'Figure', 'Sealed', 'Accessory', 'Game'].includes(c.cpu))
      .slice(0, 8); 
  }, [newArrivalsCards]);

  if (newArrivals.length === 0) return null;

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 240;
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 240;
    }
  };

  return (
    <div className="w-full bg-white border border-gray-150 rounded-[32px] p-5 shadow-premium space-y-4 relative animate-fade-in">
      {}
      <div className="w-full bg-[#e53935] h-10 rounded-2xl relative overflow-hidden flex items-center shadow-inner">
        <div className="bg-[#b71c1c] text-white font-black text-xs md:text-sm px-6 h-full flex items-center rounded-r-2xl shadow-md uppercase tracking-wider">
          🔥 Hàng Mới Về
        </div>
      </div>

      {}
      <div className="relative px-6">
        {}
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow hover:bg-gray-50 transition-all hover:scale-105 cursor-pointer font-black text-base"
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={scrollRight}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow hover:bg-gray-50 transition-all hover:scale-105 cursor-pointer font-black text-base"
        >
          &gt;
        </button>

        {}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto scrollbar-none py-2 scroll-smooth"
        >
          {newArrivals.map((card) => {
            const isNonCard = ['Sealed', 'Plush', 'Figure', 'Accessory', 'Game'].includes(card.cpu);
            const price = card.promoPrice !== null ? card.promoPrice : card.price;
            const vndPrice = Math.round(price * 25000);
            
            return (
              <div
                key={card.id}
                onClick={() => onSelectCard(card.id)}
                className="w-[180px] flex-shrink-0 bg-white border border-gray-150 rounded-2xl p-3 flex flex-col justify-between hover:shadow-premium-hover hover:border-red-200 transition-all duration-300 cursor-pointer relative group"
              >
                {}
                <div className="absolute top-2 right-2 z-10 bg-[#7cb342] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">
                  Mới
                </div>

                {}
                <div className="w-full aspect-square bg-gray-50/50 rounded-xl flex items-center justify-center p-2 mb-2 relative overflow-hidden border border-gray-100 group-hover:bg-white transition-colors duration-300">
                  <img 
                    src={card.imageUrl} 
                    alt={card.name} 
                    className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = isNonCard ? '/images/booster_box_151.png' : 'https://images.pokemontcg.io/xy12/1.png';
                    }}
                  />
                  {card.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] flex items-center justify-center">
                      <span className="bg-black/85 text-white font-black text-[8px] px-2 py-1 rounded uppercase tracking-wider">
                        Hết Hàng
                      </span>
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-1 text-left flex-grow flex flex-col justify-between">
                  <h4 className="font-extrabold text-gray-900 text-xs leading-snug line-clamp-2 h-8 overflow-hidden group-hover:text-[#e53935] transition-colors duration-200" title={card.name}>
                    {card.name}
                  </h4>
                  
                  <span className="text-xs font-black text-[#e53935] block pt-2 text-center border-t border-gray-100/50">
                    {vndPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CardList({ 
  onSelectCard, 
  activeUser, 
  search, 
  setSearch, 
  selectedCategory, 
  setSelectedCategory,
  initialEditCard,
  clearInitialEditCard
}) {
  const [cards, setCards] = useState([]);
  const [newArrivalsCards, setNewArrivalsCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [brand, setBrand] = useState('');       
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isPromo, setIsPromo] = useState('');
  const [sort, setSort] = useState('id,desc');

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

  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    imageUrl: '/images/booster_box_151.png',
    price: '',
    promoPrice: '',
    description: '',
    ram: '',      
    rom: '',      
    cpu: '',      
    camera: '',   
    battery: '',  
    screen: '',   
    os: '',       
    stock: '',
    isAvailable: true
  });

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search && search.trim()) params.name = search;
      if (brand) params.brand = brand;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (isPromo) params.isPromo = isPromo === 'true';
      if (sort) params.sort = sort;

      const data = await api.getProducts(params);
      
      
      let filtered = data;
      if (selectedCategory === 'single') {
        filtered = data.filter(c => !['Sealed', 'Plush', 'Figure', 'Accessory', 'Game'].includes(c.cpu));
      } else if (selectedCategory) {
        filtered = data.filter(c => c.cpu === selectedCategory);
      }

      setCards(filtered);
      setError(null);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
      } else {
        setError('Không thể kết nối tới server. Vui lòng kiểm tra Spring Boot đã chạy chưa.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => { fetchCards(); }, 300);
    return () => clearTimeout(delay);
  }, [search, brand, minPrice, maxPrice, isPromo, sort, selectedCategory]);

  useEffect(() => {
    if (initialEditCard) {
      handleEditCard(initialEditCard);
      if (clearInitialEditCard) {
        clearInitialEditCard();
      }
    }
  }, [initialEditCard]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const data = await api.getProducts({ sort: 'id,desc' });
        setNewArrivalsCards(data || []);
      } catch (err) {
        console.error('Không thể tải sản phẩm mới về', err);
      }
    };
    fetchNewArrivals();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditCard = (card) => {
    setEditingCardId(card.id);
    setFormData({
      name: card.name, 
      brand: card.brand,
      imageUrl: card.imageUrl || '/images/booster_box_151.png',
      price: card.price.toString(),
      promoPrice: card.promoPrice ? card.promoPrice.toString() : '',
      description: card.description || '',
      ram: card.ram || '', 
      rom: card.rom || '', 
      cpu: card.cpu || '',
      camera: card.camera || '', 
      battery: card.battery || '',
      screen: card.screen || '', 
      os: card.os || '',
      stock: card.stock.toString(), 
      isAvailable: card.isAvailable
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCard = (id) => {
    const cardToDelete = cards.find(c => c.id === id);
    const cardName = cardToDelete ? cardToDelete.name : 'sản phẩm này';
    showModal({
      title: 'Xóa sản phẩm',
      message: `Bạn có chắc chắn muốn xóa "${cardName}" khỏi cửa hàng không? Hành động này không thể hoàn tác.`,
      type: 'confirm',
      confirmText: 'Xóa ngay',
      cancelText: 'Hủy',
      icon: '🗑️',
      onConfirm: async () => {
        try {
          await api.deleteProduct(id);
          showModal({
            title: 'Thành công',
            message: 'Đã xóa sản phẩm thành công!',
            type: 'alert',
            confirmText: 'OK',
            icon: '✓',
            onConfirm: () => {
              fetchCards();
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
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingCardId(null);
    setFormData({ 
      name: '', 
      brand: '', 
      imageUrl: '/images/booster_box_151.png', 
      price: '', 
      promoPrice: '', 
      description: '', 
      ram: '', 
      rom: '', 
      cpu: '', 
      camera: '', 
      battery: '', 
      screen: '', 
      os: '', 
      stock: '', 
      isAvailable: true 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      showModal({
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền đầy đủ tên sản phẩm, giá và số lượng.',
        type: 'alert',
        confirmText: 'Đóng',
        icon: '⚠️',
        onConfirm: () => {}
      });
      return;
    }
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
        stock: parseInt(formData.stock),
      };
      if (editingCardId) {
        await api.updateProduct(editingCardId, payload);
        showModal({
          title: 'Cập nhật thành công',
          message: 'Cập nhật thông tin sản phẩm thành công!',
          type: 'alert',
          confirmText: 'OK',
          icon: '✓',
          onConfirm: () => {
            handleCloseForm();
            fetchCards();
          }
        });
      } else {
        await api.createProduct(payload);
        showModal({
          title: 'Thêm mới thành công',
          message: 'Đã thêm sản phẩm mới thành công vào cửa hàng!',
          type: 'alert',
          confirmText: 'OK',
          icon: '✓',
          onConfirm: () => {
            handleCloseForm();
            fetchCards();
          }
        });
      }
    } catch (err) {
      showModal({
        title: 'Lỗi hệ thống',
        message: 'Thao tác thất bại: ' + (err.response?.data?.message || err.message),
        type: 'alert',
        confirmText: 'Đóng',
        icon: '⚠️',
        onConfirm: () => {}
      });
    }
  };

  const isFormNonCard = ['Sealed', 'Plush', 'Figure', 'Accessory', 'Game'].includes(formData.cpu);

  const inputClass = "bg-white border-2 border-gray-250 text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e53935] transition-all text-sm w-full";
  const labelClass = "text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-1";

  
  const sidebarItems = [
    { label: '🌍 Tất Cả Sản Phẩm', key: '' },
    { label: '🎴 Thẻ Bài Lẻ TCG', key: 'single' },
    { label: '📦 Hộp & Gói Bài (Sealed)', key: 'Sealed' },
    { label: '🧸 Gấu Bông Pokemon', key: 'Plush' },
    { label: '🤖 Mô Hình Figure', key: 'Figure' },
    { label: '🛡️ Phụ Kiện TCG', key: 'Accessory' },
    { label: '🎮 Game & Máy Nintendo', key: 'Game' },
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-premium">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
            {activeUser?.role === 'ADMIN' ? '🛡️ Quản Lý Kho Hàng' : '🏪 PokeCard Store - Cửa Hàng Pokemon'}
          </h2>
          <p className="text-sm text-gray-550 mt-1">
            {activeUser?.role === 'ADMIN'
              ? 'Thêm, sửa, hoặc xóa các sản phẩm Pokemon (thẻ bài lẻ, pack bài, gấu bông, mô hình, phụ kiện).'
              : 'Thỏa sức khám phá thế giới thẻ bài, gấu bông và mô hình Pokemon chính hãng.'}
          </p>
        </div>

        {activeUser?.role === 'ADMIN' && (
          <button
            className="self-start sm:self-auto px-5 py-2.5 bg-[#e53935] hover:bg-[#d32f2f] text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            onClick={() => { if (showAddForm) { handleCloseForm(); } else { setShowAddForm(true); } }}
          >
            {showAddForm ? '✕ Đóng Form' : '＋ Thêm Sản Phẩm Mới'}
          </button>
        )}
      </div>

      {}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-premium rounded-3xl p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-black text-gray-900 border-b border-gray-150 pb-2 flex items-center gap-2">
            {editingCardId ? '✏️ Sửa Thông Tin Sản Phẩm' : '🃏 Thêm Sản Phẩm Pokemon Mới'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tên sản phẩm *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="e.g. Gấu bông Pikachu (20cm) Đáng Yêu" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Tên Pokemon/Dòng (Brand) *</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleInputChange}
                placeholder="e.g. Pikachu" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>URL Hình Ảnh sản phẩm</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange}
                placeholder="/images/plush_pikachu.png" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Giá bán ($) *</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange}
                placeholder="19.99" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Giá khuyến mãi ($)</label>
              <input type="number" step="0.01" name="promoPrice" value={formData.promoPrice}
                onChange={handleInputChange} placeholder="Để trống nếu không sale" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Số lượng tồn kho *</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange}
                placeholder="10" className={inputClass} required />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable}
                onChange={handleInputChange} className="w-4 h-4 rounded text-[#e53935] focus:ring-[#e53935]" />
              <label htmlFor="isAvailable" className="text-xs font-black text-gray-700 cursor-pointer">Còn bán trên web</label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Mô tả sản phẩm</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange}
              placeholder="Mô tả kích thước, chất liệu, xuất xứ..." rows={3}
              className="bg-white border-2 border-gray-250 text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e53935] text-sm w-full resize-none" />
          </div>

          <h4 className="text-xs font-black text-[#e53935] uppercase tracking-wider pt-2 border-t border-gray-150">
            Thông số kỹ thuật tùy biến
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Phân Loại/Hệ (cpu) *</label>
              <select name="cpu" value={formData.cpu} onChange={handleInputChange} className={inputClass} required>
                <option value="">-- Chọn danh mục --</option>
                <option value="Fire">Hệ Lửa (Fire)</option>
                <option value="Water">Hệ Nước (Water)</option>
                <option value="Grass">Hệ Cỏ (Grass)</option>
                <option value="Lightning">Hệ Sấm Sét (Lightning)</option>
                <option value="Psychic">Hệ Siêu Linh (Psychic)</option>
                <option value="Fighting">Hệ Đấu Sĩ (Fighting)</option>
                <option value="Darkness">Hệ Bóng Tối (Darkness)</option>
                <option value="Dragon">Hệ Rồng (Dragon)</option>
                <option value="Colorless">Hệ Thường (Colorless)</option>
                <option value="Trainer">Thẻ Trainer</option>
                <option value="Sealed">Pack Chưa Mở (Sealed)</option>
                <option value="Plush">Gấu Bông Pokemon (Plush)</option>
                <option value="Figure">Mô Hình Figure</option>
                <option value="Accessory">Phụ Kiện TCG</option>
                <option value="Game">Game & Máy Chơi Game</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{isFormNonCard ? 'Kích thước / Quy cách' : 'Độ Hiếm (Rarity)'}</label>
              <input type="text" name="ram" value={formData.ram} onChange={handleInputChange}
                placeholder={isFormNonCard ? "e.g. 20cm, Hộp 9 packs" : "e.g. Secret Rare, VMAX"} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{isFormNonCard ? 'Hãng sản xuất / Thương hiệu' : 'Tình Trạng (Condition)'}</label>
              <input type="text" name="rom" value={formData.rom} onChange={handleInputChange}
                placeholder={isFormNonCard ? "e.g. Pokemon Center, Takara Tomy" : "e.g. Near Mint, Mint"} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{isFormNonCard ? 'Chất liệu / Chi tiết' : 'HP'}</label>
              <input type="text" name="camera" value={formData.camera} onChange={handleInputChange}
                placeholder={isFormNonCard ? "e.g. Vải bông nhung, Nhựa PVC" : "e.g. 330 HP"} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{isFormNonCard ? 'Mã sản phẩm / SKU' : 'Số thẻ (Card Number)'}</label>
              <input type="text" name="battery" value={formData.battery} onChange={handleInputChange}
                placeholder={isFormNonCard ? "e.g. PL-PIKA-01" : "e.g. 199/165"} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{isFormNonCard ? 'Dòng sản phẩm / Bộ sưu tập' : 'Bộ thẻ (Set Name)'}</label>
              <input type="text" name="screen" value={formData.screen} onChange={handleInputChange}
                placeholder={isFormNonCard ? "e.g. Kỷ niệm 25 năm, Moncolle" : "e.g. Scarlet & Violet 151"} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{isFormNonCard ? 'Nhà cung cấp / Hãng' : 'Họa Sĩ (Artist)'}</label>
              <input type="text" name="os" value={formData.os} onChange={handleInputChange}
                placeholder={isFormNonCard ? "e.g. Nintendo Japan" : "e.g. Mitsuhiro Arita"} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
            <button type="button" onClick={handleCloseForm}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-xl cursor-pointer">
              Hủy
            </button>
            <button type="submit"
              className="px-5 py-2 bg-[#e53935] hover:bg-[#d32f2f] text-white text-sm font-bold rounded-xl shadow-md cursor-pointer">
              {editingCardId ? 'Cập Nhật' : 'Thêm Sản Phẩm'}
            </button>
          </div>
        </form>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {}
        <div className="col-span-12 lg:col-span-3 space-y-6 sticky top-28 z-20">
          {}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-premium">
            <div className="bg-gradient-to-r from-[#e53935] to-[#d32f2f] text-white px-5 py-4.5 font-black tracking-wider text-sm flex items-center gap-2 shadow-sm">
              <span>🗂️</span> DANH MỤC SẢN PHẨM
            </div>
            <div className="flex flex-col">
              {sidebarItems.map(item => {
                const isActive = selectedCategory === item.key;
                return (
                  <button
                    key={item.label}
                    onClick={() => setSelectedCategory(item.key)}
                    className={`px-5 py-3.5 text-left text-xs md:text-sm font-bold transition-all border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-red-50 hover:text-[#e53935] ${
                      isActive 
                        ? 'bg-red-50 text-[#e53935] border-l-4 border-l-[#e53935]' 
                        : 'text-gray-700 bg-white border-l-4 border-l-transparent'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="text-xs">▶</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-premium p-6 space-y-3">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
              <span className="text-[#e53935]">📞</span> HỖ TRỢ TRỰC TUYẾN
            </h4>
            <div className="text-xs space-y-3 text-gray-600 font-bold">
              <div>
                <p className="text-gray-400 font-bold mb-0.5">Tư vấn bán hàng 1:</p>
                <p className="text-gray-900 text-sm">0909 123 456 (Quận 7)</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold mb-0.5">Tư vấn bán hàng 2:</p>
                <p className="text-gray-900 text-sm">0909 654 321 (Quận 1)</p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-400 font-bold mb-0.5">Email hỗ trợ:</p>
                <p className="text-[#e53935] font-black">support@pokecardstore.com</p>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-premium p-6 space-y-3">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
              <span className="text-[#e53935]">🛡️</span> CAM KẾT CỦA SHOP
            </h4>
            <ul className="text-xs space-y-3 text-gray-650 font-bold">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm font-black">✓</span> 100% Thẻ Pokemon chính hãng
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm font-black">✓</span> Đóng gói sleeve + toploader kĩ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm font-black">✓</span> Giao hàng hỏa tốc toàn quốc
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm font-black">✓</span> Hỗ trợ đổi trả trong 7 ngày
              </li>
            </ul>
          </div>
        </div>

        {}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {}
          {selectedCategory === '' && (
            <>
              <BannerSlider />
              {!search && !brand && !minPrice && !maxPrice && !isPromo && (
                <NewArrivalsSlider newArrivalsCards={newArrivalsCards} onSelectCard={onSelectCard} />
              )}
            </>
          )}

          {}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-premium grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div className="md:col-span-3 space-y-1">
              <label className={labelClass}>Pokemon</label>
              <select className="bg-white border-2 border-gray-250 text-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e53935] text-sm w-full cursor-pointer"
                value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">Tất cả Pokemon</option>
                <option value="Pikachu">Pikachu</option>
                <option value="Charizard">Charizard</option>
                <option value="Mewtwo">Mewtwo</option>
                <option value="Snorlax">Snorlax</option>
                <option value="Eevee">Eevee</option>
                <option value="Umbreon">Umbreon</option>
                <option value="Espeon">Espeon</option>
                <option value="Rayquaza">Rayquaza</option>
                <option value="Gengar">Gengar</option>
                <option value="Lugia">Lugia</option>
                <option value="Lucario">Lucario</option>
                <option value="Gardevoir">Gardevoir</option>
              </select>
            </div>

            <div className="md:col-span-5 grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Giá min ($)</label>
                <input type="number" placeholder="0" className="bg-white border-2 border-gray-255 text-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e53935] text-sm w-full"
                  value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Giá max ($)</label>
                <input type="number" placeholder="999" className="bg-white border-2 border-gray-255 text-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e53935] text-sm w-full"
                  value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Khuyến mãi</label>
                <select className="bg-white border-2 border-gray-250 text-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e53935] text-sm w-full cursor-pointer"
                  value={isPromo} onChange={(e) => setIsPromo(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="true">Đang sale</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className={labelClass}>Sắp xếp theo</label>
              <select className="bg-white border-2 border-gray-250 text-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e53935] text-sm w-full cursor-pointer"
                value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="id,desc">Mới nhất</option>
                <option value="price,asc">Giá: Thấp → Cao</option>
                <option value="price,desc">Giá: Cao → Thấp</option>
                <option value="name,asc">Tên A-Z</option>
              </select>
            </div>
          </div>

          {}
          {(!selectedCategory || selectedCategory === 'single') && (
            <div className="flex flex-wrap gap-2 items-center bg-white px-4 py-3 rounded-2xl border border-gray-150 shadow-inner">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1">Độ hiếm thẻ:</span>
              {[
                { label: 'Common', color: 'bg-gray-100 text-gray-600 border border-gray-200' },
                { label: 'Holo Rare', color: 'bg-blue-50 text-blue-600 border border-blue-100' },
                { label: 'VMAX/VSTAR', color: 'bg-red-50 text-red-650 border border-red-100' },
                { label: 'Secret Rare', color: 'bg-purple-50 text-purple-650 border border-purple-100' },
                { label: 'Gold Star', color: 'bg-yellow-50 text-yellow-650 border border-yellow-100' },
                { label: 'Special Art', color: 'bg-pink-50 text-pink-650 border border-pink-100' },
              ].map(r => (
                <span key={r.label} className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${r.color}`}>
                  {r.label}
                </span>
              ))}
            </div>
          )}

          {}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-4xl animate-spin text-[#e53935]">◓</div>
              <p className="text-gray-500 text-sm mt-4 font-black tracking-wider uppercase">Đang tải sản phẩm Pokemon...</p>
            </div>
          ) : error ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
              <p className="text-[#e53935] font-bold">{error}</p>
              <button className="mt-4 px-5 py-2 bg-[#e53935] hover:bg-[#d32f2f] text-white text-sm font-bold rounded-lg cursor-pointer" onClick={fetchCards}>
                Thử lại
              </button>
            </div>
          ) : cards.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
              <div className="text-5xl">🃏</div>
              <p className="text-gray-400 text-sm mt-4 font-bold">Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-bold">
                Tìm thấy <span className="text-[#e53935] font-black">{cards.length}</span> sản phẩm Pokemon
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {cards.map(card => (
                  <CardCard
                    key={card.id}
                    card={card}
                    onSelectCard={onSelectCard}
                    activeUser={activeUser}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                    onRefresh={fetchCards}
                  />
                ))}
              </div>
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
