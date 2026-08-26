import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { setNewPasswordRequest } from '../../../shared/apis/authApi';
import { AuthMessage } from './ActivateAccountPage';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ newPassword }) => {
    try {
      setLoading(true);
      const { data } = await setNewPasswordRequest(token, newPassword);
      setResult({ success: true, message: data.message || 'Tu contraseña fue restablecida.' });
    } catch (error) {
      setResult({ success: false, message: error.response?.data?.error || error.response?.data?.message || 'No fue posible restablecer la contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  if (result?.success) return <AuthMessage title="Contraseña actualizada" loading={false} message={result.message} />;

  return (
    <main className="min-h-screen bg-[#12141a] flex items-center justify-center p-4 text-[#e2e8f0]">
      <section className="w-full max-w-md bg-[#20242d] border border-[#333a47] rounded-xl p-8 shadow-2xl">
        <p className="text-[#0aa5b5] text-xs tracking-widest font-bold uppercase mb-2">INDE-task&apos;s</p>
        <h1 className="text-xl font-semibold mb-5">Crear nueva contraseña</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5">Nueva contraseña</label>
            <input type="password" autoComplete="new-password" {...register('newPassword', { required: 'La contraseña es requerida', minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' } })} className="w-full bg-[#2a2f3a] border border-[#333a47] rounded-md px-3 py-2.5 outline-none focus:border-[#0aa5b5]" />
            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          {result && <p className="text-red-400 text-sm">{result.message}</p>}
          <button disabled={loading} className="w-full bg-[#005b70] hover:bg-[#004a5c] disabled:opacity-70 rounded-md py-2.5 text-sm font-medium">{loading ? 'Guardando...' : 'Restablecer contraseña'}</button>
        </form>
        <Link to="/login" className="block text-center text-[#94a3b8] text-sm mt-5">Volver al inicio de sesión</Link>
      </section>
    </main>
  );
};
