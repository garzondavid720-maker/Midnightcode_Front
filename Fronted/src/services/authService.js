// src/services/authService.js
import publicApi from "./publicApi";
import api from "./api";

// ─── getStoredUser ────────────────────────────────────────────────────────────
// Lee el usuario almacenado en localStorage al iniciar la app.
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("neon_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── loginRequest ─────────────────────────────────────────────────────────────
// POST /auth/login → guarda token + user en localStorage → devuelve { user }
export const loginRequest = async ({ email, password }) => {
  const response = await publicApi.post("/auth/login", { email, password });
  const { token, user } = response.data;
  localStorage.setItem("neon_token", token);
  localStorage.setItem("neon_user", JSON.stringify(user));
  return { user };
};

// ─── registerRequest ──────────────────────────────────────────────────────────
// POST /auth/register → guarda token + user en localStorage → devuelve { user }
export const registerRequest = async ({ docId, name, email, phone, password }) => {
  const response = await publicApi.post("/auth/register", {
    docId,
    name,
    email,
    phone: phone || undefined,
    password,
  });
  const { token, user } = response.data;
  localStorage.setItem("neon_token", token);
  localStorage.setItem("neon_user", JSON.stringify(user));
  return { user };
};

// ─── logoutRequest ────────────────────────────────────────────────────────────
// POST /auth/logout (con token) → limpia localStorage
export const logoutRequest = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Si el token ya expiró o hay error de red, igual limpiamos localmente
  } finally {
    localStorage.removeItem("neon_token");
    localStorage.removeItem("neon_user");
  }
};

// ─── googleLoginRequest ───────────────────────────────────────────────────────
// POST /auth/google → guarda token + user en localStorage → devuelve { user }
export const googleLoginRequest = async (idToken) => {
  const response = await publicApi.post("/auth/google", { idToken });
  const { token, user } = response.data;
  localStorage.setItem("neon_token", token);
  localStorage.setItem("neon_user", JSON.stringify(user));
  return { user };
};

// ─── authService (objeto para forgot/reset password) ─────────────────────────
export const authService = {
  forgotPassword: async (email) => {
    const response = await publicApi.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  resetPassword: async (token, nuevaPassword) => {
    const response = await publicApi.post("/auth/reset-password", {
      token,
      nuevaPassword,
    });
    return response.data;
  },
};
