import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5214/api";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async (userId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/notifications/user/${userId}`);
      set({ 
        notifications: response.data,
        unreadCount: response.data.filter(n => !n.isRead).length
      });
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/mark-read`);
      set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await axios.put(`${API_URL}/notifications/user/${userId}/mark-all-read`);
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`);
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        return {
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadCount: notification && !notification.isRead 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount
        };
      });
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  }
}));