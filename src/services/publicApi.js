// src/services/publicApi.js
// Instancia de Axios SIN interceptor de token — para rutas públicas:
// login, register, forgot-password, reset-password
import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor: mensajes amigables sin redirigir al login
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;

    let userMessage = "Ocurrió un error inesperado. Intenta de nuevo.";

    if (!error.response) {
      userMessage =
        "No hay conexión con el servidor. Verifica tu red o que el backend esté corriendo.";
    } else {
      switch (status) {
        case 400:
          userMessage = originalMessage || "Datos inválidos. Revisa el formulario.";
          break;
        case 401:
          userMessage = originalMessage || "Credenciales incorrectas.";
          break;
        case 403:
          userMessage = originalMessage || "Acceso denegado.";
          break;
        case 404:
          userMessage = "Recurso no encontrado.";
          break;
        case 422:
          userMessage = originalMessage || "Error de validación.";
          break;
        case 429:
          userMessage = originalMessage || "Demasiados intentos. Espera un momento e intenta de nuevo.";
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

export default publicApi;
