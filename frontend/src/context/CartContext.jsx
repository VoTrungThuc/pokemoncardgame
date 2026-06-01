import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { activeUser } = useAuth();

  const fetchCart = async () => {
    if (!activeUser) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getCart();
      setCartItems(data || []);
    } catch (err) {
      console.error('Error fetching cart', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const item = await api.addToCart(productId, quantity);
      await fetchCart();
      return item;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.updateCartItemQty(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.deleteCartItem(cartItemId);
      await fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCart();
  }, [activeUser]);

  
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.product.promoPrice !== null ? item.product.promoPrice : item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
