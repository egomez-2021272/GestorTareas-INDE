import React from "react";
import { useAuthStore } from "../../../features/auth/store/authStore";

const columns = [
  { status: "ToDo", label: "Por Hacer", color: "#c95d5d" },
  { status: "InProgress", label: "En Proceso", color: "#0aa5b5" },
  { status: "Pending", label: "En Espera", color: "#c0914e" },
  { status: "Completed", label: "Completado", color: "#669a71" },
];

export const TaskList = ({ tasks, onTaskSelect, users }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 flex-1 min-h-[420px]">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status && !task.isDisabled,
          );

          return (
            <div
              key={column.status}
              className="bg-[#20242d]/40 rounded-2xl border border-[#333a47]/50 p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: column.color }}
                  ></div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {column.label}
                  </h3>
                </div>
                <span className="bg-[#2a2f3a] px-2.5 py-0.5 rounded-full text-xs text-[#94a3b8] font-bold">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[52vh] sm:max-h-[58vh] xl:max-h-[62vh]">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={column.status === "Completed"}
                    onSelect={onTaskSelect}
                    users={users}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TaskCard = ({ task, isCompleted, onSelect, users }) => {
  const { user: currentUser } = useAuthStore();

  const getAssignedNames = () => {
    if (task.assignedUsers && task.assignedUsers.length > 0) {
      const names = task.assignedUsers
        .map((au) => {
          if (String(au.userId) === String(currentUser?.id)) return "mí";
          return au.assignedToName || "Asignado";
        })
        .filter(Boolean);

      if (names.length === 0) return null;
      if (names.length === 1) {
        return names[0] === "mí" ? "Yo" : names[0];
      }
      if (names.length <= 2) {
        return names.join(" + ");
      }
      return `${names.slice(0, 2).join(" + ")} +${names.length - 2}`;
    }

    if (task.assignedToName) {
      if (task.userId === currentUser?.id) return "Yo";
      return task.assignedToName;
    }

    if (!task.userId) return null;
    if (String(task.userId) === String(currentUser?.id)) return "Yo";
    if (users && users.length > 0) {
      const found = users.find(
        (u) => String(u.id || u._id) === String(task.userId),
      );
      if (found) return `${found.firstName} ${found.surname || ""}`.trim();
    }
    return "Asignado";
  };

  const assignedName = getAssignedNames();

  return (
    <div
      onClick={() => onSelect(task)}
      className="bg-[#20242d] p-4 rounded-xl border border-[#333a47] hover:border-[#0aa5b5] transition-all cursor-pointer shadow-md select-none group"
    >
      <div className="flex justify-between items-start gap-2">
        <h4
          className={`text-sm font-semibold text-white leading-snug group-hover:text-[#22c1d3] transition-colors ${isCompleted ? "line-through decoration-[#94a3b8]" : ""}`}
        >
          {task.title}
        </h4>
        {assignedName && (
          <span className="shrink-0 max-w-[90px] truncate text-[9px] font-bold px-1.5 py-0.5 bg-[#0aa5b5]/10 border border-[#0aa5b5]/20 text-[#0aa5b5] rounded">
            {assignedName}
          </span>
        )}
      </div>
      <p className="text-xs text-[#94a3b8] mt-2 line-clamp-3 leading-relaxed">
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
  );
};
