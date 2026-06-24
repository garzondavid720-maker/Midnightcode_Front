import publicApi from "./publicApi";
import api from "./api";

export const usuarioService = {
  // Público: registro (aunque ya lo usamos en authService, lo dejamos por si acaso)
  register: async (userData) => {
    const response = await publicApi.post("/usuarios/register", userData);
    return response.data; // devuelve el usuario creado
  },

  // Privados
  getAll: async () => {
    const response = await api.get("/usuarios");
    return response.data; // array de usuarios
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data; // objeto usuario
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