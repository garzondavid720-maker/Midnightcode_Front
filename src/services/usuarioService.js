// src/services/usuarioService.js
import publicApi from "./publicApi";
import api from "./api";

export const usuarioService = {
  // Público: registro de nuevos clientes
  register: async (userData) => {
    const response = await publicApi.post("/usuarios/register", userData);
    return response.data;
  },

  // Privados (requieren token, con roles según backend)
  getAll: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  patch: async (id, data) => {
    const response = await api.patch(`/usuarios/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};