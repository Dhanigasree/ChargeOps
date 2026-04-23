import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("chargeops_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me")
};

export const userApi = {
  me: () => api.get("/users/me"),
  updateMe: (payload) => api.put("/users/me", payload),
  list: () => api.get("/users")
};

export const stationApi = {
  list: (params) => api.get("/stations", { params }),
  getById: (stationId) => api.get(`/stations/${stationId}`),
  create: (payload) => api.post("/stations", payload),
  update: (stationId, payload) => api.put(`/stations/${stationId}`, payload),
  remove: (stationId) => api.delete(`/stations/${stationId}`)
};

export const bookingApi = {
  create: (payload) => api.post("/bookings", payload),
  mine: () => api.get("/bookings/me"),
  cancel: (bookingId) => api.patch(`/bookings/${bookingId}/cancel`)
};

export const paymentApi = {
  create: (payload) => api.post("/payments/create", payload),
  getById: (paymentId) => api.get(`/payments/${paymentId}`)
};

export const reviewApi = {
  create: (payload) => api.post("/reviews", payload),
  listByStation: (stationId) => api.get(`/reviews/${stationId}`),
  remove: (reviewId) => api.delete(`/reviews/${reviewId}`)
};

export const adminApi = {
  users: () => api.get("/admin/users"),
  bookings: () => api.get("/admin/bookings"),
  analytics: () => api.get("/admin/analytics"),
  approveStation: (stationId, isApproved = true) => api.put(`/admin/stations/${stationId}/approve`, { isApproved })
};

export default api;
