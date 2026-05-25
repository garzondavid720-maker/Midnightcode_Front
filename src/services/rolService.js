// src/services/rolService.js
import api from "./api";

export const rolService = {
  getAll: async () => {
    const response = await api.get("/roles");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/roles", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};