import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/pages/ForgotPasswordForm';
import { ActivateAccountPage } from '../features/auth/pages/ActivateAccountPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { ForceChangePasswordPage } from '../features/auth/pages/ForceChangePasswordPage';
import { DashboardAdmin } from '../features/dashboard/pages/DashboardAdmin';
import { DashboardUser } from '../features/dashboard/pages/DashboardUser';
import { useAuthStore } from '../features/auth/store/authStore';

import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, requiresPasswordChange } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiresPasswordChange && location.pathname !== "/force-change-password") {
    return <Navigate to="/force-change-password" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const DashboardRouter = () => {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN_ROLE' ? <DashboardAdmin /> : <DashboardUser />;
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
        <Route path="/force-change-password" element={<ProtectedRoute><ForceChangePasswordPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        {/* Redirigir cualquier otra ruta a login o dashboard según estado */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;