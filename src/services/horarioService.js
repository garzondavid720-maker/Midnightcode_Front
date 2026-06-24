import api from "./api";

export const horarioService = {
  getAll: async () => {
    const response = await api.get("/horarios");
    return response.data; // array
  },
  getByDocumento: async (documento) => {
    const response = await api.get(`/horarios/usuario/${documento}`);
    // El backend devuelve { success, data: [] } o { success, message, data: [] }
    return response.data.data || [];
  },
  create: async (data) => {
    const response = await api.post("/horarios", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/horarios/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/horarios/${id}`);
    return response.data;
  },
};