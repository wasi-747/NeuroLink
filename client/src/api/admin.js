import axios from "./axios";

export const getDashboardStats = () => axios.get("/admin/stats");

export const getUsers = () => axios.get("/admin/users");
export const toggleUserStatus = (id) => axios.patch(`/admin/users/${id}/toggle-status`);

export const getReports = () => axios.get("/admin/reports");
export const resolveReport = (id, action) => axios.patch(`/admin/reports/${id}`, { action });

export const getPendingTherapists = () => axios.get("/admin/therapists/pending");
export const verifyTherapist = (id) => axios.patch(`/admin/therapists/${id}/verify`);

export const getAdminCourses = () => axios.get("/admin/courses");
export const createCourse = (data) => axios.post("/admin/courses", data);
export const deleteCourse = (id) => axios.delete(`/admin/courses/${id}`);

export const getAdminArticles = () => axios.get("/admin/articles");
export const createArticle = (data) => axios.post("/admin/articles", data);
export const deleteArticle = (id) => axios.delete(`/admin/articles/${id}`);
