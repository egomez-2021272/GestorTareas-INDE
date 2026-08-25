// src/features/auth/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// CORRECCIÓN: Ajustamos la ruta para importar el mock
import { loginRequest } from '../../../shared/apis/authMock';
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
          
          // Llamamos a nuestra API falsa
          const { data } = await loginRequest({ username, password });
          
          // Si es exitoso, guardamos los datos
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            error: null,
          });

          toast.success(`Bienvenido ${data.data.user.name}`);
          return { success: true };
          
        } catch (err) {
          // Extraemos el mensaje de error del mock
          const message = err.response?.data?.message || 'Error al iniciar sesión';
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