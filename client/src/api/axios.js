import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Response interceptor to handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Silently call refresh token endpoint
        await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;
