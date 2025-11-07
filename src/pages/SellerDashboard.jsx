import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import { useSellerData } from "../hooks/useSellerData";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StripeConnectModal from "../components/StripeConnectModal.jsx";

export default function SellerDashboard() {
  const { shop, setShop, sales, loading, error } = useSellerData();
  const { user } = useAuth();
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
      // Reset isRedirecting after navigation to prevent stale state
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

  // Immediate redirect for root path
  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase();
  const isRoot = normalizedPath === "/seller/dashboard";

  if (isRoot) {
    return isRedirecting ? (
      <LoadingSpinner />
    ) : (
      <Navigate to="/seller/dashboard/products" replace />
    );
  }

  return (
    <>
      <div className="container-fluid" style={{ minHeight: "81dvh" }}>
        <h3 className="pt-5 pb-4 text-center">Seller Dashboard</h3>
        <div className="d-flex align-items-start h-100">
          <nav
            className="col-md-2 nav nav-pills p-3 border border-1"
            style={{ rowGap: "1rem" }}
          >
            <NavLink
              to="products"
              className={({ isActive }) =>
                `nav-link w-100 ${isActive ? "active" : ""}`
              }
            >
              Products
            </NavLink>
            {user.isSeller && user.sellerOnboardingComplete && (
              <NavLink
                to="orders-and-sales"
                className={({ isActive }) =>
                  `nav-link w-100 ${isActive ? "active" : ""}`
                }
              >
                Orders & Sales
              </NavLink>
            )}
            <NavLink
              to="shop"
              className={({ isActive }) =>
                `nav-link w-100 ${isActive ? "active" : ""}`
              }
            >
              Shop
            </NavLink>
          </nav>

          <section className="col-md-10 p-4 border border-1">
            <Outlet context={{ shop, setShop, sales }} />
          </section>
        </div>
      </div>
      <StripeConnectModal
        isOpen={showStripeModal}
        onCancel={() => setShowStripeModal(false)}
      />
    </>
  );
}
