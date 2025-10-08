import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export const RoleBasedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <Outlet />;
};
