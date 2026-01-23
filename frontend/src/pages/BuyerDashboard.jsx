import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { useBuyerData } from "../hooks/useBuyerData";
import LoadingSpinner from "../components/LoadingSpinner";

export default function BuyerDashboard() {
  const { loading, error } = useBuyerData();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage, toastOptions);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  // RENDER ONLY OUTLET
  // The layout is now handled by DashboardLayout in App.jsx
  return <Outlet />;
}
