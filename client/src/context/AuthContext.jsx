import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('expense_tracker_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('expense_tracker_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('expense_tracker_token');
    localStorage.removeItem('expense_tracker_user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Check current session validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('expense_tracker_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.data && response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('expense_tracker_user', JSON.stringify(response.data.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, clearing auth:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for unauthorized events emitted by axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('expense_tracker_token', receivedToken);
      localStorage.setItem('expense_tracker_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setError(null);
    try {
      const response = await authService.register({ name, email, password, confirmPassword });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('expense_tracker_token', receivedToken);
      localStorage.setItem('expense_tracker_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('expense_tracker_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
