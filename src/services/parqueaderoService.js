// src/services/parqueaderoService.js
import api from "./api";

export const parqueaderoService = {
  getAll: async () => {
    const response = await api.get("/parqueaderos");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/parqueaderos", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/parqueaderos/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/parqueaderos/${id}`);
    return response.data;
  },
};