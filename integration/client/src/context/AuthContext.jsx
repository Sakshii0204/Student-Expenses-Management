import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sem_auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('sem_auth_token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Listen for global session expiration events triggered by API client
  useEffect(() => {
    function handleSessionExpired() {
      logout();
    }
    window.addEventListener('sem_session_expired', handleSessionExpired);
    return () => window.removeEventListener('sem_session_expired', handleSessionExpired);
  }, [logout]);

  // Load session on startup
  useEffect(() => {
    async function initSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (err) {
        // Discard invalid token silently
        logout();
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, [token, logout]);

  async function login(email, password) {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;

        localStorage.setItem('sem_auth_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message, errors: err.errors };
    }
  }

  async function register(payload) {
    setError(null);
    try {
      const response = await authApi.register(payload);
      if (response.success && response.data) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;

        localStorage.setItem('sem_auth_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message, errors: err.errors };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider');
  }
  return context;
}
