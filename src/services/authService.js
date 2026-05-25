import publicApi from "./publicApi";
import api from "./api";

// ─── getStoredUser ────────────────────────────────────────────────────────────
// Lee el usuario almacenado en localStorage al iniciar la app.
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("neon_user");
    return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── loginRequest ─────────────────────────────────────────────────────────────
// POST /auth/login → servidor envía token como httpOnly cookie → guarda user en localStorage
export const loginRequest = async ({ email, password }) => {
  const response = await publicApi.post("/auth/login", { correo: email, password });
  const { user, rol, token } = response.data;
  
  // Guardar usuario en localStorage (el token está en cookie httpOnly)
  const userData = user || {
    role: rol,
    doc_identidad: null,
    nombre_usu: null,
    correo_usu: email
  };
  
  localStorage.setItem("neon_user", JSON.stringify(userData));
  
  return { 
    success: true,
    user: userData,
    role: rol || userData.role
  };
};

// ─── registerRequest ──────────────────────────────────────────────────────────
export const registerRequest = async ({ docId, name, email, phone, password }) => {
  const response = await publicApi.post("/usuario/register", {
    doc_identidad: docId,
    nombre_usu: name,
    telefono_usu: phone,
    correo_usu: email,
    password_usu: password
  });
  
  // Después del registro, hacer login automático
  return await loginRequest({ email, password });
};

// ─── logoutRequest ────────────────────────────────────────────────────────────
export const logoutRequest = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.warn("Error en logout del backend:", error.message);
  } finally {
    localStorage.removeItem("neon_user");
  }
};

// ─── googleLoginRequest ───────────────────────────────────────────────────────
export const googleLoginRequest = async (idToken) => {
  const response = await publicApi.post("/auth/google", { idToken });
  const { user } = response.data;
  localStorage.setItem("neon_user", JSON.stringify(user));
  return { user };
};

// ─── forgotPasswordRequest ────────────────────────────────────────────────────
export const forgotPasswordRequest = async (email) => {
  const response = await publicApi.post("/auth/forgot-password", { correo_usu: email });
  return response.data;
};

// ─── resetPasswordRequest ─────────────────────────────────────────────────────
export const resetPasswordRequest = async (token, nuevaPassword) => {
  const response = await publicApi.post("/auth/reset-password", { token, nuevaPassword });
  return response.data;
};

// ─── authService (objeto para exportación alternativa) ────────────────────────
export const authService = {
  login: loginRequest,
  register: registerRequest,
  logout: logoutRequest,
  forgotPassword: forgotPasswordRequest,
  resetPassword: resetPasswordRequest,
  googleLogin: googleLoginRequest,
  getStoredUser: getStoredUser,
};

export default authService;