import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [activeUser, setActiveUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    const res = await api.login({ username, password });
    localStorage.setItem('token', res.token);
    localStorage.setItem('refreshToken', res.refreshToken);
    const user = {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role
    };
    localStorage.setItem('user', JSON.stringify(user));
    setActiveUser(user);
    return user;
  };

  const register = async (username, email, password, phone, shippingAddress, role) => {
    return await api.register({ username, email, password, phone, shippingAddress, role });
  };

  const verifyOtp = async (email, otp) => {
    return await api.verifyOtp(email, otp);
  };

  const logout = async () => {
    const rt = localStorage.getItem('refreshToken');
    if (rt) {
      try {
        await api.logout(rt);
      } catch (err) {
        console.error('Logout error on server', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setActiveUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profileData = await api.getProfile();
      const updatedUser = {
        ...activeUser,
        phone: profileData.phone,
        shippingAddress: profileData.shippingAddress,
        avatarUrl: profileData.avatarUrl,
        balance: profileData.balance,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setActiveUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    const updatedUser = {
      ...activeUser,
      phone: res.phone,
      shippingAddress: res.shippingAddress,
      avatarUrl: res.avatarUrl,
      balance: res.balance,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);
    return updatedUser;
  };

  useEffect(() => {
    const handleLogoutEvent = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setActiveUser(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  return (
    <AuthContext.Provider value={{ activeUser, login, register, verifyOtp, logout, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
