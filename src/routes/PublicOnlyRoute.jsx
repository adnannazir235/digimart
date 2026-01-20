import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export const PublicOnlyRoute = () => {
  const { user, loading } = useSelector(state => state.auth);
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/" /> : <Outlet />;
};
