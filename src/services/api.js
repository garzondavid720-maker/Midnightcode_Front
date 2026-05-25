import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Envía cookies httpOnly automáticamente
});

// Request interceptor: no necesita añadir token (la cookie va sola)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor: manejo de errores + redirección a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // Log técnico
    console.group(`Error ${status || "NETWORK"} en ${method} ${url}`);
    console.error("Detalle técnico:", originalMessage);
    if (error.response) {
      console.error("Respuesta del servidor:", error.response.data);
    }
    console.groupEnd();

    let userMessage = "Ocurrió un error inesperado. Intenta de nuevo.";

    if (!error.response) {
      userMessage = "No hay conexión con el servidor. Verifica tu red o que el backend esté corriendo.";
    } else {
      switch (status) {
        case 400:
          userMessage = originalMessage || "Datos inválidos. Revisa el formulario.";
          break;
        case 401:
          userMessage = "Tu sesión expiró. Inicia sesión nuevamente.";
          // Limpiar solo el usuario local (la cookie se limpia en el backend)
          localStorage.removeItem("neon_user");
          // Redirigir solo si no está ya en login
          if (!/^\/(login|register|forgot-password)(\/|$)/.test(window.location.pathname)) {
            window.location.href = "/login";
          }
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
          userMessage = originalMessage || "Demasiadas peticiones. Espera un momento.";
          break;
        case 500:
          userMessage = "Error del servidor. Intenta más tarde.";
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