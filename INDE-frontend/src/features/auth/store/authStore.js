// src/features/auth/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginRequest, registerRequest, resetPasswordRequest, getAllUsersRequest } from '../../../shared/apis/authApi';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      users: [],

      login: async ({ username, password }) => {
        try {
          set({ loading: true, error: null });
          
          const { data } = await loginRequest({ username, password });
          const userObj = data.data.user;
          const name = userObj.firstName && userObj.surname
            ? `${userObj.firstName} ${userObj.surname}`
            : userObj.firstName || userObj.username || 'Usuario';
          const userWithName = { ...userObj, name };
          
          set({
            user: userWithName,
            token: data.data.token,
            isAuthenticated: true,
            error: null,
          });

          toast.success(`Bienvenido ${name}`);
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

      fetchUsers: async () => {
        try {
          const { token } = get();
          if (!token) return;
          const { data } = await getAllUsersRequest(token);
          set({ users: data.data || [] });
        } catch (err) {
          console.error('Error al obtener lista de usuarios:', err);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          users: [],
        });
        toast.success('Sesión cerrada correctamente');
      },
    }),
    {
      name: 'auth-storage-inde', // Nombre con el que se guarda en el navegador
    }
  )
);
