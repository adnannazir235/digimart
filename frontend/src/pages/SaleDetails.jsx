import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatUsdPrice, getCurrencySymbol } from "../utils";

export default function SaleDetails() {
  const { orderUid } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await orderAPI.getSingle(orderUid); // same API usually
        setOrder(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load sale details");
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
          ← Back to Sales
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
    buyer,
  } = order;

  return (
    <div className="py-1">
      {/* Header */}
      <div className="d-flex flex-row justify-content-between mb-5">
        <div>
          <h2 className="mb-1">Sale #{displayedOrderUid.slice(-8)}</h2>
          <p className="text-muted mb-1">
            Sold on{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {buyer && (
            <p className="text-muted small mb-0">
              Buyer: {buyer.name || buyer.email || "—"}
            </p>
          )}
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <div className="row g-4 align-items-start">
        {/* Products sold */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 lh-lg">Sold Products ({productIds.length})</h5>
            </div>
            <div className="card-body p-0">
              {productIds.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No products in this sale.
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
                            {product.description || "No description"}
                          </p>
                          <div className="small text-muted">
                            File type: {product.mimeType || "Unknown"}
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="fw-semibold mb-2">
                            {getCurrencySymbol(currencyCode)}
                            {formatUsdPrice(product.price, { unit: "dollars" })}
                          </div>
                          {/* Optional seller earnings per item if you have fee info */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sale Summary Sidebar */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm sticky-top"
            style={{ top: "1rem" }}
          >
            <div className="card-header bg-light">
              <h5 className="mb-0">Sale Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Order ID</span>
                <strong>#{displayedOrderUid.slice(-8)}</strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Amount Paid</span>
                <strong>
                  {getCurrencySymbol(currencyCode)}
                  {formatUsdPrice(amount, { unit: "cents" })}
                </strong>
              </div>

              {/* Add if backend provides: 
              <div className="d-flex justify-content-between mb-2">
                <span>Your Earnings</span>
                <strong className="text-success">
                  {getCurrencySymbol(currencyCode)}
                  {formatUsdPrice(sellerEarnings || amount * 0.85, {
                    unit: "cents",
                  })}
                </strong>
              </div> */}

              <div className="d-flex justify-content-between mb-3">
                <span>Status</span>
                <span
                  className={`badge bg-${status === "completed" ? "success" : "warning"}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              <hr />

              <div className="small text-muted">
                <p className="mb-1">Sold on:</p>
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
