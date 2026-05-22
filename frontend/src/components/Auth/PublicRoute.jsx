import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ✅ BUG-02 FIX: redirección según rol, incluyendo "dj" y "empleado"
export default function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    const dest =
      user.role === "admin"    ? "/admin"    :
      user.role === "dj"       ? "/dj"       :
      user.role === "empleado" ? "/empleado" :
      "/dashboard";
    return <Navigate to={dest} replace />;
  }

  return children;
}
