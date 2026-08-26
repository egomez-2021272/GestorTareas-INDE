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
        localStorage.removeItem('auth-storage-inde');
        window.location.href = '/login';
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
    const { title, description, status, tagIds, userId } = taskData;
    const { user, users } = useAuthStore.getState();
    const targetUserId = userId || user?.id;

    // Obtener el nombre del usuario asignado
    let assignedToName = null;
    if (users && users.length > 0) {
      const foundUser = users.find(u => (u.id || u._id) === targetUserId);
      if (foundUser) {
        assignedToName = foundUser.firstName + (foundUser.surname ? ' ' + foundUser.surname : '');
      }
    }
    if (!assignedToName && targetUserId === user?.id) {
      assignedToName = user?.name || user?.firstName;
    }

    // Generar objeto local temporal
    const localId = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);
    const associatedTags = get().tags.filter((t) => tagIds?.includes(t.id));

    const newTaskLocal = {
      id: localId,
      title,
      description,
      status: status || "ToDo",
      userId: targetUserId,
      assignedToName,
      createdAt: new Date().toISOString(),
      tags: associatedTags,
    };

    // Agregar localmente
    set((state) => ({ tasks: [newTaskLocal, ...state.tasks] }));

    if (get().backendConnected) {
      try {
        // Crear tarea en backend
        const response = await axios.post(`${API_URL}/tasks`, {
          title,
          description,
          status: status || "ToDo",
          userId: targetUserId,
          assignedToName,
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
      } catch (error) {
        console.error("Error al guardar tarea en el backend:", error);
      }
    }
  },

  updateTask: async (id, updatedFields) => {
    const { title, description, status, tagIds, userId } = updatedFields;
    const { user, users } = useAuthStore.getState();

    // Obtener el nombre del usuario asignado
    let assignedToName = null;
    if (users && users.length > 0) {
      const foundUser = users.find(u => (u.id || u._id) === userId);
      if (foundUser) {
        assignedToName = foundUser.firstName + (foundUser.surname ? ' ' + foundUser.surname : '');
      }
    }
    if (!assignedToName && userId === user?.id) {
      assignedToName = user?.name || user?.firstName;
    }

    // Actualizar localmente
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === id) {
          const associatedTags = state.tags.filter((tg) =>
            tagIds?.includes(tg.id),
          );
          return { ...t, title, description, status, userId, assignedToName, tags: associatedTags };
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
          status,
          userId,
          assignedToName,
        });

        // Obtener la tarea actual de la base de datos para ver sus etiquetas anteriores
        const currentTask = get().tasks.find((t) => t.id === id);
        const oldTagIds = currentTask?.tags?.map((t) => t.id) || [];

        // Identificar cuáles etiquetas agregar y cuáles quitar
        const tagsToAdd = tagIds.filter((tid) => !oldTagIds.includes(tid));
        const tagsToRemove = oldTagIds.filter((tid) => !tagIds.includes(tid));

        for (const tid of tagsToAdd) {
          await axios.post(`${API_URL}/tasks/${id}/tags/${tid}`);
        }
        for (const tid of tagsToRemove) {
          await axios.delete(`${API_URL}/tasks/${id}/tags/${tid}`);
        }

        // Refrescar datos
        await get().fetchTasks();
      } catch (error) {
        console.error("Error al actualizar tarea en el backend:", error);
      }
    }
  },

  deleteTask: async (id) => {
    // Eliminar localmente
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    if (get().backendConnected) {
      try {
        await axios.delete(`${API_URL}/tasks/${id}`);
      } catch (error) {
        console.error("Error al eliminar tarea en el backend:", error);
      }
    }
  },
}));
