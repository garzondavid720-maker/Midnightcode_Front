import api from "./api";

export const cancionService = {
  buscarYoutube: async (queryParams) => {
    const response = await api.get("/canciones/youtube", { params: queryParams });
    return response.data; // array de canciones
  },
  getAll: async () => {
    const response = await api.get("/canciones");
    return response.data; // array
  },
  create: async (data) => {
    const response = await api.post("/canciones", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/canciones/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/canciones/${id}`);
    return response.data;
  },
};