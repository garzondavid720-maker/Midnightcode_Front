// src/services/productoService.js
import api from "./api";

export const productoService = {
  getAll: async () => {
    const response = await api.get("/productos");
    // El backend devuelve { success, data: productos }
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/productos/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post("/productos", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/productos/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  },
};