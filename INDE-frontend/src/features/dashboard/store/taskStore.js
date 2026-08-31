import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "../../auth/store/authStore";

const API_URL = "http://localhost:5214/api";

// Semilla exacta del backend de .NET Core (DataSeeder.cs)
const INITIAL_MOCK_TAGS = [
  { id: "t1-tag-uuid", name: "No urge", color: "#669a71" }, // Verde
  { id: "t2-tag-uuid", name: "Urgente", color: "#c95d5d" }, // Rojo
  { id: "t3-tag-uuid", name: "Medio urge", color: "#c0914e" }, // Amarillo
];

const INITIAL_MOCK_TASKS = [];

export const useTaskStore = create((set, get) => ({
  tasks: INITIAL_MOCK_TASKS,
  tags: INITIAL_MOCK_TAGS,
  loading: false,
  backendConnected: false,

  fetchTags: async () => {
    try {
      const response = await axios.get(`${API_URL}/tags`, { timeout: 3000 });
      set({ tags: response.data, backendConnected: true });
    } catch (error) {
      console.warn(
        "Backend desconectado al obtener etiquetas. Usando locales.",
      );
    }
  },

  fetchTasks: async () => {
    set({ loading: true });
    try {
      await get().fetchTags();
      const { user } = useAuthStore.getState();
      let url = `${API_URL}/tasks`;

      if (user && user.role !== "ADMIN_ROLE") {
        url = `${API_URL}/tasks?userId=${user.id}`;
      }

      const response = await axios.get(url, { timeout: 3000 });
      set({ tasks: response.data, backendConnected: true });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("auth-storage-inde");
        window.location.href = "/login";
        return;
      }
      console.warn(
        "Backend desconectado al obtener tareas. Usando locales.",
        error.message,
      );
      set({ backendConnected: false });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (taskData) => {
    const {
      title,
      description,
      acceptanceCriteria,
      status,
      tagIds,
      userIds,
      assignedToNames,
    } = taskData;
    const { user } = useAuthStore.getState();
    
    // Check if user has permission to create tasks
    if (user?.role === "USER_ROLE") {
      const error = new Error("Los usuarios con rol Técnico no tienen permisos para crear tareas. Contacta al administrador.");
      error.code = "INSUFFICIENT_PERMISSIONS";
      throw error;
    }
    
    const targetUserIds =
      userIds && userIds.length > 0 ? userIds : user?.id ? [user.id] : [];
    const targetAssignedToNames =
      assignedToNames && assignedToNames.length > 0
        ? assignedToNames
        : user?.name || user?.firstName
          ? [user?.name || user?.firstName]
          : [];

    // Generar objeto local temporal
    const localId = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);
    const associatedTags = get().tags.filter((t) => tagIds?.includes(t.id));

    const assignedUsers = targetUserIds.map((uid, index) => ({
      userId: uid,
      assignedToName: targetAssignedToNames[index] || "",
      assignedAt: new Date().toISOString(),
    }));

    const newTaskLocal = {
      id: localId,
      title,
      description,
      acceptanceCriteria: acceptanceCriteria || "",
      status: status || "ToDo",
      assignedUsers,
      createdAt: new Date().toISOString(),
      tags: associatedTags,
      isDisabled: false,
    };

    // Agregar localmente
    set((state) => ({ tasks: [newTaskLocal, ...state.tasks] }));

    if (get().backendConnected) {
      try {
        // Crear tarea en backend
        const response = await axios.post(`${API_URL}/tasks`, {
          title,
          description,
          acceptanceCriteria: acceptanceCriteria || "",
          status: status || "ToDo",
          userIds: targetUserIds,
          assignedToNames: targetAssignedToNames,
        });

        const createdTask = response.data;

        // Asignar etiquetas en el backend una por una
        if (tagIds && tagIds.length > 0) {
          for (const tagId of tagIds) {
            await axios.post(
              `${API_URL}/tasks/${createdTask.id}/tags/${tagId}`,
            );
          }
        }

        // Refrescar para sincronizar IDs reales
        await get().fetchTasks();

        // Registrar auditoría de creación de tarea
        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await axios.post(`${API_URL}/auditlogs`, {
              userId: user.id || user._id,
              userName: user.name || user.username,
              userRole:
                user.role === "ADMIN_ROLE" ? "Administrador" : "Técnico",
              action: "CREATE_TASK",
              entityType: "Task",
              entityId: createdTask.id,
              description: `Creó la tarea: "${createdTask.title}" con estado "${createdTask.status}".`,
              ipAddress: "127.0.0.1",
            });
          } catch (logErr) {
            console.error("Error logging task creation:", logErr);
          }
        }
      } catch (error) {
        console.error("Error al guardar tarea en el backend:", error);
      }
    }
  },

  updateTask: async (id, updatedFields) => {
    const {
      title,
      description,
      acceptanceCriteria,
      status,
      tagIds,
      userIds,
      assignedToNames,
      isDisabled,
    } = updatedFields;
    const { user, users } = useAuthStore.getState();
    const selectedTagIds = tagIds?.slice(0, 1) || [];
    const previousTask = get().tasks.find((task) => task.id === id);
    const oldTagIds = previousTask?.tags?.map((tag) => tag.id) || [];

    // Actualizar localmente
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === id) {
          const associatedTags = state.tags.filter((tg) =>
            selectedTagIds.includes(tg.id),
          );

          const assignedUsers = (
            userIds && userIds.length > 0
              ? userIds
              : previousTask?.assignedUsers?.map((au) => au.userId) || []
          ).map((uid, index) => ({
            userId: uid,
            assignedToName:
              (assignedToNames && assignedToNames.length > 0
                ? assignedToNames
                : previousTask?.assignedUsers?.map((au) => au.assignedToName) ||
                  [])[index] || "",
            assignedAt: new Date().toISOString(),
          }));

          return {
            ...t,
            title,
            description,
            acceptanceCriteria:
              acceptanceCriteria ?? t.acceptanceCriteria ?? "",
            status,
            assignedUsers,
            tags: associatedTags,
            isDisabled: isDisabled !== undefined ? isDisabled : t.isDisabled,
          };
        }
        return t;
      }),
    }));

    if (get().backendConnected) {
      try {
        // Actualizar tarea básica
        await axios.put(`${API_URL}/tasks/${id}`, {
          title,
          description,
          acceptanceCriteria:
            acceptanceCriteria ?? previousTask?.acceptanceCriteria ?? "",
          status,
          userIds:
            userIds ||
            previousTask?.assignedUsers?.map((au) => au.userId) ||
            [],
          assignedToNames:
            assignedToNames ||
            previousTask?.assignedUsers?.map((au) => au.assignedToName) ||
            [],
          isDisabled:
            isDisabled !== undefined ? isDisabled : previousTask?.isDisabled,
        });

        // Identificar cuáles etiquetas agregar y cuáles quitar
        const tagsToAdd = selectedTagIds.filter(
          (tid) => !oldTagIds.includes(tid),
        );
        const tagsToRemove = oldTagIds.filter(
          (tid) => !selectedTagIds.includes(tid),
        );

        for (const tid of tagsToAdd) {
          await axios.post(`${API_URL}/tasks/${id}/tags/${tid}`);
        }
        for (const tid of tagsToRemove) {
          await axios.delete(`${API_URL}/tasks/${id}/tags/${tid}`);
        }

        // Refrescar datos
        await get().fetchTasks();

        // Registrar auditoría de actualización de tarea
        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await axios.post(`${API_URL}/auditlogs`, {
              userId: user.id || user._id,
              userName: user.name || user.username,
              userRole:
                user.role === "ADMIN_ROLE" ? "Administrador" : "Técnico",
              action: "UPDATE_TASK",
              entityType: "Task",
              entityId: id,
              description: `Actualizó la tarea: "${title}" (Estado: ${status}).`,
              ipAddress: "127.0.0.1",
            });
          } catch (logErr) {
            console.error("Error logging task update:", logErr);
          }
        }
      } catch (error) {
        console.error("Error al actualizar tarea en el backend:", error);
      }
    }
  },

  deleteTask: async (id) => {
    const taskToDelete = get().tasks.find((t) => t.id === id);
    const taskTitle = taskToDelete ? taskToDelete.title : id;

    // Eliminar localmente
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    if (get().backendConnected) {
      try {
        await axios.delete(`${API_URL}/tasks/${id}`);

        // Registrar auditoría de eliminación de tarea
        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await axios.post(`${API_URL}/auditlogs`, {
              userId: user.id || user._id,
              userName: user.name || user.username,
              userRole:
                user.role === "ADMIN_ROLE" ? "Administrador" : "Técnico",
              action: "DELETE_TASK",
              entityType: "Task",
              entityId: id,
              description: `Eliminó la tarea: "${taskTitle}".`,
              ipAddress: "127.0.0.1",
            });
          } catch (logErr) {
            console.error("Error logging task deletion:", logErr);
          }
        }
      } catch (error) {
        console.error("Error al eliminar tarea en el backend:", error);
      }
    }
  },
}));
