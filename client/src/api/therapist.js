import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/therapists";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getTherapists = (filters) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.location && filters.location !== "All") params.append("location", filters.location);
  if (filters.specializations && filters.specializations.length > 0) params.append("specializations", filters.specializations.join(","));
  if (filters.sessionType && filters.sessionType !== "All") params.append("sessionType", filters.sessionType);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.minRating) params.append("minRating", filters.minRating);
  
  return api.get(`/?${params.toString()}`);
};

export const getTherapist = (id) => {
  return api.get(`/${id}`);
};

export const createBooking = (id, data) => {
  return api.post(`/${id}/book`, data);
};

export const getMyBookings = () => {
  return api.get(`/bookings/my-bookings`);
};

export const createReview = (id, data) => {
  return api.post(`/${id}/reviews`, data);
};
