// src/components/PublicOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  // Wait until the user status is loaded
  if (loading) {
    return <LoadingSpinner />; // Or a spinner
  }

  return user ? <Navigate to="/" /> : <Outlet />;
};
