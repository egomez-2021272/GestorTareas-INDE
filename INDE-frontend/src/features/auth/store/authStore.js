// src/features/auth/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  getAllUsersRequest,
  toggleUserStatusRequest,
  createAdminRequest,
} from "../../../shared/apis/authApi";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      requiresPasswordChange: false,
      loading: false,
      error: null,
      users: [],

      login: async ({ username, password }) => {
        try {
          set({ loading: true, error: null });

          const { data } = await loginRequest({ username, password });
          const userObj = data.data.user;
          const name =
            userObj.firstName && userObj.surname
              ? `${userObj.firstName} ${userObj.surname}`
              : userObj.firstName || userObj.username || "Usuario";
          const userWithName = { ...userObj, name };

          set({
            user: userWithName,
            token: data.data.token,
            isAuthenticated: true,
            requiresPasswordChange: data.data.requiresPasswordChange,
            error: null,
          });

          toast.success(`Bienvenido ${name}`);
          return { success: true, requiresPasswordChange: data.data.requiresPasswordChange };
        } catch (err) {
          const message =
            ["ACCOUNT_NOT_ACTIVE", "INVALID_CREDENTIALS"].includes(err.response?.data?.code)
              ? err.response.data.message
              :
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Error al iniciar sesión";
          set({ error: message });
          toast.error(message);
          return { success: false, error: message };
        } finally {
          set({ loading: false });
        }
      },

      completePasswordChange: () => set({ requiresPasswordChange: false }),

      registerUser: async (userData) => {
        try {
          set({ loading: true, error: null });
          const { data } = await registerRequest(userData);
          toast.success(data.message);
          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.errors?.[0]?.msg ||
            err.response?.data?.message ||
            "Error al registrar usuario";
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
          const message =
            err.response?.data?.message || "Error al restablecer contraseña";
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
          console.error("Error al obtener lista de usuarios:", err);
        }
      },

      toggleUserStatus: async (id) => {
        try {
          const { token, users, user: actingUser } = get();
          const targetUser = users.find((u) => (u.id || u._id) === id);

          if (!targetUser) {
            throw new Error("Usuario no encontrado");
          }

          const protectedAdminEmail = import.meta.env.VITE_SEEDER_ADMIN_EMAIL || "adminindetask@inde.admin";
          const isProtectedAdmin = actingUser?.email === protectedAdminEmail;

          if (targetUser.role === "ADMIN_ROLE" && !isProtectedAdmin) {
            const message =
              "Solo el administrador protegido puede modificar cuentas de administrador.";
            toast.error(message);
            return { success: false, error: message };
          }

          // Actualización optimista para que la UI reaccione instantáneamente
          const updatedUsers = users.map((u) =>
            u.id === id || u._id === id ? { ...u, isActive: !u.isActive } : u,
          );
          set({ users: updatedUsers });

          await toggleUserStatusRequest(id, token);
          toast.success("Estado de usuario actualizado");
          return { success: true };
        } catch (err) {
          await get().fetchUsers();
          const message =
            err.response?.data?.message ||
            err.message ||
            "Error al actualizar estado";
          toast.error(message);
          return { success: false, error: message };
        }
      },

      createUserByAdmin: async (userData, role) => {
        try {
          set({ loading: true, error: null });
          const { token } = get();
          let res;
          if (role === "ADMIN_ROLE") {
            res = await createAdminRequest(userData, token);
          } else {
            res = await registerRequest(userData);
          }
          toast.success(res.data.message || "Usuario creado exitosamente");
          await get().fetchUsers();
          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.errors?.[0]?.msg ||
            err.response?.data?.message ||
            "Error al crear usuario";
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
          users: [],
        });
        toast.success("Sesión cerrada correctamente");
      },
    }),
    {
      name: "auth-storage-inde", // Nombre con el que se guarda en el navegador
    },
  ),
);
