import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/" /> : <Outlet />;
};
