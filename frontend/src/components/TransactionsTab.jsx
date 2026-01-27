import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getBadgeClasses, toastOptions } from "../../config/styles";
import { orderAPI, shopAPI } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

export default function TransactionsTab({ isBuyer = false }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const context = useOutletContext();
  const contextShop = context?.shop;
  const contextSales = context?.sales;

  // === ONBOARDING REDIRECT FOR SELLERS ===
  useEffect(() => {
    if (user && user.isSeller && !user.sellerOnboardingComplete) {
      const timer = setTimeout(() => {
        navigate("/seller/dashboard/shop", {
          replace: true,
          state: { from: location },
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, navigate, location]);

  if (user && user.isSeller && !user.sellerOnboardingComplete)
    return <LoadingSpinner />;

  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerSales, setSellerSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Always fetch buyer's orders (even sellers can buy)
        const buyerRes = await orderAPI.getMyOrders();
        setBuyerOrders(buyerRes.data.data || []);

        // Only fetch sales if user is seller
        if (user?.isSeller) {
          if (contextSales && Array.isArray(contextSales)) {
            setSellerSales(contextSales);
          } else {
            const salesRes = await shopAPI.getMySales();
            setSellerSales(salesRes.data.data || []);
          }
        } else {
          setSellerSales([]);
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load data";
        setError(msg);
        toast.error(msg, toastOptions());
      } finally {
        setLoading(false);
      }
    };

    // Skip if seller not onboarded and no context data
    if (
      user?.isSeller &&
      !user.sellerOnboardingComplete &&
      !contextShop &&
      !contextSales
    ) {
      return;
    }

    fetchData();
  }, [user, contextShop, contextSales]);

  const handleDownload = async (orderId) => {
    if (downloadingOrderId) return;
    setDownloadingOrderId(orderId);
    try {
      const response = await orderAPI.downloadProduct(orderId);
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/zip",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${orderId}-files.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download complete!", toastOptions());
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed", toastOptions());
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const renderTransactionsTable = (ordersOrSales, title) => {
    if (ordersOrSales.length === 0) {
      return (
        <div className="text-center py-5 rounded-3 border border-light-subtle mt-3">
          <div className="text-muted mb-3">
            <i className="bi bi-inbox fs-1 text-secondary opacity-50"></i>
          </div>
          <p className="fw-bold text-secondary">No {title.toLowerCase()} yet</p>
          {title === "Orders" && (
            <Link to="/products" className="btn btn-sm btn-outline-primary rounded-pill px-3">
              Browse Products
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="card border shadow-sm rounded mt-3 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.95rem' }}>
              <thead>
                <tr>
                  <th className="ps-4 text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Order ID
                  </th>
                  <th className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Total
                  </th>
                  <th className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                  <th className="pe-4 text-end text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {ordersOrSales.map((orderOrSale) => (
                  <tr key={orderOrSale.orderUid}>
                    <td className="ps-4">{orderOrSale.orderUid}</td>

                    <td className="text-secondary">
                      $                       {(
                        (orderOrSale.amount ? orderOrSale.amount / 100 : orderOrSale.total || 0)
                      ).toFixed(2)}
                    </td>

                    <td>
                      <span className={getBadgeClasses(orderOrSale.status)}>
                        {orderOrSale.status.charAt(0).toUpperCase() + orderOrSale.status.slice(1)}
                      </span>
                    </td>

                    <td className="pe-4 text-end">
                      <button
                        className="btn btn-sm btn-outline-primary fw-medium px-3"
                        onClick={() => {
                          const base = user.isSeller
                            ? `/seller/dashboard/orders-and-sales/${title === "Orders" ? "orders/" : "sales/"}`
                            : "/buyer/dashboard/orders/";
                          navigate(base + orderOrSale.orderUid);
                        }}
                      >
                        View
                      </button>
                      {title.includes("Orders") && orderOrSale.status === "completed" && (
                        <button
                          onClick={() => handleDownload(orderOrSale.orderUid)}
                          disabled={downloadingOrderId === orderOrSale.orderUid}
                          className={`btn btn-sm ms-2 px-3 fw-medium ${
                            downloadingOrderId === orderOrSale.orderUid
                              ? "btn-secondary"
                              : "btn-primary"
                          }`}
                        >
                          {downloadingOrderId === orderOrSale.orderUid ? "Downloading..." : "Download"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger rounded-3 border-0 shadow-sm">{error}</div>;

  // Buyer: Only show "Orders"
  if (isBuyer || !user?.isSeller) {
    return (
      <div>
        <h3 className="fw-bold mb-4">Orders{" "}
          <span className="text-muted fw-normal">({buyerOrders.length})</span></h3>
        {renderTransactionsTable(buyerOrders, "Orders")}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="pb-5">
        <h3 className="fw-bold">My Orders{" "}
          <span className="text-muted fw-normal">({buyerOrders.length})</span></h3>
        {renderTransactionsTable(buyerOrders, "Orders")}
      </div>

      <div className="pt-5 mt-5">
        <h3 className="fw-bold">My Sales{" "}
          <span className="text-muted fw-normal">({sellerSales.length})</span></h3>
        {renderTransactionsTable(sellerSales, "Sales")}
      </div>
    </div>
  );
}
