import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/pages/ForgotPasswordForm';
import { ActivateAccountPage } from '../features/auth/pages/ActivateAccountPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/activate/:token" element={<ActivateAccountPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* Redirigir cualquier otra ruta a login temporalmente */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;