import axios from 'axios';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Elimino el interceptor de 401 porque ya lo maneja api.js
// Si quieres dejarlo, puedes, pero es redundante.
publicApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default publicApi;