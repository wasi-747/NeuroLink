import axios from "axios";

const API_URL = "/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// TODO: Add interceptors for token refresh

export default axiosInstance;
