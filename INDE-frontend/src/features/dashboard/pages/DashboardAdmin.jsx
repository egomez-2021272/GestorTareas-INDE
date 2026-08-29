import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { useTaskStore } from "../store/taskStore";
import { TaskList } from "../components/TaskList";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BarChart3,
  CheckSquare,
  LogOut,
  Plus,
  X,
  Menu,
  Users,
  Trash2,
  Tag,
  Database,
  Download,
  FileText,
} from "lucide-react";
import LogoInde from "../../../assets/img/indelogo.png";
import { UsersTab } from "../components/UsersTab";
import { BitacoraTab } from "../components/BitacoraTab";
import { NotificationsPanel } from "../components/NotificationsPanel";

export const DashboardAdmin = () => {
  const { user, logout, users, fetchUsers } = useAuthStore();
  const { tasks, tags, fetchTasks, addTask, updateTask, deleteTask } =
    useTaskStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, tasks, users
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para mobile
  const [selectedTask, setSelectedTask] = useState(null); // Para modal de detalles
  const [taskActivity, setTaskActivity] = useState([]);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false); // Sidebar de creación
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false); // Modal de backups

  const [taskToDeleteId, setTaskToDeleteId] = useState(null); // ID de la tarea a eliminar

  const handleDownload = async (url, filename, action, description) => {
    const loadingToast = toast.loading("Generando archivo...");
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Registrar auditoría en base de datos
      if (user) {
        await axios.post("http://localhost:5214/api/auditlogs", {
          userId: user.id,
          userName: user.name,
          userRole: user.role === "ADMIN_ROLE" ? "Administrador" : "Técnico",
          action: action,
          entityType: "System",
          description: description,
          ipAddress: "127.0.0.1",
        });
      }
      toast.success("Archivo descargado y registrado en la bitácora", {
        id: loadingToast,
      });
    } catch (err) {
      console.error("Error al descargar:", err);
      toast.error("Error al generar o descargar el archivo", {
        id: loadingToast,
      });
    }
  };

  // Form states
  const [createForm, setCreateForm] = useState({
    title: "",
    theme: "",
    epic: "",
    userStories: "",
    description: "",
    acceptanceCriteria: "",
    status: "ToDo",
    tagIds: [],
    userIds: [],
    assignedToNames: [],
  });

  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchTasks();
    if (user?.role === "ADMIN_ROLE") {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    if (!selectedTask) {
      setTaskActivity([]);
      return;
    }

    const loadTaskActivity = async () => {
      try {
        const response = await axios.get("http://localhost:5214/api/auditlogs");
        const filtered = response.data.filter(
          (log) => String(log.entityId) === String(selectedTask.id),
        );
        setTaskActivity(filtered.slice(0, 8));
      } catch (error) {
        console.error("Error cargando actividad de tarea:", error);
        setTaskActivity([]);
      }
    };

    loadTaskActivity();
  }, [selectedTask]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "ADMIN_ROLE";

  // Cálculos estadísticos basados en base de datos
  const totalTasks = tasks.length;
  const toDoTasks = tasks.filter((t) => t.status === "ToDo").length;
  const inProgressTasks = tasks.filter((t) => t.status === "InProgress").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  // Porcentaje de completado
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Obtener iniciales del usuario
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Guardar nueva tarea (Admin)
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      toast.error("El título de la tarea es obligatorio.");
      return;
    }

    const acceptanceItems = ensureAcceptanceItems(
      createForm.acceptanceCriteria || "",
    );
    const sanitizedAcceptanceItems = acceptanceItems.filter((item) =>
      item.label?.trim(),
    );

    if (!sanitizedAcceptanceItems.length) {
      toast.error("Agrega al menos un criterio de aceptación.");
      return;
    }

    if (!createForm.userIds?.length) {
      toast.error("Selecciona al menos un usuario asignado.");
      return;
    }

    const descriptionText = [createForm.theme, createForm.epic]
      .filter(Boolean)
      .join("\n");
    const acceptanceText = sanitizeAcceptanceString(sanitizedAcceptanceItems);

    addTask({
      ...createForm,
      description: descriptionText || createForm.description,
      acceptanceCriteria: acceptanceText,
      status: "ToDo",
    });

    setIsCreateOpen(false);
    setCreateForm({
      title: "",
      theme: "",
      epic: "",
      userStories: "",
      description: "",
      acceptanceCriteria: "",
      status: "ToDo",
      tagIds: [],
      userIds: [],
      assignedToNames: [],
    });
  };

  // Guardar cambios en tarea editada (Admin / Técnico actualizando estado)
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm || !isAdmin) return;

    const normalizedDescription = [editForm.theme || "", editForm.epic || ""]
      .filter(Boolean)
      .join("\n");
    const normalizedAcceptanceCriteria =
      serializeAcceptanceChecklist(
        parseAcceptanceChecklist(editForm.acceptanceCriteria),
      ) ||
      editForm.userStories?.trim() ||
      editForm.acceptanceCriteria ||
      "";

    updateTask(editForm.id, {
      ...editForm,
      description: normalizedDescription || editForm.description,
      acceptanceCriteria: normalizedAcceptanceCriteria,
    });
    setSelectedTask(null);
    setEditForm(null);
  };

  const handleDelete = (id) => {
    setTaskToDeleteId(id);
  };

  // Toggle etiquetas seleccionadas en formularios
  const toggleTagSelection = (form, setForm, tagId) => {
    const currentTagId = form.tagIds?.[0];
    setForm({
      ...form,
      tagIds: currentTagId === tagId ? [] : [tagId],
    });
  };

  const toggleUserSelection = (userId, userName) => {
    setCreateForm((prev) => {
      const exists = prev.userIds.includes(userId);
      const nextUserIds = exists
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId];
      const nextAssignedNames = exists
        ? prev.assignedToNames.filter((name) => name !== userName)
        : [...prev.assignedToNames, userName];

      return {
        ...prev,
        userIds: nextUserIds,
        assignedToNames: nextAssignedNames,
      };
    });
  };

  const setFormValue = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Nombre legible de estados
  const getStatusLabel = (status) => {
    switch (status) {
      case "ToDo":
        return "Por Hacer";
      case "InProgress":
        return "En Proceso";
      case "Pending":
        return "En Espera";
      case "Completed":
        return "Completado";
      default:
        return status;
    }
  };

  const parseChecklist = (value = "") =>
    value
      .split(/\n|•|;|\-/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);

  const parseAcceptanceChecklist = (value = "") =>
    value
      .split(/\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const checked = /^\[(x|X|✓|✔)\]/.test(item);
        const label = item.replace(/^\[(?:x|X|✓|✔|\s)\]\s*/, "").trim();
        return { label, checked };
      })
      .filter((item) => item.label);

  const serializeAcceptanceChecklist = (items = []) =>
    items
      .map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.label}`.trim())
      .join("\n");

  const sanitizeAcceptanceString = (items = []) => {
    const cleaned = (items || [])
      .filter((item) => item?.label?.trim())
      .map((item) => ({
        ...item,
        label: item.label.trim(),
        checked: Boolean(item.checked),
      }));

    return cleaned.length
      ? serializeAcceptanceChecklist(cleaned)
      : "[x] Validar la tarea según el criterio definido";
  };

  const ensureAcceptanceItems = (value = "") => {
    const parsed = parseAcceptanceChecklist(value);
    if (parsed.length > 0) {
      return parsed.map((item, index) => ({
        ...item,
        id: `${index}-${item.label || "criterion"}`,
      }));
    }
    return [{ id: `new-${Date.now()}`, label: "", checked: true }];
  };

  const STATUS_FLOW = {
    ToDo: ["InProgress"],
    InProgress: ["ToDo", "Pending"],
    Pending: ["InProgress", "Completed"],
    Completed: ["Pending"],
  };

  const canTransitionStatus = (currentStatus, nextStatus) => {
    if (!currentStatus || !nextStatus) return true;
    const allowed = STATUS_FLOW[currentStatus] || [];
    return allowed.includes(nextStatus);
  };

  const handleStatusChange = (nextStatus) => {
    if (!canTransitionStatus(editForm?.status, nextStatus)) {
      const currentLabel = getStatusLabel(editForm?.status);
      const nextLabel = getStatusLabel(nextStatus);
      toast.error(
        `No se puede avanzar de ${currentLabel} a ${nextLabel}. Sigue el flujo secuencial de la tarea.`,
      );
      return;
    }

    setEditForm({ ...editForm, status: nextStatus });
  };

  const updateAcceptanceItems = (currentValue, updater) => {
    const items = ensureAcceptanceItems(currentValue);
    const nextItems = updater(items);
    return sanitizeAcceptanceString(nextItems);
  };

  const getStatusOptions = (currentStatus) => {
    const base = currentStatus ? [currentStatus] : [];
    const allowed = STATUS_FLOW[currentStatus] || [];
    return [...new Set([...base, ...allowed])];
  };

  const addCriterionToForm = (setter, targetKey, currentValue) => {
    const currentItems = ensureAcceptanceItems(currentValue);
    const nextItems = [
      ...currentItems,
      { id: `new-${Date.now()}`, label: "", checked: true },
    ];
    setter((prev) => ({
      ...prev,
      [targetKey]: serializeAcceptanceChecklist(nextItems),
    }));
  };

  return (
    <div className="inde-dashboard-layout bg-[#12141a] min-h-screen text-[#e2e8f0]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-[#20242d] border-r border-[#333a47] flex flex-col justify-between py-6 px-4 fixed h-screen w-[260px] z-50 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          <div className="flex items-center justify-between md:justify-center mb-8 px-2">
            <img
              src={LogoInde}
              alt="INDE Logo"
              className="h-10 md:h-15 object-contain"
            />
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-[#2a2f3a] text-[#94a3b8] ${activeTab === "dashboard" ? "inde-nav-active text-white font-semibold bg-[#2a2f3a]" : ""}`}
            >
              <BarChart3 size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("tasks");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-[#2a2f3a] text-[#94a3b8] ${activeTab === "tasks" ? "inde-nav-active text-white font-semibold bg-[#2a2f3a]" : ""}`}
            >
              <CheckSquare size={18} />
              <span>Tareas</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("users");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-[#2a2f3a] text-[#94a3b8] ${activeTab === "users" ? "inde-nav-active text-white font-semibold bg-[#2a2f3a]" : ""}`}
              >
                <Users size={18} />
                <span>Usuarios</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("bitacora");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-[#2a2f3a] text-[#94a3b8] ${activeTab === "bitacora" ? "inde-nav-active text-white font-semibold bg-[#2a2f3a]" : ""}`}
              >
                <BarChart3 size={18} />
                <span>Bitácora</span>
              </button>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#333a47] space-y-2">
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-[#0aa5b5] hover:bg-[#0aa5b5]/10 transition-colors"
          >
            <Database size={18} />
            <span>Descargar Backup y Bitácora</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-[#c95d5d] hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="md:ml-[260px] p-4 md:p-6 lg:p-8 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-6 mb-6 border-b border-[#333a47]">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide">
                {activeTab === "dashboard" && "Estadísticas Generales"}
                {activeTab === "tasks" && "Tablero Kanban de Tareas"}
                {activeTab === "users" && "Panel de Administrador"}
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Usuario:{" "}
                <span className="font-semibold text-[#0aa5b5]">
                  {user?.name}
                </span>{" "}
                • Rol:{" "}
                <span className="font-semibold text-[#0aa5b5]">
                  {isAdmin ? "Administrador" : "Técnico"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end md:self-auto">
            <NotificationsPanel />
            {activeTab === "tasks" && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-[#0aa5b5] hover:bg-[#22c1d3] text-white flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nueva Tarea</span>
              </button>
            )}
            <div className="flex items-center space-x-3 bg-[#20242d] px-4 py-2 rounded-xl border border-[#333a47]">
              <div className="w-8 h-8 rounded-full bg-[#0aa5b5]/20 flex items-center justify-center border border-[#0aa5b5]/30">
                <span className="text-[#0aa5b5] font-bold text-sm">
                  {getInitials(user?.name || "US")}
                </span>
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-white leading-tight">
                  {user?.name}
                </p>
                <p className="text-[#94a3b8]">
                  {isAdmin ? "Administrador INDE" : "Técnico de Campo"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* TAB CONTENTS */}

        {/* 1. DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* STAT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="col-span-2 sm:col-span-1 bg-[#20242d] p-5 rounded-2xl border border-[#333a47] flex flex-col justify-between hover:border-[#0aa5b5] transition-all">
                <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">
                  Total Tareas
                </span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {totalTasks}
                </span>
              </div>
              <div className="bg-[#20242d] p-5 rounded-2xl border border-[#333a47] flex flex-col justify-between hover:border-[#c95d5d] transition-all">
                <span className="text-[10px] text-[#c95d5d] font-bold uppercase tracking-wider">
                  Por Hacer (ToDo)
                </span>
                <span className="text-3xl font-extrabold text-[#c95d5d] mt-2">
                  {toDoTasks}
                </span>
              </div>
              <div className="bg-[#20242d] p-5 rounded-2xl border border-[#333a47] flex flex-col justify-between hover:border-[#0aa5b5] transition-all">
                <span className="text-[10px] text-[#0aa5b5] font-bold uppercase tracking-wider">
                  En Proceso
                </span>
                <span className="text-3xl font-extrabold text-[#0aa5b5] mt-2">
                  {inProgressTasks}
                </span>
              </div>
              <div className="bg-[#20242d] p-5 rounded-2xl border border-[#333a47] flex flex-col justify-between hover:border-[#c0914e] transition-all">
                <span className="text-[10px] text-[#c0914e] font-bold uppercase tracking-wider">
                  En Espera (Pending)
                </span>
                <span className="text-3xl font-extrabold text-[#c0914e] mt-2">
                  {pendingTasks}
                </span>
              </div>
              <div className="bg-[#20242d] p-5 rounded-2xl border border-[#333a47] flex flex-col justify-between hover:border-[#669a71] transition-all">
                <span className="text-[10px] text-[#669a71] font-bold uppercase tracking-wider">
                  Completadas
                </span>
                <span className="text-3xl font-extrabold text-[#669a71] mt-2">
                  {completedTasks}
                </span>
              </div>
            </div>

            {/* CHARTS CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CHART 1: COLUMN CHART (TASKS BY STATE) */}
              <div className="bg-[#20242d] p-6 rounded-2xl border border-[#333a47] lg:col-span-2">
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
                  Distribución por Estado de Tareas
                </h3>

                {/* SVG/CSS Bar Chart */}
                <div className="h-64 flex flex-col pt-4 relative">
                  <div className="flex-1 min-h-0 flex items-end justify-around border-b border-[#333a47] pb-2 relative ml-8">
                    {/* Y-axis labels and gridlines */}
                    {(() => {
                      const maxTasks = Math.max(
                        toDoTasks,
                        inProgressTasks,
                        pendingTasks,
                        completedTasks,
                        4,
                      );
                      const roundedMax = Math.ceil(maxTasks / 4) * 4; // Asegurar múltiplo de 4

                      return (
                        <>
                          {[1, 0.75, 0.5, 0.25].map((factor, i) => (
                            <div
                              key={i}
                              className={`absolute left-0 right-0 border-t border-[#333a47]/30 ${
                                i === 0
                                  ? "top-0"
                                  : i === 1
                                    ? "top-1/4"
                                    : i === 2
                                      ? "top-2/4"
                                      : "top-3/4"
                              }`}
                            >
                              <span className="absolute -left-8 -top-2.5 text-[10px] text-[#94a3b8] font-bold">
                                {Math.round(roundedMax * factor)}
                              </span>
                            </div>
                          ))}
                          {/* 0 label at bottom */}
                          <span className="absolute -left-8 bottom-0 text-[10px] text-[#94a3b8] font-bold">
                            0
                          </span>

                          {/* Bars */}
                          {[
                            {
                              label: "Por Hacer",
                              val: toDoTasks,
                              color: "#c95d5d",
                              percent: (toDoTasks / roundedMax) * 100,
                            },
                            {
                              label: "En Proceso",
                              val: inProgressTasks,
                              color: "#0aa5b5",
                              percent: (inProgressTasks / roundedMax) * 100,
                            },
                            {
                              label: "En Espera",
                              val: pendingTasks,
                              color: "#c0914e",
                              percent: (pendingTasks / roundedMax) * 100,
                            },
                            {
                              label: "Completado",
                              val: completedTasks,
                              color: "#669a71",
                              percent: (completedTasks / roundedMax) * 100,
                            },
                          ].map((bar, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center justify-end w-16 md:w-24 h-full group relative z-1"
                            >
                              <span className="text-xs font-bold text-white mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {bar.val}
                              </span>
                              <div
                                className="w-10 md:w-12 rounded-t-lg transition-all duration-500 hover:brightness-110 cursor-pointer"
                                style={{
                                  height: `${Math.max(bar.percent, 3)}%`,
                                  backgroundColor: bar.color,
                                }}
                              ></div>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex justify-around pt-2 ml-8">
                    {["Por Hacer", "En Proceso", "En Espera", "Completado"].map(
                      (label, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] md:text-xs text-[#94a3b8] font-bold w-16 md:w-24 text-center"
                        >
                          {label}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* CHART 2: COMPLETION CIRCLE (DONUT) */}
              <div className="bg-[#20242d] p-6 rounded-2xl border border-[#333a47] flex flex-col justify-between items-center">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider w-full text-left">
                  Porcentaje de Eficiencia
                </h3>

                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#2a2f3a"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#669a71"
                      strokeWidth="10"
                      fill="transparent"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{
                        strokeDasharray: "251.2",
                        strokeDashoffset: `${251.2 - (251.2 * completionRate) / 100}`,
                      }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white">
                      {completionRate}%
                    </span>
                    <span className="text-[10px] text-[#94a3b8] font-semibold uppercase mt-0.5">
                      Completado
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#94a3b8] text-center mt-4 leading-relaxed">
                  Eficiencia medida en base a tareas resueltas e integradas
                  directamente en la base de datos de PostgreSQL.
                </p>
              </div>
            </div>

            {/* RECENT / DETAILED STATS (TASKS BY TAG) */}
            <div className="bg-[#20242d] p-6 rounded-2xl border border-[#333a47]">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Métricas por Etiquetas Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tags.map((tag) => {
                  const tasksWithTag = tasks.filter((t) =>
                    t.tags?.some((tg) => tg.id === tag.id),
                  );
                  const count = tasksWithTag.length;
                  const completedCount = tasksWithTag.filter(
                    (t) => t.status === "Completed",
                  ).length;
                  const progressPct =
                    count > 0 ? Math.round((completedCount / count) * 100) : 0;

                  return (
                    <div
                      key={tag.id}
                      className="bg-[#2a2f3a] p-4 rounded-xl border border-[#333a47]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full border"
                          style={{
                            backgroundColor: `${tag.color}15`,
                            color: tag.color,
                            borderColor: `${tag.color}30`,
                          }}
                        >
                          {tag.name}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {count} Tareas
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#94a3b8] font-semibold">
                          <span>Progreso de Resolución</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-[#12141a] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              backgroundColor: tag.color,
                              width: `${progressPct}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. KANBAN BOARD VIEW */}
        {activeTab === "tasks" && (
          <TaskList
            tasks={tasks}
            users={users}
            onTaskSelect={(task) => {
              setSelectedTask(task);
              setShowTaskDetails(false);
              setEditForm({
                id: task.id,
                title: task.title,
                theme: task.description?.split(/\n/)[0] || "",
                epic: task.description?.split(/\n/).slice(1).join("\n") || "",
                description: task.description || "",
                status: task.status,
                acceptanceCriteria: task.acceptanceCriteria || "",
                userStories: task.acceptanceCriteria || "",
                tagIds: task.tags?.map((tag) => tag.id) || [],
                userIds:
                  task.assignedUsers?.map((au) => String(au.userId)) || [],
                assignedToNames:
                  task.assignedUsers?.map((au) => au.assignedToName) || [],
                isDisabled: task.isDisabled || false,
              });
            }}
          />
        )}

        {/* 3. USERS VIEW */}
        {activeTab === "users" && isAdmin && <UsersTab />}

        {/* 4. BITÁCORA VIEW */}
        {activeTab === "bitacora" && isAdmin && <BitacoraTab />}

        {false && (
          <div className="flex-1 flex flex-col min-h-0 animate-fadeIn">
            {/* COLUMN LAYOUT (4 COLUMNS - TODO, IN PROGRESS, PENDING, COMPLETED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-[500px]">
              {/* COLUMN 1: POR HACER (ToDo) */}
              <div className="bg-[#20242d]/40 rounded-2xl border border-[#333a47]/50 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-[#c95d5d] rounded-full"></div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Por Hacer
                    </h3>
                  </div>
                  <span className="bg-[#2a2f3a] px-2.5 py-0.5 rounded-full text-xs text-[#94a3b8] font-bold">
                    {toDoTasks}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[60vh] md:max-h-[none]">
                  {tasks
                    .filter((t) => t.status === "ToDo")
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setEditForm({
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            status: task.status,
                            tagIds: task.tags?.map((tg) => tg.id) || [],
                            userIds:
                              task.assignedUsers?.map((au) => au.userId) || [],
                            assignedToNames:
                              task.assignedUsers?.map(
                                (au) => au.assignedToName,
                              ) || [],
                            isDisabled: task.isDisabled || false,
                          });
                        }}
                        className="bg-[#20242d] p-4 rounded-xl border border-[#333a47] hover:border-[#0aa5b5] transition-all cursor-pointer shadow-md select-none group"
                      >
                        <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-[#22c1d3] transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-xs text-[#94a3b8] mt-2 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#333a47] flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[9px] font-bold px-2.5 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${tag.color}15`,
                                  color: tag.color,
                                  borderColor: `${tag.color}30`,
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* COLUMN 2: EN PROCESO (InProgress) */}
              <div className="bg-[#20242d]/40 rounded-2xl border border-[#333a47]/50 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-[#0aa5b5] rounded-full"></div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      En Proceso
                    </h3>
                  </div>
                  <span className="bg-[#2a2f3a] px-2.5 py-0.5 rounded-full text-xs text-[#94a3b8] font-bold">
                    {inProgressTasks}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[60vh] md:max-h-[none]">
                  {tasks
                    .filter((t) => t.status === "InProgress")
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setEditForm({
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            status: task.status,
                            tagIds: task.tags?.map((tg) => tg.id) || [],
                            userIds:
                              task.assignedUsers?.map((au) => au.userId) || [],
                            assignedToNames:
                              task.assignedUsers?.map(
                                (au) => au.assignedToName,
                              ) || [],
                            isDisabled: task.isDisabled || false,
                          });
                        }}
                        className="bg-[#20242d] p-4 rounded-xl border border-[#333a47] hover:border-[#0aa5b5] transition-all cursor-pointer shadow-md select-none group"
                      >
                        <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-[#22c1d3] transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-xs text-[#94a3b8] mt-2 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#333a47] flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[9px] font-bold px-2.5 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${tag.color}15`,
                                  color: tag.color,
                                  borderColor: `${tag.color}30`,
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* COLUMN 3: EN ESPERA (Pending) */}
              <div className="bg-[#20242d]/40 rounded-2xl border border-[#333a47]/50 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-[#c0914e] rounded-full"></div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      En Espera
                    </h3>
                  </div>
                  <span className="bg-[#2a2f3a] px-2.5 py-0.5 rounded-full text-xs text-[#94a3b8] font-bold">
                    {pendingTasks}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[60vh] md:max-h-[none]">
                  {tasks
                    .filter((t) => t.status === "Pending")
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setEditForm({
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            status: task.status,
                            tagIds: task.tags?.map((tg) => tg.id) || [],
                            userIds:
                              task.assignedUsers?.map((au) => au.userId) || [],
                            assignedToNames:
                              task.assignedUsers?.map(
                                (au) => au.assignedToName,
                              ) || [],
                            isDisabled: task.isDisabled || false,
                          });
                        }}
                        className="bg-[#20242d] p-4 rounded-xl border border-[#333a47] hover:border-[#0aa5b5] transition-all cursor-pointer shadow-md select-none group"
                      >
                        <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-[#22c1d3] transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-xs text-[#94a3b8] mt-2 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#333a47] flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[9px] font-bold px-2.5 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${tag.color}15`,
                                  color: tag.color,
                                  borderColor: `${tag.color}30`,
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* COLUMN 4: COMPLETADO (Completed) */}
              <div className="bg-[#20242d]/40 rounded-2xl border border-[#333a47]/50 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-[#669a71] rounded-full"></div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Completado
                    </h3>
                  </div>
                  <span className="bg-[#2a2f3a] px-2.5 py-0.5 rounded-full text-xs text-[#94a3b8] font-bold">
                    {completedTasks}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[60vh] md:max-h-[none]">
                  {tasks
                    .filter((t) => t.status === "Completed")
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setEditForm({
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            status: task.status,
                            tagIds: task.tags?.map((tg) => tg.id) || [],
                            userIds:
                              task.assignedUsers?.map((au) => au.userId) || [],
                            assignedToNames:
                              task.assignedUsers?.map(
                                (au) => au.assignedToName,
                              ) || [],
                            isDisabled: task.isDisabled || false,
                          });
                        }}
                        className="bg-[#20242d] p-4 rounded-xl border border-[#333a47] hover:border-[#0aa5b5] transition-all cursor-pointer shadow-md select-none group"
                      >
                        <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-[#22c1d3] transition-colors line-through decoration-[#94a3b8]">
                          {task.title}
                        </h4>
                        <p className="text-xs text-[#94a3b8] mt-2 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#333a47] flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[9px] font-bold px-2.5 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${tag.color}15`,
                                  color: tag.color,
                                  borderColor: `${tag.color}30`,
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DETAILED VIEW MODAL */}
      {selectedTask && editForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1d2330] rounded-2xl border border-[#333a47] w-full max-w-[760px] overflow-hidden shadow-2xl animate-fadeInScale">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#333a47] bg-[#2a2f3a]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0aa5b5]/15 flex items-center justify-center text-[#0aa5b5]">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
                    Tarea
                  </p>
                  <h3 className="font-bold text-white text-sm truncate max-w-[420px]">
                    {selectedTask.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setEditForm(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className={`grid grid-cols-1 ${showTaskDetails ? "lg:grid-cols-[1.6fr_0.8fr]" : ""}`}
            >
              <form onSubmit={handleEditSubmit} className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-[#0aa5b5]/30 bg-[#0aa5b5]/10 text-[#0aa5b5] text-[10px] font-bold uppercase tracking-wide">
                    {getStatusLabel(editForm.status)}
                  </span>
                  {selectedTask.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: `${tag.color}15`,
                        color: tag.color,
                        borderColor: `${tag.color}40`,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    disabled={!isAdmin}
                    className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#0aa5b5] disabled:opacity-75"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                      Responsable
                    </label>
                    <div className="w-full bg-[#2a2f3a] border border-[#333a47] rounded-lg p-2.5 text-xs text-[#e2e8f0]">
                      {editForm.assignedToNames?.length > 0
                        ? editForm.assignedToNames.join(", ")
                        : "Sin asignar"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                      Fecha de creación
                    </label>
                    <div className="w-full bg-[#2a2f3a] border border-[#333a47] rounded-lg p-2.5 text-xs text-[#94a3b8]">
                      {new Date(selectedTask.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Descripción técnica
                  </label>
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    disabled={!isAdmin}
                    rows={3}
                    className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5] disabled:opacity-75 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Criterios de aceptación
                  </label>
                  <div className="space-y-2 bg-[#12141a] border border-[#333a47] rounded-lg p-3">
                    {ensureAcceptanceItems(
                      editForm.acceptanceCriteria || "",
                    ).map((item, index) => (
                      <div
                        key={item.id || `${index}-criterion`}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(item.checked)}
                          disabled={!isAdmin}
                          onChange={(e) => {
                            if (!isAdmin) return;
                            const currentItems = ensureAcceptanceItems(
                              editForm.acceptanceCriteria || "",
                            );
                            currentItems[index].checked = e.target.checked;
                            setEditForm({
                              ...editForm,
                              acceptanceCriteria:
                                serializeAcceptanceChecklist(currentItems),
                            });
                          }}
                          className="h-3.5 w-3.5 rounded border-[#333a47] bg-[#20242d] shrink-0 disabled:opacity-60"
                        />
                        <input
                          type="text"
                          value={item.label || ""}
                          disabled={!isAdmin}
                          onChange={(e) => {
                            if (!isAdmin) return;
                            const currentItems = ensureAcceptanceItems(
                              editForm.acceptanceCriteria || "",
                            );
                            currentItems[index].label = e.target.value;
                            setEditForm({
                              ...editForm,
                              acceptanceCriteria:
                                serializeAcceptanceChecklist(currentItems),
                            });
                          }}
                          placeholder="Agregar criterio"
                          className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder:text-[#64748b] focus:outline-none disabled:opacity-60"
                        />
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentItems = ensureAcceptanceItems(
                                editForm.acceptanceCriteria || "",
                              );
                              const filtered = currentItems.filter(
                                (_, i) => i !== index,
                              );
                              setEditForm({
                                ...editForm,
                                acceptanceCriteria:
                                  serializeAcceptanceChecklist(
                                    filtered.length
                                      ? filtered
                                      : [
                                          {
                                            id: `new-${Date.now()}`,
                                            label: "",
                                            checked: true,
                                          },
                                        ],
                                  ),
                              });
                            }}
                            className="text-[#94a3b8] hover:text-white text-sm shrink-0"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          addCriterionToForm(
                            setEditForm,
                            "acceptanceCriteria",
                            editForm.acceptanceCriteria || "",
                          )
                        }
                        className="mt-2 text-[10px] uppercase tracking-wider text-[#0aa5b5] hover:text-[#22c1d3]"
                      >
                        + Añadir criterio
                      </button>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                      Estado
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                    >
                      {getStatusOptions(editForm.status).map((status) => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isAdmin && (
                  <div>
                    <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                      Etiqueta
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-[#12141a] border border-[#333a47] p-3 rounded-lg">
                      {tags.map((tag) => {
                        const isChecked = editForm.tagIds?.includes(tag.id);
                        return (
                          <label
                            key={tag.id}
                            className="flex items-center space-x-2.5 text-xs text-[#e2e8f0] cursor-pointer select-none"
                          >
                            <input
                              type="radio"
                              name="edit-task-tag"
                              checked={Boolean(isChecked)}
                              onChange={() =>
                                setEditForm({
                                  ...editForm,
                                  tagIds: [tag.id],
                                })
                              }
                              className="w-3.5 h-3.5 text-[#0aa5b5] bg-[#2a2f3a] border-[#333a47] focus:ring-0"
                            />
                            <span
                              style={{ color: tag.color }}
                              className="font-semibold"
                            >
                              {tag.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-[#333a47]">
                  <div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(editForm.id)}
                        className="text-[#c95d5d] hover:bg-red-500/10 border border-transparent hover:border-red-500/20 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <Trash2 size={14} />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask(null);
                        setEditForm(null);
                      }}
                      className="bg-[#2a2f3a] hover:bg-[#333a47] text-[#94a3b8] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-[#333a47]"
                    >
                      Cancelar
                    </button>
                    {isAdmin && (
                      <button
                        type="submit"
                        className="bg-[#669a71] hover:brightness-110 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        Guardar
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {showTaskDetails && (
                <aside className="border-l border-[#333a47] bg-[#171d27] p-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#333a47] mb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Detalles
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowTaskDetails(false)}
                      className="text-[10px] uppercase tracking-wide text-[#94a3b8] hover:text-white"
                    >
                      Ocultar
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-[#dfe7f5]">
                    <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                        Tema
                      </p>
                      <p>{editForm.theme || "Sin tema"}</p>
                    </div>
                    <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                        Épica
                      </p>
                      <p>{editForm.epic || "Sin épica"}</p>
                    </div>
                    <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                        Historia de usuario
                      </p>
                      <p>{editForm.userStories || "Sin historia"}</p>
                    </div>
                    <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                        Asignados
                      </p>
                      <p>
                        {editForm.assignedToNames?.join(", ") || "Sin asignar"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                        Estado
                      </p>
                      <p>{getStatusLabel(editForm.status)}</p>
                    </div>
                  </div>
                </aside>
              )}

              {!showTaskDetails && (
                <div className="border-l border-[#333a47] bg-[#171d27] p-3 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setShowTaskDetails(true)}
                    className="text-[10px] uppercase tracking-wide text-[#94a3b5] hover:text-white border border-[#333a47] rounded-lg px-3 py-2 bg-[#20242d]"
                  >
                    Mostrar detalles
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK DRAWER */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-fadeIn">
          <div className="bg-[#20242d] w-full max-w-[400px] h-full shadow-2xl flex flex-col border-l border-[#333a47] animate-fadeInScale">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#333a47] bg-[#2a2f3a]">
              <div className="flex items-center space-x-2">
                <Tag className="text-[#0aa5b5]" size={18} />
                <h3 className="font-bold text-white text-sm">
                  Crear Nueva Tarea
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateSubmit}
              className="p-6 flex-1 overflow-y-auto space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Título de Tarea
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setFormValue("title", e.target.value)}
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                  placeholder="ej. Configurar Servidor de Base de Datos"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Tema
                  </label>
                  <input
                    type="text"
                    value={createForm.theme}
                    onChange={(e) => setFormValue("theme", e.target.value)}
                    className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                    placeholder="Sistema de reclutamiento"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Épica
                  </label>
                  <input
                    type="text"
                    value={createForm.epic}
                    onChange={(e) => setFormValue("epic", e.target.value)}
                    className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                    placeholder="Gestión de usuarios"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Descripción Técnica
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setFormValue("description", e.target.value)}
                  rows={3}
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5] resize-none"
                  placeholder="Detalles sobre el trabajo a realizar..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Historias de usuario
                </label>
                <textarea
                  value={createForm.userStories || ""}
                  onChange={(e) => setFormValue("userStories", e.target.value)}
                  rows={3}
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5] resize-none"
                  placeholder="Como administrador quiero ..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Criterios de aceptación
                </label>
                <div className="space-y-2 bg-[#12141a] border border-[#333a47] rounded-lg p-3 max-h-[170px] overflow-y-auto">
                  {ensureAcceptanceItems(
                    createForm.acceptanceCriteria || "",
                  ).map((item, index) => (
                    <div
                      key={item.id || `${index}-criterion`}
                      className="flex items-center gap-2 min-w-0"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(item.checked)}
                        onChange={(e) => {
                          const currentItems = ensureAcceptanceItems(
                            createForm.acceptanceCriteria || "",
                          );
                          currentItems[index].checked = e.target.checked;
                          setCreateForm({
                            ...createForm,
                            acceptanceCriteria:
                              serializeAcceptanceChecklist(currentItems),
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-[#333a47] bg-[#20242d] shrink-0"
                      />
                      <input
                        type="text"
                        value={item.label || ""}
                        onChange={(e) => {
                          const currentItems = ensureAcceptanceItems(
                            createForm.acceptanceCriteria || "",
                          );
                          currentItems[index].label = e.target.value;
                          setCreateForm({
                            ...createForm,
                            acceptanceCriteria:
                              serializeAcceptanceChecklist(currentItems),
                          });
                        }}
                        placeholder="Agregar criterio"
                        className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder:text-[#64748b] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentItems = ensureAcceptanceItems(
                            createForm.acceptanceCriteria || "",
                          );
                          const filtered = currentItems.filter(
                            (_, i) => i !== index,
                          );
                          setCreateForm({
                            ...createForm,
                            acceptanceCriteria: serializeAcceptanceChecklist(
                              filtered.length
                                ? filtered
                                : [
                                    {
                                      id: `new-${Date.now()}`,
                                      label: "",
                                      checked: true,
                                    },
                                  ],
                            ),
                          });
                        }}
                        className="text-[#94a3b8] hover:text-white text-sm shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const currentItems = ensureAcceptanceItems(
                        createForm.acceptanceCriteria || "",
                      );
                      setCreateForm({
                        ...createForm,
                        acceptanceCriteria: serializeAcceptanceChecklist([
                          ...currentItems,
                          { id: `new-${Date.now()}`, label: "", checked: true },
                        ]),
                      });
                    }}
                    className="mt-2 text-[10px] uppercase tracking-wider text-[#0aa5b5] hover:text-[#22c1d3]"
                  >
                    + Añadir criterio
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Estado Inicial
                </label>
                <select
                  value="ToDo"
                  disabled
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5] opacity-100"
                >
                  <option value="ToDo">Por Hacer (ToDo)</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Asignar a
                  </label>
                  <div className="bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 space-y-1.5 max-h-36 overflow-y-auto">
                    {users.map((u) => {
                      const userId = String(u.id || u._id);
                      const isSelected = createForm.userIds.includes(userId);
                      return (
                        <label
                          key={userId}
                          className="flex items-center gap-2 text-[11px] text-[#e2e8f0] cursor-pointer select-none rounded px-2 py-1 hover:bg-[#20242d]"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleUserSelection(
                                userId,
                                `${u.firstName} ${u.surname || ""}`.trim(),
                              )
                            }
                            className="h-3.5 w-3.5 rounded border-[#333a47] bg-[#20242d]"
                          />
                          <span className="truncate">
                            {u.firstName} {u.surname || ""} ({u.username})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Single tag selection */}
              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-2 uppercase tracking-wider">
                  Asignar Etiquetas
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#12141a] border border-[#333a47] p-3 rounded-lg">
                  {tags.map((tag) => {
                    const isChecked = createForm.tagIds.includes(tag.id);
                    return (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2.5 text-xs text-[#e2e8f0] cursor-pointer select-none"
                      >
                        <input
                          type="radio"
                          name="create-task-tag"
                          checked={isChecked}
                          onChange={() =>
                            toggleTagSelection(
                              createForm,
                              setCreateForm,
                              tag.id,
                            )
                          }
                          className="w-3.5 h-3.5 text-[#0aa5b5] bg-[#2a2f3a] border-[#333a47] focus:ring-0"
                        />
                        <span
                          style={{ color: tag.color }}
                          className="font-semibold"
                        >
                          {tag.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-6 border-t border-[#333a47] mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-1/2 bg-[#2a2f3a] hover:bg-[#333a47] text-[#94a3b8] hover:text-white py-2.5 rounded-lg text-xs font-bold transition-all border border-[#333a47]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0aa5b5] hover:bg-[#22c1d3] text-white py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE BACKUPS Y BITACORA */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#20242d]/90 border border-[#333a47]/80 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-slideUp">
            <button
              onClick={() => setIsBackupModalOpen(false)}
              className="absolute top-4 right-4 text-[#94a3b8] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Database className="text-[#0aa5b5]" size={22} />
                <span>Copias de Seguridad y Bitácora</span>
              </h3>
              <p className="text-xs text-[#94a3b8] mt-2">
                Selecciona la opción de copia de seguridad o reporte de
                auditoría que deseas descargar de la base de datos PostgreSQL.
              </p>
            </div>

            <div className="space-y-4">
              {/* Opción 1: SQL Dump */}
              <div className="bg-[#2a2f3a] p-4 rounded-xl border border-[#333a47] flex flex-col justify-between hover:border-[#0aa5b5]/50 transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-lg bg-[#0aa5b5]/10 text-[#0aa5b5] border border-[#0aa5b5]/20">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Base de Datos Completa (SQL)
                    </h4>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Contiene la estructura completa (esquemas, tablas) y los
                      datos registrados (tareas, bitácora).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "http://localhost:5214/api/backups/download",
                      `backup_${new Date().toISOString().slice(0, 10)}.sql`,
                      "DOWNLOAD_BACKUP",
                      "Descargó copia de seguridad de la base de datos (SQL)",
                    )
                  }
                  className="mt-3 w-full py-2 bg-[#0aa5b5] hover:bg-[#22c1d3] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={14} />
                  <span>Descargar SQL</span>
                </button>
              </div>

              {/* Opción 2: Bitácora CSV */}
              <div className="bg-[#2a2f3a] p-4 rounded-xl border border-[#333a47] flex flex-col justify-between hover:border-[#0aa5b5]/50 transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Bitácora de Auditoría (CSV)
                    </h4>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Exporta el historial de acciones de los usuarios en
                      formato de hoja de cálculo.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "http://localhost:5214/api/auditlogs/export/csv",
                      `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
                      "EXPORT_BITACORA_CSV",
                      "Exportó la bitácora de actividades en formato CSV",
                    )
                  }
                  className="mt-3 w-full py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={14} />
                  <span>Exportar CSV</span>
                </button>
              </div>

              {/* Opción 3: Bitácora JSON */}
              <div className="bg-[#2a2f3a] p-4 rounded-xl border border-[#333a47] flex flex-col justify-between hover:border-[#0aa5b5]/50 transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Bitácora de Auditoría (JSON)
                    </h4>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Exporta el historial de auditoría del sistema estructurado
                      en formato JSON.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "http://localhost:5214/api/auditlogs/export/json",
                      `audit_logs_${new Date().toISOString().slice(0, 10)}.json`,
                      "EXPORT_BITACORA_JSON",
                      "Exportó la bitácora de actividades en formato JSON",
                    )
                  }
                  className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={14} />
                  <span>Exportar JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (DESHABILITACIÓN) */}
      {taskToDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#20242d]/90 border border-[#333a47] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-scaleIn">
            <h3 className="text-lg font-bold text-white mb-2">
              Eliminar Tarea
            </h3>
            <p className="text-sm text-[#94a3b8] mb-6">
              ¿Deseas eliminar esta tarea? No se borrará físicamente de la base
              de datos; se marcará como deshabilitada y quedará oculta del
              tablero.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setTaskToDeleteId(null)}
                className="w-1/2 bg-[#2a2f3a] hover:bg-[#333a47] text-[#94a3b8] hover:text-white py-2.5 rounded-lg text-xs font-bold transition-all border border-[#333a47]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const task = tasks.find((t) => t.id === taskToDeleteId);
                  if (task) {
                    updateTask(taskToDeleteId, { ...task, isDisabled: true });
                    setSelectedTask(null);
                    setEditForm(null);
                  }
                  setTaskToDeleteId(null);
                }}
                className="w-1/2 bg-[#c95d5d] hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-500/10"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
