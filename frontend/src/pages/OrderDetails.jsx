import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatUsdPrice, getCurrencySymbol } from "../utils";
import { IoIosArrowBack } from "react-icons/io";
import { FaDownload } from "react-icons/fa";
import { getBadgeClasses } from "../../config/styles";

export default function OrderDetails() {
  const { orderUid } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await orderAPI.getSingle(orderUid);
        setOrder(res.data.data);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load order details",
        );
      } finally {
        setLoading(false);
      }
    }

    if (orderUid) fetchOrder();
  }, [orderUid]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-outline-secondary mt-3"
          onClick={() => navigate(-1)}
        >
          <button
          className="btn btn-outline-primary btn-sm p-2 d-flex align-items-center gap-2 border"
          onClick={() => navigate(-1)}
        >
          <IoIosArrowBack size={20} />
          <span className="fw-medium">Back to Orders</span>
        </button>
        </button>
      </div>
    );
  }

  if (!order) return null;

  const {
    productIds = [],
    amount,
    currencyCode,
    createdAt,
    status,
    orderUid: displayedOrderUid,
  } = order;

  return (
    <div className="py-1">
      {/* Header Section */}
      <div className="d-flex flex-row justify-content-between align-items-center mb-5">
        <div>
          <h2 className="mb-1">Order #{displayedOrderUid.slice(-8)}</h2>
          <p className="text-muted mb-0">
            Placed on{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <button
          className="btn btn-outline-primary btn-sm p-2 d-flex align-items-center gap-2 border"
          onClick={() => navigate(-1)}
        >
          <IoIosArrowBack size={20} />
          <span className="fw-medium">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="row g-4 align-items-start">
        {/* Products Section */}
        <div className="col-12 col-lg-8">
          <div className="card border shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 lh-lg">Purchased Products ({productIds.length})</h5>
              {productIds.length > 0 && status === "completed" && (
                <button className="btn border rounded-0 d-flex align-items-center gap-2">
                  <FaDownload size={18} />
                  (ZIP)
                </button>
              )}
            </div>
            <div className="card-body p-0">
              {productIds.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No products found in this order.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {productIds.map((product) => (
                    <div
                      key={product._id}
                      className="list-group-item px-4 py-3 border-bottom"
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{product.title}</h6>
                          <p className="text-muted mb-2 small">
                            {product.description || "No description provided."}
                          </p>
                          <div className="small text-muted">
                            <span>
                              File type: {product.mimeType || "Unknown"}
                            </span>
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="fw-semibold mb-2">
                            {getCurrencySymbol(currencyCode)}
                            {formatUsdPrice(product.price, { unit: "dollars" })}
                          </div>

                          {status === "completed" && (
                            <button
                              className="btn border rounded-0 d-flex align-items-center gap-2"
                              onClick={() =>
                                console.log("Download:", product._id)
                              }
                            >
                              <FaDownload size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-12 col-lg-4">
          <div
            className="card border shadow-sm sticky-top"
            style={{ top: "1rem" }}
          >
            <div className="card-header">
              <h5 className="mb-0 lh-lg">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Order ID</span>
                <strong>#{displayedOrderUid.slice(-8)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Paid</span>
                <strong className="fs-5">
                  {getCurrencySymbol(currencyCode)}
                  {formatUsdPrice(amount, { unit: "cents" })}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Status</span>
                <span className={getBadgeClasses(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <hr />
              <div className="small text-muted">
                <p className="mb-1">Ordered on:</p>
                <p className="mb-0">
                  {new Date(createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
