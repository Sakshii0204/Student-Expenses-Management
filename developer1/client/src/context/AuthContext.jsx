import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sem_auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadActiveSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadActiveSession();
  }, [token]);

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

  async function register(formData) {
    setError(null);
    try {
      const response = await authApi.register(formData);
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

  function logout() {
    localStorage.removeItem('sem_auth_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
