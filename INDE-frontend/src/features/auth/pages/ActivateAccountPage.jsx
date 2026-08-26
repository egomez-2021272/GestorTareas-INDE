import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { activateAccountRequest, activateWithPasswordRequest } from '../../../shared/apis/authApi';
import { useAuthStore } from '../store/authStore';

export const ActivateAccountPage = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const setup = searchParams.get('setup') === 'true';
  const [state, setState] = useState({ loading: !setup, message: '' });
  const [newPassword, setNewPassword] = useState('');
  const { logout } = useAuthStore();

  useEffect(() => {
    // Cerrar cualquier sesión activa para evitar redirecciones al dashboard antiguo al finalizar
    logout();

    if (!setup) {
      activateAccountRequest(token)
        .then(({ data }) => setState({ loading: false, message: data.message || 'Tu cuenta fue activada correctamente.' }))
        .catch((error) => setState({ loading: false, message: error.response?.data?.message || 'No fue posible activar la cuenta.' }));
    }
  }, [token, setup, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ loading: true, message: '' });
    try {
      const { data } = await activateWithPasswordRequest(token, newPassword);
      setState({ loading: false, message: data.message || 'Contraseña guardada y cuenta activada.' });
    } catch (error) {
      setState({ loading: false, message: error.response?.data?.message || 'Error al guardar la contraseña.' });
    }
  };

  if (setup && state.message === '') {
    return (
      <main className="min-h-screen bg-[#12141a] flex items-center justify-center p-4 text-[#e2e8f0]">
        <section className="w-full max-w-md bg-[#20242d] border border-[#333a47] rounded-xl p-8 text-center shadow-2xl">
          <p className="text-[#0aa5b5] text-xs tracking-widest font-bold uppercase mb-2">INDE-task&apos;s</p>
          <h1 className="text-xl font-semibold mb-4">Configura tu contraseña</h1>
          <p className="text-sm text-[#94a3b8] leading-6 mb-6">Tu cuenta ha sido creada por un administrador. Crea una contraseña segura de al menos 8 caracteres para activarla.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="password" 
              required 
              minLength={8}
              placeholder="Nueva contraseña"
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full bg-[#12141a] border border-[#333a47] rounded-lg p-2.5 text-sm text-white focus:border-[#0aa5b5] outline-none"
            />
            <button 
              type="submit" 
              disabled={state.loading}
              className="w-full bg-[#005b70] hover:bg-[#004a5c] rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              {state.loading ? 'Procesando...' : 'Guardar y Activar'}
            </button>
          </form>
        </section>
      </main>
    );
  }

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
