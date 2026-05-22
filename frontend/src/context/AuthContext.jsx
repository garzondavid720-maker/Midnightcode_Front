/**
 * src/context/AuthContext.jsx
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  googleLoginRequest,
  getStoredUser,
} from "../services/authService";
import api from "../services/api";

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

// Spinner de carga mientras se valida el rol desde el backend
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
  const [user,         setUser]         = useState(() => getStoredUser());
  const [authError,    setAuthError]    = useState(null);
  const [loading,      setLoading]      = useState(false);

  // initializing = true mientras verificamos el rol actual en el backend.
  // Bloqueamos el render de rutas hasta saberlo, para que PrivateRoute
  // nunca vea un rol desactualizado del localStorage.
  const [initializing, setInitializing] = useState(() => {
    return !!(localStorage.getItem("neon_token") && getStoredUser());
  });

  useEffect(() => {
    const token   = localStorage.getItem("neon_token");
    const stored  = getStoredUser();
    if (!token || !stored) {
      setInitializing(false);
      return;
    }

    api.get("/auth/me")
      .then(({ data }) => {
        if (data.success) {
          localStorage.setItem("neon_user", JSON.stringify(data.user));
          setUser(data.user);
        }
      })
      .catch(() => {
        // Token expirado o inválido → limpiar sesión
        localStorage.removeItem("neon_token");
        localStorage.removeItem("neon_user");
        setUser(null);
      })
      .finally(() => {
        setInitializing(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthError(null);
    setLoading(true);
    try {
      const { user: apiUser } = await loginRequest({ email, password });
      setUser(apiUser);
      return { success: true, role: apiUser.role };
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
      const { user: apiUser } = await registerRequest({ docId, name, email, phone, password });
      setUser(apiUser);
      return { success: true, role: apiUser.role };
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
      const { user: apiUser } = await googleLoginRequest(idToken);
      setUser(apiUser);
      return { success: true, role: apiUser.role };
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

  // Bloquear render hasta que sepamos el rol real desde el backend
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
