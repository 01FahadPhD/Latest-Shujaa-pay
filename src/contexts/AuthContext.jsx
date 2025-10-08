// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Only run in browser

    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
    } catch (error) {
      console.error('❌ Error loading auth data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
