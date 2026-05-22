// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: añade el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("neon_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: errores con mensajes amigables + log técnico
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // Log técnico detallado (solo en consola del desarrollador)
    console.group(`Error ${status || "NETWORK"} en ${method} ${url}`);
    console.error("Detalle técnico:", originalMessage);
    console.error("Configuración:", error.config);
    if (error.response) {
      console.error("Respuesta del servidor:", error.response.data);
    }
    console.groupEnd();

    // Mensaje amigable para el usuario
    let userMessage = "Ocurrió un error inesperado. Intenta de nuevo.";

    if (!error.response) {
      userMessage = "No hay conexión con el servidor. Verifica tu red o que el backend esté corriendo.";
    } else {
      switch (status) {
        case 400:
          userMessage = originalMessage || "Datos inválidos. Revisa el formulario.";
          break;
        case 401:
          userMessage = "Debes iniciar sesión para continuar.";
          localStorage.removeItem("neon_token");
          localStorage.removeItem("neon_user");
          window.location.href = "/login";
          break;
        case 403:
          userMessage = originalMessage || "No tienes permisos para realizar esta acción.";
          break;
        case 404:
          userMessage = "El recurso que buscas no existe.";
          break;
        case 422:
          userMessage = originalMessage || "Error de validación. Revisa los datos ingresados.";
          break;
        case 429:
          userMessage = originalMessage || "Demasiadas peticiones. Espera un momento e intenta de nuevo.";
          break;
        case 500:
          userMessage = originalMessage || "Error del servidor. Intenta más tarde.";
          break;
        default:
          userMessage = originalMessage || userMessage;
      }
    }

    const friendlyError = new Error(userMessage);
    friendlyError.technical = originalMessage;
    return Promise.reject(friendlyError);
  }
);

export default api;