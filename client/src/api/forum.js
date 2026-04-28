import axios from "axios";

// Using the same axios instance/base pattern assumed for the rest of the app
const API_URL = "http://localhost:5000/api/v1/forum";

// Axios instance with interceptors for auth if they exist globally, 
// otherwise we pass withCredentials (assuming cookies or headers are handled)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Assuming HTTP-only cookies are used for auth
});

export const getPosts = (cursor = "", category = "All") => {
  return api.get(`/posts?cursor=${cursor}&category=${category}`);
};

export const getPost = (id) => {
  return api.get(`/posts/${id}`);
};

export const createPost = (data) => {
  return api.post("/posts", data);
};

export const reactToPost = (id, type) => {
  return api.post(`/posts/${id}/react`, { type });
};

export const unreactToPost = (id) => {
  return api.delete(`/posts/${id}/react`);
};

export const getComments = (id) => {
  return api.get(`/posts/${id}/comments`);
};

export const addComment = (id, data) => {
  return api.post(`/posts/${id}/comments`, data);
};

export const reactToComment = (id, type) => {
  return api.post(`/comments/${id}/react`, { type });
};

export const reportPost = (id, reason) => {
  return api.post(`/posts/${id}/report`, { reason });
};
