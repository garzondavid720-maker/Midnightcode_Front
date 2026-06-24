// src/components/Auth/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roleRedirect } from "../../utils/roleUtils";

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    const dest = roleRedirect(user.role);
    return <Navigate to={dest} replace />;
  }

  return children;
}