import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/indetasks/v1/auth',
  headers: { 'Content-Type': 'application/json' },
});

export const loginRequest = (credentials) => authApi.post('/login', credentials);
export const registerRequest = (userData) => authApi.post('/', userData);
export const resetPasswordRequest = (email) => authApi.post('/forgot-password', { email });
export const activateAccountRequest = (token) => authApi.get(`/activate/${token}`);
export const setNewPasswordRequest = (token, newPassword) => authApi.post(`/reset-password/${token}`, { newPassword });
export const getAllUsersRequest = (token) => authApi.get('/users', { headers: { Authorization: `Bearer ${token}` } });
