import axios from "./axios";

export const login = async (credentials) => {
  const { data } = await axios.post("/auth/login", credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await axios.post("/auth/register", userData);
  return data;
};

export const logout = async () => {
  const { data } = await axios.get("/auth/logout");
  return data;
};

export const getProfile = async () => {
  const { data } = await axios.get("/auth/me");
  return data;
};
