import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export const RoleBasedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Show a loading state
  }

  if (!user) {
    return <Navigate to="/login" />; // Redirect unauthenticated users
  }

  // Check if the user's role is included in the allowed roles
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect if not authorized
  }

  return <Outlet />;
};
