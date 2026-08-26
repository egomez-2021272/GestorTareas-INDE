import axios from "axios";

const authApi = axios.create({
  baseURL:
    import.meta.env.VITE_AUTH_API_URL ||
    "http://localhost:3000/indetasks/v1/auth",
  headers: { "Content-Type": "application/json" },
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Invalidate session on 401 (e.g. server restart / token invalid)
      localStorage.removeItem("auth-storage-inde");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const loginRequest = (credentials) =>
  authApi.post("/login", credentials);
export const registerRequest = (userData) => authApi.post("/", userData);
export const resetPasswordRequest = (email) =>
  authApi.post("/forgot-password", { email });
export const activateAccountRequest = (token) =>
  authApi.get(`/activate/${token}`);
export const activateWithPasswordRequest = (token, newPassword) =>
  authApi.post(`/activate/${token}`, { newPassword });
export const setNewPasswordRequest = (token, newPassword) =>
  authApi.post(`/reset-password/${token}`, { newPassword });
export const getAllUsersRequest = (token) =>
  authApi.get("/users", { headers: { Authorization: `Bearer ${token}` } });
export const toggleUserStatusRequest = (id, token) =>
  authApi.patch(
    `/users/${id}/toggle-status`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
export const createAdminRequest = (userData, token) =>
  authApi.post("/admin", userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const deleteUserRequest = (id, token) =>
  authApi.delete(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
