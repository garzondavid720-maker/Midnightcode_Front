// src/services/ventaService.js
import api from "./api";

export const ventaService = {
  getAll: async () => {
    const response = await api.get("/ventas");
    return response.data;
  },
  getPendientes: async () => {
    const response = await api.get("/ventas/pendientes");
    return response.data;
  },
  getByCodigo: async (codigo) => {
    const response = await api.get(`/ventas/codigo/${codigo}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/ventas/${id}`);
    return response.data;
  },
  getMisVentas: async () => {
    const response = await api.get("/ventas/mis-ventas");
    return response.data; // { success, data: [...] }
  },
  create: async (data) => {
    const response = await api.post("/ventas", data);
    return response.data;
  },
  pagar: async (id, data) => {
    const response = await api.post(`/ventas/${id}/pagar`, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/ventas/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/ventas/${id}`);
    return response.data;
  },
};