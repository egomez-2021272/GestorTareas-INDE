// src/features/auth/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginRequest, registerRequest, resetPasswordRequest } from '../../../shared/apis/authApi';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async ({ username, password }) => {
        try {
          set({ loading: true, error: null });
          
          const { data } = await loginRequest({ username, password });
          
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            error: null,
          });

          toast.success(`Bienvenido ${data.data.user.name}`);
          return { success: true };
          
        } catch (err) {
          const message = err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión';
          set({ error: message });
          toast.error(message);
          return { success: false, error: message };
          
        } finally {
          set({ loading: false });
        }
      },

      registerUser: async (userData) => {
        try {
          set({ loading: true, error: null });
          const { data } = await registerRequest(userData);
          toast.success(data.message);
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error al registrar usuario';
          set({ error: message });
          toast.error(message);
          return { success: false, error: message };
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (email) => {
        try {
          set({ loading: true, error: null });
          const { data } = await resetPasswordRequest(email);
          toast.success(data.message);
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al restablecer contraseña';
          set({ error: message });
          toast.error(message);
          return { success: false, error: message };
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        toast.success('Sesión cerrada correctamente');
      },
    }),
    {
      name: 'auth-storage-inde', // Nombre con el que se guarda en el navegador
    }
  )
);
