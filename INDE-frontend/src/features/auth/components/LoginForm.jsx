import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LogoInde from "../../../assets/img/indelogo.png";

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await login(data);

    if (result.success) {
      if (result.requiresPasswordChange) {
        navigate("/force-change-password");
      } else {
        navigate("/dashboard");
      }
      console.log("Login successful");
    }
  };

  return (
    <div className="min-h-screen bg-[#1b1d24] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect width="1000" height="1000" fill="#1b1d24" />
          <g stroke="#101217" strokeWidth="2">
            <polygon points="0,410 92,405 138,480 0,520" fill="#202229" />
            <polygon points="0,520 138,480 0,650" fill="#111318" />
            <polygon points="0,650 138,480 228,580 0,790" fill="#17191f" />
            <polygon points="0,790 228,580 245,790" fill="#121419" />
            <polygon points="92,405 220,285 138,480" fill="#1f2128" />
            <polygon points="220,285 286,410 138,480" fill="#14161b" />
            <polygon points="138,480 286,410 228,580" fill="#0e1015" />
            <polygon points="138,480 228,580 245,790" fill="#1d1f26" />
            <polygon points="228,580 330,505 245,790" fill="#15171d" />
            <polygon points="330,505 286,410 228,580" fill="#202229" />
            <polygon points="700,305 814,410 752,485" fill="#17191f" />
            <polygon points="814,410 892,322 1000,338 886,485" fill="#101217" />
            <polygon points="814,410 886,485 752,485" fill="#22242b" />
            <polygon points="752,485 886,485 875,615" fill="#14161b" />
            <polygon points="752,485 875,615 704,620" fill="#1d1f25" />
            <polygon
              points="886,485 1000,435 1000,665 875,615"
              fill="#202229"
            />
            <polygon
              points="875,615 1000,665 1000,810 938,730"
              fill="#121419"
            />
            <polygon points="875,615 938,730 704,620" fill="#15171d" />
            <polygon
              points="700,305 1000,115 1000,338 892,322"
              fill="#1e2027"
            />
          </g>
        </svg>
      </div>

      <div className="z-10 text-center mb-8">
        <h1 className="text-[28px] font-medium text-[#e2e8f0] mb-1 tracking-normal">
          Gestor de Tareas INDE
        </h1>
        <p className="text-[#848b98] text-[15px] font-normal">Acceso Seguro</p>
      </div>

      <div className="z-10 w-full max-w-[360px] bg-[#22252a] rounded-[10px] border border-[#3b3e46] shadow-2xl p-8 pb-10">
        <div className="flex justify-center mb-8 items-center">
          <img
            src={LogoInde}
            alt="Logo INDE"
            className="w-full max-w-[200px] h-auto object-contain block mx-auto"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#e2e8f0] block">
              Username
            </label>
            <input
              type="text"
              autoComplete="off"
              placeholder="Username"
              {...register("username", { required: "El usuario es requerido" })}
              className="w-full bg-[#313541] text-gray-100 border border-[#484d5a] focus:border-[#005b70] focus:ring-1 focus:ring-[#005b70] rounded-md px-3 py-2.5 outline-none transition-all placeholder:text-gray-500 text-sm"
            />
            {errors.username && (
              <span className="text-red-400 text-xs">
                {errors.username.message}
              </span>
            )}
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[13px] font-medium text-[#e2e8f0] block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Password"
                {...register("password", {
                  required: "La contraseña es requerida",
                })}
                className="w-full bg-[#313541] text-gray-100 border border-[#484d5a] focus:border-[#005b70] focus:ring-1 focus:ring-[#005b70] rounded-md px-3 py-2.5 pr-10 outline-none transition-all placeholder:text-gray-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-400 text-xs">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005b70] hover:bg-[#004a5c] text-white font-medium rounded-md py-[10px] mt-6 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#22252a] focus:ring-[#005b70] disabled:opacity-70"
          >
            {loading ? "Validando..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-3 text-center">
          <Link
            to="/forgot-password"
            className="text-[13px] text-gray-400 hover:text-white transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <div className="text-[13px] text-gray-500">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="text-[#005b70] hover:text-[#007b97] font-medium transition-colors"
            >
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
