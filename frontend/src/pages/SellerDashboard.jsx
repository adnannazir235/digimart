import { useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { useSellerData } from "../hooks/useSellerData";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StripeConnectModal from "../components/StripeConnectModal.jsx";

export default function SellerDashboard() {
  const { shop, setShop, sales, loading, error } = useSellerData();
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);

  // Show Stripe modal on load if not onboarded
  useEffect(() => {
    if (!loading && user?.isSeller && !user.sellerOnboardingComplete && shop) {
      setShowStripeModal(true);
    }
  }, [loading, user, shop]);

  // Redirect logic for root path
  useEffect(() => {
    if (loading || !user || !shop) return;

    const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase();
    const isRoot = normalizedPath === "/seller/dashboard";

    if (isRoot) {
      setIsRedirecting(true);
      navigate("/seller/dashboard/products", { replace: true });
      const timeout = setTimeout(() => setIsRedirecting(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [loading, user, shop, location.pathname, navigate]);

  // Render checks
  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  if (!shop)
    return (
      <Navigate
        to="/buyer/create-shop"
        state={{
          successMessage:
            "Please create a shop to access the seller dashboard.",
        }}
        replace
      />
    );

  // Immediate redirect for root path (failsafe)
  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase();
  const isRoot = normalizedPath === "/seller/dashboard";

  if (isRoot) {
    return isRedirecting ? (
      <LoadingSpinner />
    ) : (
      <Navigate to="/seller/dashboard/products" replace />
    );
  }

  // RENDER ONLY OUTLET + MODAL
  // The layout is now handled by DashboardLayout in App.jsx
  return (
    <>
      <Outlet context={{ shop, setShop, sales }} />
      <StripeConnectModal
        isOpen={showStripeModal}
        onCancel={() => setShowStripeModal(false)}
      />
    </>
  );
}
