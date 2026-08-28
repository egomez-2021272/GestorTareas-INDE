import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { useTaskStore } from "../store/taskStore";
import { TaskList } from "../components/TaskList";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import LogoInde from "../../../assets/img/indelogo.png";
import { UsersTab } from "../components/UsersTab";
import { BitacoraTab } from "../components/BitacoraTab";

export const DashboardAdmin = () => {
  const { user, logout, users, fetchUsers } = useAuthStore();
  const { tasks, tags, fetchTasks, addTask, updateTask, deleteTask } =
    useTaskStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, tasks, users
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para mobile
  const [selectedTask, setSelectedTask] = useState(null); // Para modal de detalles
  const [isCreateOpen, setIsCreateOpen] = useState(false); // Sidebar de creación

  // Form states
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    status: "ToDo",
    tagIds: [],
    userId: "",
  });

  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchTasks();
    if (user?.role === "ADMIN_ROLE") {
      fetchUsers();
    }
  }, []);

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
    if (!createForm.title.trim()) return;

    addTask(createForm);
    setIsCreateOpen(false);
    setCreateForm({
      title: "",
      description: "",
      status: "ToDo",
      tagIds: [],
      userId: "",
    });
  };

  // Guardar cambios en tarea editada (Admin / Técnico actualizando estado)
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm) return;

    updateTask(editForm.id, editForm);
    setSelectedTask(null);
    setEditForm(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta tarea?")) {
      deleteTask(id);
      setSelectedTask(null);
      setEditForm(null);
    }
  };

  // Toggle etiquetas seleccionadas en formularios
  const toggleTagSelection = (form, setForm, tagId) => {
    const currentTagId = form.tagIds?.[0];
    setForm({
      ...form,
      tagIds: currentTagId === tagId ? [] : [tagId],
    });
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
            onClick={() => {/* Lógica para descargar backup */}}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-[#0aa5b5] hover:bg-[#0aa5b5]/10 transition-colors"
          >
            <CheckSquare size={18} />
            <span>Descargar Backup</span>
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
              setEditForm({
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                tagIds: task.tags?.map((tag) => tag.id) || [],
                userId: task.userId || "",
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
          <div className="bg-[#20242d] rounded-2xl border border-[#333a47] w-full max-w-[500px] overflow-hidden shadow-2xl animate-fadeInScale">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#333a47] bg-[#2a2f3a]">
              <div className="flex items-center space-x-2">
                <img src={LogoInde} alt="Logo" className="h-6" />
                <h3 className="font-bold text-white text-sm">
                  Detalles de Tarea
                </h3>
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

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
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
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5] disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Descripción Técnica
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  disabled={!isAdmin}
                  rows={4}
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5] disabled:opacity-75 resize-none"
                  placeholder="Detalles de la tarea..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Asignado a
                  </label>
                  {isAdmin ? (
                    <select
                      value={editForm.userId || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          userId: e.target.value || null,
                        })
                      }
                      className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                    >
                      <option value="">Sin Asignar</option>
                      {users.map((u) => (
                        <option key={u.id || u._id} value={u.id || u._id}>
                          {u.firstName} {u.surname} ({u.username})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#2a2f3a] border border-[#333a47] rounded-lg p-2.5 text-xs text-[#94a3b8] select-none">
                      {(() => {
                        if (!editForm.userId) return "Sin Asignar";
                        if (editForm.userId === user?.id) return user?.name;
                        const found = users.find(
                          (u) => (u.id || u._id) === editForm.userId,
                        );
                        return found
                          ? `${found.firstName} ${found.surname}`
                          : "Asignado";
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Estado
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                  >
                    <option value="ToDo">Por Hacer (ToDo)</option>
                    <option value="InProgress">En Proceso</option>
                    <option value="Pending">En Espera (Pending)</option>
                    <option value="Completed">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Fecha Creación
                  </label>
                  <div className="w-full bg-[#2a2f3a] border border-[#333a47] rounded-lg p-2.5 text-xs text-[#94a3b8] select-none">
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Single tag selection */}
              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-2 uppercase tracking-wider">
                  Etiquetas Relacionadas
                </label>
                {isAdmin ? (
                  <div className="grid grid-cols-3 gap-2 bg-[#12141a] border border-[#333a47] p-3 rounded-lg">
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
                            checked={isChecked}
                            onChange={() =>
                              toggleTagSelection(editForm, setEditForm, tag.id)
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
                ) : (
                  <div className="flex flex-wrap gap-1.5 bg-[#12141a] border border-[#333a47] p-3 rounded-lg">
                    {selectedTask.tags && selectedTask.tags.length > 0 ? (
                      selectedTask.tags.map((tag) => (
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
                      ))
                    ) : (
                      <span className="text-xs text-[#94a3b8]">
                        Sin etiquetas
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-[#333a47] mt-4">
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
                  <button
                    type="submit"
                    className="bg-[#669a71] hover:brightness-110 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
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

              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Descripción Técnica
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setFormValue("description", e.target.value)}
                  rows={4}
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5] resize-none"
                  placeholder="Detalles sobre el trabajo a realizar..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                  Estado Inicial
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) => setFormValue("status", e.target.value)}
                  className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                >
                  <option value="ToDo">Por Hacer (ToDo)</option>
                  <option value="InProgress">En Proceso</option>
                  <option value="Pending">En Espera (Pending)</option>
                  <option value="Completed">Completado</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                    Asignar a
                  </label>
                  <select
                    value={createForm.userId}
                    onChange={(e) => setFormValue("userId", e.target.value)}
                    className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#0aa5b5]"
                  >
                    <option value="">Sin Asignar</option>
                    {users.map((u) => (
                      <option key={u.id || u._id} value={u.id || u._id}>
                        {u.firstName} {u.surname} ({u.username})
                      </option>
                    ))}
                  </select>
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
    </div>
  );

  // Helper local para setear valores
  function setFormValue(key, value) {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }
};
