import React, { useState } from "react";
import { Plus, Check, X, Shield, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../../auth/store/authStore";

export const UsersTab = () => {
  const { users, user: actingUser, toggleUserStatus, createUserByAdmin } = useAuthStore();
  const baseAdminEmail = import.meta.env.VITE_SEEDER_ADMIN_EMAIL || "adminindetask@inde.admin";
  const isProtectedAdmin = actingUser?.email === baseAdminEmail;
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    role: "USER_ROLE",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // validateCreateUser requires acceptTerms and password
    const payload = {
      ...form,
      acceptTerms: true,
      createdByAdmin: true,
    };
    const res = await createUserByAdmin(payload, form.role);
    if (res.success) {
      setIsCreating(false);
      setForm({
        firstName: "",
        surname: "",
        email: "",
        username: "",
        password: "",
        role: "USER_ROLE",
      });
    } else {
      setFormError(
        res.error ||
          "Ocurrió un error de validación (revisa que el correo/usuario no existan y la contraseña tenga 8+ caracteres).",
      );
    }
  };

  const handleToggleStatus = (id, user) => {
    if (user?.email === baseAdminEmail) {
      window.alert(
        "El administrador base no puede ser desactivado.",
      );
      return;
    }

    if (window.confirm("¿Cambiar estado de activación de este usuario?")) {
      toggleUserStatus(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">
          Gestión de Usuarios
        </h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-[#0aa5b5] hover:bg-[#22c1d3] text-white flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          {isCreating ? <X size={16} /> : <Plus size={16} />}
          <span>{isCreating ? "Cancelar" : "Nuevo Usuario"}</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-[#20242d] p-6 rounded-2xl border border-[#333a47] mb-6 shadow-xl animate-fadeInScale">
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Crear Nuevo Usuario/Admin
          </h4>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {formError && (
              <div className="md:col-span-2 mb-2 bg-[#c95d5d]/20 border border-[#c95d5d]/30 text-[#c95d5d] px-4 py-3 rounded relative text-sm font-semibold">
                {formError}
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                Nombre
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:border-[#0aa5b5] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                Apellido
              </label>
              <input
                type="text"
                required
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
                className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:border-[#0aa5b5] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                Usuario (Username)
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:border-[#0aa5b5] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                Correo
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:border-[#0aa5b5] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                Rol
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:border-[#0aa5b5] outline-none"
              >
                <option value="USER_ROLE">Técnico</option>
                <option value="ADMIN_ROLE">Administrador</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
                Contraseña Temporal
              </label>
              <input
                type="text"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-xs text-white focus:border-[#0aa5b5] outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full bg-[#669a71] hover:bg-[#52815c] text-white font-bold py-2.5 rounded-lg transition-colors"
              >
                Crear y Enviar Correo de Activación
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#20242d] rounded-2xl border border-[#333a47] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#94a3b8]">
            <thead className="bg-[#2a2f3a] text-xs uppercase text-white font-bold border-b border-[#333a47]">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-[#333a47] hover:bg-[#2a2f3a]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#0aa5b5]/20 flex items-center justify-center text-[#0aa5b5] font-bold text-xs">
                        {u.firstName?.[0] || "U"}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {u.firstName} {u.surname}
                        </p>
                        <p className="text-[10px] text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center space-x-1">
                      {u.role === "ADMIN_ROLE" ? (
                        <Shield size={14} className="text-[#c0914e]" />
                      ) : (
                        <UserIcon size={14} className="text-[#0aa5b5]" />
                      )}
                      <span
                        className={
                          u.role === "ADMIN_ROLE"
                            ? "text-[#c0914e] font-bold text-xs"
                            : "text-[#0aa5b5] font-bold text-xs"
                        }
                      >
                        {u.role === "ADMIN_ROLE" ? "Admin" : "Técnico"}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <span className="bg-[#669a71]/20 text-[#669a71] px-2 py-1 rounded text-xs font-bold border border-[#669a71]/30">
                        Activo
                      </span>
                    ) : (
                      <span className="bg-[#c95d5d]/20 text-[#c95d5d] px-2 py-1 rounded text-xs font-bold border border-[#c95d5d]/30">
                        Cuenta no activada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.email !== baseAdminEmail && (u.role !== "ADMIN_ROLE" || isProtectedAdmin) ? (
                      <button
                        onClick={() => handleToggleStatus(u._id, u)}
                        className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${u.isActive ? "bg-[#c95d5d]/10 text-[#c95d5d] hover:bg-[#c95d5d]/20" : "bg-[#669a71]/10 text-[#669a71] hover:bg-[#669a71]/20"}`}
                      >
                        {u.isActive ? "Desactivar" : "Activar Manual"}
                      </button>
                    ) : u.email === baseAdminEmail ? (
                      <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                        Admin protegido
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                        Solo admin base
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
