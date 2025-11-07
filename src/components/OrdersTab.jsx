import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { orderAPI, shopAPI } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../contexts/authContext";

export default function OrdersTab({ isBuyer = false }) {
  const { user } = useAuth();
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

  if (user && user.isSeller && !user.sellerOnboardingComplete) return <LoadingSpinner />;

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
        toast.error(msg, toastOptions);
      } finally {
        setLoading(false);
      }
    };

    // Skip if seller not onboarded and no context data
    if (user?.isSeller && !user.sellerOnboardingComplete && !contextShop && !contextSales) {
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
      toast.success("Download complete!", toastOptions);
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed", toastOptions);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const renderOrdersTable = (orders, title) => {
    if (orders.length === 0) {
      return (
        <div className="alert alert-info mt-3">
          No {title.toLowerCase()} found.
        </div>
      );
    }

    return (
      <div className="card mt-3">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>{title.includes("Sales") ? "Customer" : "Product"}</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>
                      {title.includes("Sales")
                        ? `${order.buyerId?.name || order.buyerId?.username || "—"}`
                        : order.productId?.title || "Unknown Product"}
                    </td>
                    <td>
                      ${(order.amount ? order.amount / 100 : order.total || 0).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => navigate(`/order/${order._id}`)}
                      >
                        View
                      </button>
                      {title.includes("Orders") && order.status === "completed" && (
                        <button
                          onClick={() => handleDownload(order._id)}
                          disabled={downloadingOrderId === order._id}
                          className={`btn btn-sm ${
                            downloadingOrderId === order._id
                              ? "btn-secondary cursor-not-allowed"
                              : "btn-primary"
                          }`}
                        >
                          {downloadingOrderId === order._id ? "Downloading..." : "Download"}
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

  if (loading) return <div><LoadingSpinner /></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  // Buyer: Only show "Orders"
  if (isBuyer || !user?.isSeller) {
    return (
      <div>
        <h3 className="mb-3">Orders ({buyerOrders.length})</h3>
        {renderOrdersTable(buyerOrders, "Orders")}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3">My Orders ({buyerOrders.length})</h3>
      {renderOrdersTable(buyerOrders, "Orders")}

      <h3 className="mb-3 mt-5 pt-4">My Sales ({sellerSales.length})</h3>
      {renderOrdersTable(sellerSales, "Sales")}
    </div>
  );
}