import { Navigate, useLocation } from "react-router-dom";
import { useAuth, roleRedirect } from "../../context/AuthContext";

/**
 * PrivateRoute
 * - Redirects to /login if not authenticated
 * - role can be a string or array of strings
 * - Redirects to the correct portal for the user's role if they hit a wrong route
 */
export default function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      // Redirigir al portal correcto según el rol actual (no siempre /dashboard)
      return <Navigate to={roleRedirect(user.role)} replace />;
    }
  }

  return children;
}
