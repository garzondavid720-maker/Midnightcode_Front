// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  googleLoginRequest,
  getStoredUser,
} from "../services/authService";
import { getRoleName } from "../utils/roleUtils";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStoredUser();
    if (stored) {
      const roleName = typeof stored.role === 'number' ? getRoleName(stored.role) : stored.role;
      if (roleName) stored.role = roleName;
    }
    return stored;
  });
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(() => !!getStoredUser());

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      setInitializing(false);
      return;
    }
    setInitializing(false);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await loginRequest({ email, password });
      if (result.success) {
        const roleName = typeof result.role === 'number' ? getRoleName(result.role) : result.role;
        const userData = {
          ...result.user,
          role: roleName,
        };
        setUser(userData);
        localStorage.setItem("neon_user", JSON.stringify(userData));
        if (result.token) {
          localStorage.setItem("neon_token", result.token);
        }
        return { success: true, role: roleName };
      }
      return { success: false, error: "Error desconocido" };
    } catch (err) {
      // Si el backend falla, probar con credenciales locales (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        const TEST_USERS = {
          'admin@club.com': { password: 'admin123', role: 1, name: 'Admin' },
          'user@club.com': { password: 'user123', role: 3, name: 'Usuario' },
          'dj@club.com': { password: 'dj1234', role: 4, name: 'DJ' }, // <-- contraseña corregida
          'empleado@club.com': { password: 'empleado123', role: 2, name: 'Empleado' },
        };
        const testUser = TEST_USERS[email];
        if (testUser && testUser.password === password) {
          const roleName = getRoleName(testUser.role);
          const userData = {
            id: Date.now(),
            name: testUser.name,
            email,
            role: roleName,
          };
          setUser(userData);
          localStorage.setItem("neon_user", JSON.stringify(userData));
          localStorage.setItem("neon_token", "fake-token");
          return { success: true, role: roleName };
        }
      }
      const msg = err.message || "Error al iniciar sesión";
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ docId, name, email, phone, password }) => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await registerRequest({ docId, name, email, phone, password });
      if (result.success) {
        const roleName = typeof result.role === 'number' ? getRoleName(result.role) : result.role;
        const userData = {
          ...result.user,
          role: roleName,
        };
        setUser(userData);
        localStorage.setItem("neon_user", JSON.stringify(userData));
        if (result.token) {
          localStorage.setItem("neon_token", result.token);
        }
        return { success: true, role: roleName };
      }
      return { success: false, error: "Error desconocido" };
    } catch (err) {
      const msg = err.message || "Error al registrar la cuenta";
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await googleLoginRequest(idToken);
      if (result.success) {
        const roleName = typeof result.role === 'number' ? getRoleName(result.role) : result.role;
        const userData = {
          ...result.user,
          role: roleName,
        };
        setUser(userData);
        localStorage.setItem("neon_user", JSON.stringify(userData));
        if (result.token) {
          localStorage.setItem("neon_token", result.token);
        }
        return { success: true, role: roleName };
      }
      return { success: false, error: "Error desconocido" };
    } catch (err) {
      const msg = err.message || "Error al iniciar sesión con Google";
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutRequest();
    } catch (err) {
      console.warn("Error en logout:", err.message);
    } finally {
      setUser(null);
      setLoading(false);
      localStorage.removeItem("neon_user");
      localStorage.removeItem("neon_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("neon_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  if (initializing) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #c084fc", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, authError, loading, login, register, googleLogin, logout, updateUser, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}