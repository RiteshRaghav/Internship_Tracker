import axios from 'axios';

// Use explicit backend base URL to avoid relying on dev proxy when app is served from a different origin
// Can be overridden via environment variable when using CRA: REACT_APP_API_BASE_URL
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_URL = `${API_BASE}/api/auth`;



export const AuthService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Store user data with ID for API calls
                const userData = {
                    id: response.data.user?.id || null,
                    email: response.data.user?.email || email,
                    name: response.data.user?.name || '',
                    branch: response.data.user?.branch || '',
                    college: response.data.user?.college || ''
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            
            return response.data;
        } catch (error) {
            const message = (error.response?.data?.message)
                || (typeof error.response?.data === 'string' ? error.response.data : null)
                || error.message
                || 'Login failed';
            throw new Error(message);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    register: async (user) => {
        try {
            const response = await axios.post(`${API_URL}/register`, user);
            if (response.data) {
                // After registration, the user should login
                const loginResponse = await AuthService.login(user.email, user.password);
                return loginResponse;
            }
            return response.data;
        } catch (error) {
            const message = (error.response?.data?.message)
                || (typeof error.response?.data === 'string' ? error.response.data : null)
                || error.message
                || 'Registration failed';
            throw new Error(message);
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    refreshUser: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                const userData = {
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.name || '',
                    branch: response.data.branch || '',
                    college: response.data.college || ''
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            
            throw new Error('Failed to refresh user data');
        } catch (error) {
            console.error('Error refreshing user data:', error);
            throw error.response?.data || error.message;
        }
    },

    googleLogin: async (accessToken) => {
        try {
            const response = await axios.post(`${API_URL}/google`, { token: accessToken });
            
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                const userData = {
                    id: response.data.user?.id || null,
                    email: response.data.user?.email || '',
                    name: response.data.user?.name || '',
                    branch: response.data.user?.branch || '',
                    college: response.data.user?.college || ''
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Google login error:', error);
            throw error.response?.data || error.message;
        }
    },

    // Forgot/Reset password
    requestPasswordReset: async (email) => {
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            return response.data; // { message, token? }
        } catch (error) {
            const message = (error.response?.data?.message)
                || (typeof error.response?.data === 'string' ? error.response.data : null)
                || error.message
                || 'Request failed';
            throw new Error(message);
        }
    },

    resetPassword: async (token, password) => {
        try {
            const response = await axios.post(`${API_URL}/reset-password`, { token, password });
            return response.data; // { message }
        } catch (error) {
            const message = (error.response?.data?.message)
                || (typeof error.response?.data === 'string' ? error.response.data : null)
                || error.message
                || 'Reset failed';
            throw new Error(message);
        }
    }
};
