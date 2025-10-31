import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { useBuyerData } from "../hooks/useBuyerData";
import LoadingSpinner from "../components/LoadingSpinner";

export default function BuyerDashboard() {
  // const { data, loading, error } = useBuyerData();
  const { loading, error } = useBuyerData();
  const location = useLocation();

  // Handle success toast (in case of future navigation with success message)
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

  // Enable/Uncomment this block of code, if the orders are/will be coming from userBuyerData
  // if (!data?.orders) {
  //   return (
  //     <div className="container mt-5">
  //       <div className="alert alert-warning" role="alert">
  //         You haven't purchased anything yet.{" "}
  //         <a href="/" className="alert-link">
  //           Browse Products
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="container-fluid" style={{ minHeight: "81dvh" }}>
      <h3 className="pt-5 pb-4 text-center">Buyer Dashboard</h3>
      <div className="d-flex align-items-start h-100">
        <nav
          className="col-md-2 nav nav-pills p-3 border border-1"
          style={{ rowGap: "1.5rem" }}
        >
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
          <Outlet />
        </section>
      </div>
    </div>
  );
}
