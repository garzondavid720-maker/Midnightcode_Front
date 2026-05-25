// src/services/mesaService.js
import api from "./api";

export const mesaService = {
  getAll: async () => {
    const response = await api.get("/mesas");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/mesas", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/mesas/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/mesas/${id}`);
    return response.data;
  },
};