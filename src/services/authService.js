// src/services/authService.js

// Credenciales de prueba locales
const TEST_USERS = {
  'admin@club.com': { password: 'admin123', role: 1, name: 'Admin' },
  'user@club.com': { password: 'user123', role: 3, name: 'Usuario' },
  'dj@club.com': { password: 'dj123', role: 4, name: 'DJ' },
  'empleado@club.com': { password: 'empleado123', role: 2, name: 'Empleado' },
};

// ── Almacenar usuario en localStorage ──────────────────────────────────────
const storeUserData = (token, role, userData = null) => {
  if (token) localStorage.setItem('token', token);
  
  const user = userData || {
    role: role,
    name: null,
    email: null
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

// ── Obtener usuario almacenado ──────────────────────────────────────────────
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('neon_user') || localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      const parsed = JSON.parse(userStr);
      if (parsed && parsed.role) return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

// ── LOGIN (solo local) ──────────────────────────────────────────────────────
export const loginRequest = async ({ email, password }) => {
  // Buscar usuario en credenciales locales
  const testUser = TEST_USERS[email];
  if (testUser && testUser.password === password) {
    const userData = {
      id: Date.now(),
      name: testUser.name,
      email: email,
      role: testUser.role,
    };
    const token = 'fake-jwt-token-' + Date.now();
    storeUserData(token, testUser.role, userData);
    return {
      success: true,
      token: token,
      user: userData,
      role: testUser.role,
    };
  }
  
  // Si no coincide, error
  throw new Error('Credenciales inválidas. Prueba con: admin@club.com / admin123');
};

// ── REGISTER (local) ──────────────────────────────────────────────────────
export const registerRequest = async ({ docId, name, email, phone, password }) => {
  // Simular registro local
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    role: 3, // usuario por defecto
  };
  const token = 'fake-jwt-token-' + Date.now();
  storeUserData(token, 3, newUser);
  return {
    success: true,
    token: token,
    user: newUser,
    role: 3,
  };
};

// ── LOGOUT ──────────────────────────────────────────────────────────────────
export const logoutRequest = async () => {
  clearUserData();
  return { success: true };
};

// ── GOOGLE LOGIN ──────────────────────────────────────────────────────────
export const googleLoginRequest = async (idToken) => {
  // Simular login con Google
  const userData = {
    id: Date.now(),
    name: 'Usuario Google',
    email: 'google@user.com',
    role: 3,
  };
  const token = 'fake-google-token-' + Date.now();
  storeUserData(token, 3, userData);
  return {
    success: true,
    token: token,
    user: userData,
    role: 3,
  };
};

// ── FORGOT PASSWORD ──────────────────────────────────────────────────────
export const forgotPasswordRequest = async (correo_usu) => {
  return { success: true, message: 'Correo enviado' };
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────
export const resetPasswordRequest = async (token, nuevaPassword) => {
  return { success: true, message: 'Contraseña restablecida' };
}; 