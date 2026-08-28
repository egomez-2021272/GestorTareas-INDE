import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoInde from "../../../assets/img/indelogo.png";
import axios from "axios";
import toast from "react-hot-toast";

export const ForceChangePasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();
  
  const { token, user, logout, completePasswordChange } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/indetasks/v1/auth'}/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Contraseña actualizada correctamente.");
        completePasswordChange();
        // Después de cambiarla, vamos al dashboard correcto
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar contraseña. Verifica tu contraseña temporal.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#1b1d24] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect width="1000" height="1000" fill="#1b1d24" />
        </svg>
      </div>

      <div className="z-10 text-center mb-8">
        <h1 className="text-[28px] font-medium text-[#e2e8f0] mb-1 tracking-normal">
          Cambio Obligatorio de Contraseña
        </h1>
        <p className="text-[#848b98] text-[15px] font-normal">Por tu seguridad, actualiza tu contraseña temporal.</p>
      </div>

      <div className="z-10 w-full max-w-[400px] bg-[#22252a] rounded-[10px] border border-[#3b3e46] shadow-2xl p-8 pb-10">
        <div className="flex justify-center mb-8 items-center">
          <img src={LogoInde} alt="Logo INDE" className="w-full max-w-[200px] h-auto object-contain block mx-auto" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#e2e8f0] block">
              Contraseña Temporal (Actual)
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña temporal"
                {...register("currentPassword", { required: "La contraseña actual es requerida" })}
                className="w-full bg-[#313541] text-gray-100 border border-[#484d5a] focus:border-[#005b70] focus:ring-1 focus:ring-[#005b70] rounded-md px-3 py-2.5 outline-none transition-all placeholder:text-gray-500 text-sm pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && <span className="text-red-400 text-xs">{errors.currentPassword.message}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#e2e8f0] block">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                {...register("newPassword", {
                  required: "La nueva contraseña es requerida",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" }
                })}
                className="w-full bg-[#313541] text-gray-100 border border-[#484d5a] focus:border-[#005b70] focus:ring-1 focus:ring-[#005b70] rounded-md px-3 py-2.5 outline-none transition-all placeholder:text-gray-500 text-sm pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <span className="text-red-400 text-xs">{errors.newPassword.message}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#e2e8f0] block">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Repite la nueva contraseña"
                {...register("confirmPassword", {
                  required: "Por favor, confirma la contraseña",
                  validate: value => value === newPasswordValue || "Las contraseñas no coinciden"
                })}
                className="w-full bg-[#313541] text-gray-100 border border-[#484d5a] focus:border-[#005b70] focus:ring-1 focus:ring-[#005b70] rounded-md px-3 py-2.5 outline-none transition-all placeholder:text-gray-500 text-sm pr-10"
              />
            </div>
            {errors.confirmPassword && <span className="text-red-400 text-xs">{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005b70] hover:bg-[#004a5a] text-white font-medium py-2.5 rounded-md transition-colors mt-2 text-[15px]"
          >
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-transparent hover:bg-gray-800 text-gray-300 font-medium py-2.5 rounded-md transition-colors border border-gray-600 mt-2 text-[15px]"
          >
            Cancelar y salir
          </button>
        </form>
      </div>
    </div>
  );
};
