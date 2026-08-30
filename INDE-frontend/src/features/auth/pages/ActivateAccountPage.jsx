import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { activateAccountRequest, activateWithPasswordRequest } from '../../../shared/apis/authApi';
import { useAuthStore } from '../store/authStore';

export const ActivateAccountPage = () => {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, message: '' });
  const { logout } = useAuthStore();

  useEffect(() => {
    // Cerrar cualquier sesión activa para evitar redirecciones al dashboard antiguo al finalizar
    logout();

    activateAccountRequest(token)
      .then(({ data }) => setState({ loading: false, message: data.message || 'Tu cuenta fue activada correctamente.' }))
      .catch((error) => setState({ loading: false, message: error.response?.data?.message || 'No fue posible activar la cuenta.' }));
  }, [token, logout]);

  return <AuthMessage title="Activación de cuenta" loading={state.loading} message={state.message} />;
};

export const AuthMessage = ({ title, loading, message, children }) => (
  <main className="min-h-screen bg-[#12141a] flex items-center justify-center p-4 text-[#e2e8f0]">
    <section className="w-full max-w-md bg-[#20242d] border border-[#333a47] rounded-xl p-8 text-center shadow-2xl">
      <p className="text-[#0aa5b5] text-xs tracking-widest font-bold uppercase mb-2">INDE-task&apos;s</p>
      <h1 className="text-xl font-semibold mb-4">{title}</h1>
      <p className="text-sm text-[#94a3b8] leading-6">{loading ? 'Procesando tu solicitud...' : message}</p>
      {!loading && (children || <Link to="/login" className="inline-block mt-6 bg-[#005b70] hover:bg-[#004a5c] rounded-md px-5 py-2.5 text-sm font-medium text-white">Iniciar sesión</Link>)}
    </section>
  </main>
);
