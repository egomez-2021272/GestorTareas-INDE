import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5214/api";

// Semilla exacta del backend de .NET Core (DataSeeder.cs)
const INITIAL_MOCK_TAGS = [
  { id: "t1-tag-uuid", name: "Personal", color: "#669a71" }, // Verde de la paleta
  { id: "t2-tag-uuid", name: "Trabajo", color: "#c95d5d" }, // Rojo de la paleta
  { id: "t3-tag-uuid", name: "Importante", color: "#c0914e" }, // Amarillo de la paleta
];

const INITIAL_MOCK_TASKS = [
  {
    id: "task-1-uuid",
    title: "Diseñar base de datos",
    description: "Definir tablas y relaciones para el gestor de tareas.",
    status: "Completed", // TaskStatus.Completed = 4
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [INITIAL_MOCK_TAGS[1], INITIAL_MOCK_TAGS[2]], // Trabajo, Importante
  },
  {
    id: "task-2-uuid",
    title: "Implementar Controladores en .NET Core",
    description:
      "Desarrollar controladores TasksController y TagsController para la API.",
    status: "InProgress", // TaskStatus.InProgress = 2
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [INITIAL_MOCK_TAGS[1]], // Trabajo
  },
  {
    id: "task-3-uuid",
    title: "Configurar Docker y PostgreSQL",
    description: "Escribir el docker-compose y verificar conexión.",
    status: "ToDo", // TaskStatus.ToDo = 1
    createdAt: new Date().toISOString(),
    tags: [INITIAL_MOCK_TAGS[0]], // Personal
  },
];

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
      const response = await axios.get(`${API_URL}/tasks`, { timeout: 3000 });
      set({ tasks: response.data, backendConnected: true });
    } catch (error) {
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
    const { title, description, status, tagIds } = taskData;

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
    const { title, description, status, tagIds } = updatedFields;

    // Actualizar localmente
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === id) {
          const associatedTags = state.tags.filter((tg) =>
            tagIds?.includes(tg.id),
          );
          return { ...t, title, description, status, tags: associatedTags };
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
