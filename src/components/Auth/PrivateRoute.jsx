// src/components/Auth/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasRole, roleRedirect } from "../../utils/roleUtils";

export default function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!hasRole(user, allowed)) {
      return <Navigate to={roleRedirect(user.role)} replace />;
    }
  }

  return children;
}