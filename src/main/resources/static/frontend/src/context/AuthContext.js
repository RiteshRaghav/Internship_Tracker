import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();
      
      if (storedUser && token) {
        try {
          // Try to refresh user data from the server
          const refreshedUser = await AuthService.refreshUser();
          setUser(refreshedUser);
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          // Fall back to stored user if refresh fails
          setUser(storedUser);
        }
      } else {
        // Clear any invalid data
        AuthService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
      AuthService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const refreshedUser = await AuthService.refreshUser();
      setUser(refreshedUser);
      return refreshedUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const userData = await AuthService.login(credentials.email, credentials.password);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await AuthService.register(userData);
      setUser(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: () => !!user && !!AuthService.getToken()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
