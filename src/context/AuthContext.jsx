// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  googleLoginRequest,
  getStoredUser,
} from "../services/authService";
import api from "../services/api";
import { getRoleName } from "../utils/roleUtils"; // lo crearemos después

const AuthContext = createContext(null);

export const roleRedirect = (role) => {
  switch (role) {
    case "admin":      return "/admin";
    case "dj":         return "/dj";
    case "empleado":   return "/empleado";
    case "inventario": return "/empleado";
    default:           return "/dashboard";
  }
};

function InitSpinner() {
  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid #c084fc", borderTopColor: "transparent",
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(() => {
    const stored = getStoredUser();
    if (stored) {
      // Normalizar rol si es número
      const roleName = typeof stored.role === 'number' ? getRoleName(stored.role) : stored.role;
      if (roleName) stored.role = roleName;
    }
    return stored;
  });
  const [authError,    setAuthError]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [initializing, setInitializing] = useState(() => !!getStoredUser());

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      setInitializing(false);
      return;
    }
    setInitializing(false);

    // Verificar que la cookie del servidor sigue siendo válida
    // api.get("/auth/me")
    //   .then(({ data }) => {
    //     if (data.success) {
    //       const userData = data.user;
    //       // Normalizar rol a nombre
    //       const roleName = typeof userData.role === 'number' ? getRoleName(userData.role) : userData.role;
    //       if (roleName) userData.role = roleName;
    //       localStorage.setItem("neon_user", JSON.stringify(userData));
    //       setUser(userData);
    //     }
    //   })
    //   .catch(() => {
    //     localStorage.removeItem("neon_user");
    //     setUser(null);
    //   })
    //   .finally(() => {
    //     setInitializing(false);
    //   });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await loginRequest({ email, password });
      if (result.success) {
        // Normalizar rol a nombre
        const roleName = typeof result.role === 'number' ? getRoleName(result.role) : result.role;
        const userData = {
          ...result.user,
          role: roleName,
        };
        setUser(userData);
        localStorage.setItem("neon_user", JSON.stringify(userData));
        return { success: true, role: roleName };
      }
      return { success: false, error: "Error desconocido" };
    } catch (err) {
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
    } finally {
      setUser(null);
      setLoading(false);
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

  if (initializing) return <InitSpinner />;

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