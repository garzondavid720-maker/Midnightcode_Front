import api from "./api";

export const reservaService = {
  getMesasDisponibles: async (params) => {
    const response = await api.get("/reservas/mesas-disponibles", { params });
    return response.data; // array
  },
  getParqueaderosDisponibles: async (params) => {
    const response = await api.get("/reservas/parqueaderos-disponibles", { params });
    return response.data; // array
  },
  bloquearMesa: async (data) => {
    const response = await api.post("/reservas/bloquear", data);
    return response.data; // reserva bloqueada
  },
  getAll: async () => {
    const response = await api.get("/reservas");
    return response.data; // array
  },
  getMisReservas: async () => {
    const response = await api.get("/reservas/mis-reservas");
    return response.data; // array
  },
  create: async (data) => {
    const response = await api.post("/reservas", data);
    return response.data; // reserva creada
  },
  update: async (id, data) => {
    const response = await api.put(`/reservas/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },
};