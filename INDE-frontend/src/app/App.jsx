import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "../features/auth/components/LoginForm";
import { RegisterForm } from "../features/auth/components/RegisterForm";
import { ForgotPasswordForm } from "../features/auth/pages/ForgotPasswordForm";
import { Dashboard } from "../features/dashboard/pages/Dashboard";
import { useAuthStore } from "../features/auth/store/authStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Redirigir cualquier otra ruta a login temporalmente */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
