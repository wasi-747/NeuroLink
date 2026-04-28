import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/resources";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getArticles = (category = "All", search = "") => {
  let queryStr = `?category=${category}`;
  if (search) {
    queryStr += `&search=${search}`;
  }
  return api.get(`/articles${queryStr}`);
};

export const getArticle = (id) => {
  return api.get(`/articles/${id}`);
};
