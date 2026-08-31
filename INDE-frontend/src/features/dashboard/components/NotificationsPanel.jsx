import React, { useState, useEffect } from "react";
import { useNotificationStore } from "../store/notificationStore";
import { useAuthStore } from "../../auth/store/authStore";
import { Bell, X, Check, Trash2 } from "lucide-react";

export const NotificationsPanel = () => {
  const { user } = useAuthStore();
  const { 
    notifications, 
    loading, 
    unreadCount, 
    fetchNotifications, 
    createNotification,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      // Polling para nuevas notificaciones cada 30 segundos
      const interval = setInterval(() => {
        fetchNotifications(user.id);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead(user.id);
    }
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "TASK_ASSIGNMENT":
        return <div className="w-8 h-8 rounded-full bg-[#0aa5b5]/20 flex items-center justify-center">
          <Bell size={16} className="text-[#0aa5b5]" />
        </div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-[#c0914e]/20 flex items-center justify-center">
          <Bell size={16} className="text-[#c0914e]" />
        </div>;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[#2a2f3a] transition-colors"
      >
        <Bell size={20} className="text-[#94a3b8]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#c95d5d] text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-96 bg-[#20242d] border border-[#333a47] rounded-xl shadow-2xl z-50 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333a47]">
              <h3 className="font-bold text-white text-sm">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#0aa5b5] hover:text-[#22c1d3] transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-[#94a3b8] text-sm">
                  Cargando notificaciones...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-[#94a3b8] text-sm">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-[#333a47]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-[#2a2f3a] transition-colors ${
                        !notification.isRead ? "bg-[#2a2f3a]/30" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-white">
                              {notification.title}
                            </h4>
                            <span className="text-[10px] text-[#94a3b8] whitespace-nowrap ml-2">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-[10px] text-[#0aa5b5] hover:text-[#22c1d3] transition-colors flex items-center"
                              >
                                <Check size={12} className="mr-1" />
                                Marcar como leída
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="text-[10px] text-[#c95d5d] hover:text-[#ff6b6b] transition-colors flex items-center"
                            >
                              <Trash2 size={12} className="mr-1" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};