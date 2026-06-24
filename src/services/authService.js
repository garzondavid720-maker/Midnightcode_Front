// src/services/authService.js
import publicApi from "./publicApi";
import api from "./api";

// ── Almacenar usuario en localStorage ──────────────────────────────────────
const storeUserData = (token, rol, userData = null) => {
  if (token) localStorage.setItem('token', token);
  
  // Construir objeto de usuario basado en la respuesta del backend
  const user = userData || {
    role: rol,
    doc_identidad: null,
    nombre_usu: null,
    correo_usu: null
  };
  
  localStorage.setItem('neon_user', JSON.stringify(user));
  localStorage.setItem('user', JSON.stringify(user));
};

// ── Limpiar datos del usuario ──────────────────────────────────────────────
const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('neon_user');
  localStorage.removeItem('user');
};

// ── Obtener usuario almacenado (usado en AuthContext) ────────────────────
export const getStoredUser = () => {
  try {
    // Intentar obtener de neon_user primero
    const neonUser = localStorage.getItem('neon_user');
    if (neonUser && neonUser !== 'undefined') {
      const parsed = JSON.parse(neonUser);
      if (parsed && parsed.role) return parsed;
    }
    
    // Fallback a user
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      const parsed = JSON.parse(userStr);
      if (parsed && parsed.role) return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener usuario almacenado:', error);
    return null;
  }
};

// ── LOGIN ──────────────────────────────────────────────────────────────────
export const loginRequest = async (credentials) => {
  try {
    // El backend espera { correo, password }
    const response = await publicApi.post("/auth/login", {
      correo: credentials.email,
      password: credentials.password
    });
    
    const data = response.data;
    // Respuesta esperada: { success: true, token, rol }
    
    if (!data.success || !data.token) {
      throw new Error(data.message || "Error en el login");
    }
    
    // Guardar token y rol
    storeUserData(data.token, data.rol);
    
    // Devolver en el formato que espera AuthContext
    return { 
      success: true, 
      user: {
        role: data.rol,  // El contexto normalizará a nombre
        doc_identidad: null,
        nombre_usu: null,
        correo_usu: credentials.email
      },
      token: data.token,
      role: data.rol
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Error en login";
    throw new Error(errorMessage);
  }
};

// ── REGISTER ────────────────────────────────────────────────────────────────
export const registerRequest = async ({ docId, name, email, phone, password }) => {
  try {
    const response = await publicApi.post("/usuario/register", {
      doc_identidad: docId,
      nombre_usu: name,
      telefono_usu: phone,
      correo_usu: email,
      password_usu: password
    });
    
    const data = response.data;
    
    // Después del registro, hacer login automático
    const loginResponse = await loginRequest({ email, password });
    
    return loginResponse;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Error en registro";
    throw new Error(errorMessage);
  }
};

// ── LOGOUT ──────────────────────────────────────────────────────────────────
export const logoutRequest = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.post("/auth/logout");
      } catch (err) {
        console.warn("Error en logout del backend:", err.message);
      }
    }
  } finally {
    clearUserData();
  }
};

// ── GOOGLE LOGIN ──────────────────────────────────────────────────────────
export const googleLoginRequest = async (idToken) => {
  try {
    const response = await publicApi.post("/auth/google", { idToken });
    const data = response.data;
    if (!data.success || !data.token) {
      throw new Error(data.message || "Error en login con Google");
    }
    storeUserData(data.token, data.rol);
    return {
      success: true,
      user: {
        role: data.rol,
        doc_identidad: null,
        nombre_usu: data.nombre || null,
        correo_usu: data.email || null
      },
      token: data.token,
      role: data.rol
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Error en login con Google";
    throw new Error(errorMessage);
  }
};

// ── FORGOT PASSWORD ──────────────────────────────────────────────────────
export const forgotPasswordRequest = async (correo_usu) => {
  try {
    const response = await publicApi.post("/auth/forgot-password", { correo_usu });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Error al enviar correo";
    throw new Error(errorMessage);
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────
export const resetPasswordRequest = async (token, nuevaPassword) => {
  try {
    const response = await publicApi.post("/auth/reset-password", { token, nuevaPassword });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Error al restablecer contraseña";
    throw new Error(errorMessage);
  }
};

// ── Exportar también como objeto para mantener compatibilidad ──────────
export const authService = {
  login: loginRequest,
  register: registerRequest,
  logout: logoutRequest,
  googleLogin: googleLoginRequest,
  forgotPassword: forgotPasswordRequest,
  resetPassword: resetPasswordRequest,
  getStoredUser: getStoredUser,
};

export default authService;