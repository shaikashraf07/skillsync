import axios from "axios";

// Production API URL — hardcoded so it's always baked into the Android/iOS build
// Override with VITE_API_BASE_URL env variable for local development
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://skillsync-api-gnhz.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
