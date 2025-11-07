import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { orderAPI } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../contexts/authContext";

export default function OrdersTab({ isBuyer = false }) {
  const { user } = useAuth();
  let { shop } = user.isSeller === true ? useOutletContext() : {};
  const navigate = useNavigate();
  const location = useLocation();

  // === EARLY REDIRECT WITH SPINNER ===
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

  // Show spinner immediately if not onboarded (for sellers)
  if (user && user.isSeller && !user.sellerOnboardingComplete) {
    return <LoadingSpinner />;
  }

  // === REST OF COMPONENT ===
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getMyOrders();
        setOrders(res.data.data || []);
      } catch (err) {
        setError("Failed to load orders");
        toast.error("Failed to load orders", toastOptions);
      } finally {
        setLoading(false);
      }
    };

    // Skip fetch only for sellers if no shop or not onboarded
    if (!isBuyer && (!shop || !user?.sellerOnboardingComplete)) return;

    fetchOrders();
  }, [isBuyer, shop, user?.sellerOnboardingComplete]);

  const handleDownload = async (orderId) => {
    if (downloadingOrderId) return;
    setDownloadingOrderId(orderId);
    try {
      const response = await orderAPI.downloadProduct(orderId);
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${orderId}-files.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Files downloaded successfully!", toastOptions);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to download files";
      toast.error(message, toastOptions);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  if (loading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h3 className="mb-3">Orders ({orders.length})</h3>
      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found.</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>{isBuyer ? "Product" : "Customer"}</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        {isBuyer
                          ? order.product?.title || "Unknown"
                          : order.customerName || "Unknown"}
                      </td>
                      <td>${(order.total || 0).toFixed(2)}</td>
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
                          onClick={() => navigate(`/order/${order.id}`)}
                        >
                          View
                        </button>
                        {isBuyer && order.status === "completed" && (
                          <button
                            onClick={() => handleDownload(order.id)}
                            disabled={downloadingOrderId === order.id}
                            className={`btn btn-sm ${
                              downloadingOrderId === order.id
                                ? "btn-secondary cursor-not-allowed"
                                : "btn-primary"
                            }`}
                          >
                            {downloadingOrderId === order.id
                              ? "Downloading..."
                              : "Download"}
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
      )}
    </div>
  );
}
