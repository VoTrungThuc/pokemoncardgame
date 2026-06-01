import React, { useState, useEffect } from 'react';

export default function CustomModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert', 
  defaultValue = '',
  placeholder = '',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  icon = '💡'
}) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'prompt') {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl max-w-md w-full overflow-hidden z-10 transform scale-100 transition-all duration-300 animate-scale-in">
        
        {}
        <div className="h-2 bg-[#e53935]" />

        <div className="p-6">
          {}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-2xl shrink-0">
              {icon}
            </div>
            <div className="space-y-1.5 flex-grow">
              <h3 className="text-lg font-black text-gray-900 leading-snug">{title}</h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">{message}</p>
            </div>
          </div>

          {}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {type === 'prompt' && (
              <div>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e53935] focus:bg-white transition-all font-bold shadow-inner"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                  required
                />
              </div>
            )}

            {}
            <div className="flex justify-end gap-3 pt-2">
              {type !== 'alert' && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer transition-all"
                >
                  {cancelText}
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#e53935] hover:bg-[#d32f2f] text-white shadow-md cursor-pointer transition-all"
              >
                {confirmText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
