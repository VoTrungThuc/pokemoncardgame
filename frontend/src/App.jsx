import React, { useState } from 'react';
import Header from './components/Header';
import CardList from './components/CardList';
import CardDetail from './components/CardDetail';
import Login from './components/Login';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Notifications from './components/Notifications';
import Chat from './components/Chat';
import Orders from './components/Orders';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Footer from './components/Footer';
import PaymentResult from './components/PaymentResult';
import { api } from './services/api';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';

function AppContent() {
  const isPaymentResult = window.location.pathname === '/payment-result';
  if (isPaymentResult) {
    return <PaymentResult />;
  }

  const { activeUser } = useAuth();
  const [activeTab, setActiveTab] = useState('market');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [initialEditCard, setInitialEditCard] = useState(null);

  const handleSelectCard = (id) => {
    setSelectedCardId(id);
    setActiveTab('market');
  };

  const handleBackToList = () => {
    setSelectedCardId(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'market') {
      setSelectedCardId(null);
    }
  };

  if (!activeUser) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/80 text-gray-800 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main className="flex-grow w-full px-4 py-6 md:px-8 lg:px-12">

        {activeTab === 'market' && (
          selectedCardId ? (
            <CardDetail
              cardId={selectedCardId}
              onBack={handleBackToList}
              activeUser={activeUser}
              onEditCard={(card) => {
                setInitialEditCard(card);
                setSelectedCardId(null);
              }}
              onDeleteCard={async (id) => {
                if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
                  try {
                    await api.deleteProduct(id);
                    alert('Đã xóa sản phẩm thành công!');
                    setSelectedCardId(null);
                  } catch (err) {
                    alert('Không thể xóa sản phẩm. Có thể sản phẩm đang nằm trong đơn hàng.');
                  }
                }
              }}
              onRefresh={() => {}}
            />
          ) : (
            <CardList
              onSelectCard={handleSelectCard}
              activeUser={activeUser}
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              initialEditCard={initialEditCard}
              clearInitialEditCard={() => setInitialEditCard(null)}
            />
          )
        )}

        {activeTab === 'cart' && (
          <Cart onCheckout={() => setActiveTab('checkout')} />
        )}

        {activeTab === 'checkout' && (
          <Checkout
            onBackToCart={() => setActiveTab('cart')}
            onOrderSuccess={() => {
              alert('🎉 Đặt hàng thành công! Vui lòng theo dõi đơn hàng của bạn.');
              setActiveTab('orders');
            }}
          />
        )}

        {activeTab === 'chat' && (
          <Chat />
        )}

        {activeTab === 'orders' && (
          <Orders activeUser={activeUser} />
        )}

        {activeTab === 'analytics' && activeUser?.role === 'ADMIN' && (
          <AnalyticsDashboard />
        )}


        {activeTab === 'notifications' && (
          <Notifications />
        )}

        {activeTab === 'profile' && (
          <Profile activeUser={activeUser} />
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}