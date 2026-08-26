import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/pages/ForgotPasswordForm';
import { ActivateAccountPage } from '../features/auth/pages/ActivateAccountPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { useAuthStore } from '../features/auth/store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordForm /></PublicRoute>} />
        <Route path="/activate/:token" element={<ActivateAccountPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        {/* Redirigir cualquier otra ruta a login o dashboard según estado */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;