import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles.js";
import { useSellerData } from "../hooks/useSellerData";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function SellerDashboard() {
  const { data, setData, loading, error } = useSellerData();
  const location = useLocation();

  // Handle success toast from CreateShop navigation
  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage, toastOptions);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          You are not a seller.{" "}
          <a href="/buyer/create-shop" className="alert-link">
            Create a shop
          </a>{" "}
          to get started.
        </div>
      </div>
    );

  return (
    <div className="container-fluid" style={{ minHeight: "81dvh" }}>
      <h3 className="py-3 text-center">Seller Dashboard</h3>
      <div className="d-flex align-items-start h-100">
        <nav
          className="col-md-2 nav nav-pills p-3 border border-1"
          style={{ rowGap: "1.5rem" }}
        >
          <NavLink
            to="products"
            className={({ isActive }) =>
              `nav-link w-100 ${isActive ? "active" : ""}`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="orders"
            className={({ isActive }) =>
              `nav-link w-100 ${isActive ? "active" : ""}`
            }
          >
            Orders
          </NavLink>
        </nav>
        <section className="col-md-10 p-4 border border-1">
          <Outlet
            context={{
              products: data.products || [], // Fallback to empty array
              orders: data.orders || [], // Fallback to empty array
              setData,
            }}
          />
        </section>
      </div>
    </div>
  );
}
