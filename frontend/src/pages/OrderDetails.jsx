import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import BackButton from "../components/BackButton";
import LoadingButton from "../components/LoadingButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { orderAPI } from "../services/api";
import { formatUsdPrice, getCurrencySymbol } from "../utils";
import { getBadgeClasses, toastOptions } from "../../config/styles";

export default function OrderDetails() {
  const { orderUid } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingProducts, setDownloadingProducts] = useState({});

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

  const handleDownloadSingle = async (productId, productTitle) => {
    setDownloadingProducts((prev) => ({
      ...prev,
      [productId]: true,
    }));

    try {
      const response = await orderAPI.downloadProduct(orderUid, productId);
      const blob = response.data;

      let fileName = productTitle || "product-file";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download started!", toastOptions());
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to get download link",
        toastOptions(),
      );
    } finally {
      setDownloadingProducts((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <BackButton onClick={() => navigate(-1)}>Back to Orders</BackButton>
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
        <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      </div>

      {/* Main Content */}
      <div className="row g-4 align-items-start">
        {/* Products Section */}
        <div className="col-12 col-lg-8">
          <div className="card border shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 lh-lg">
                Products Purchased ({productIds.length})
              </h5>
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
                              File type:{" "}
                              {product.mimeType.split("/")[1].toUpperCase() ||
                                "Unknown"}
                            </span>
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="fw-semibold mb-2">
                            {getCurrencySymbol(currencyCode)}
                            {formatUsdPrice(product.price, { unit: "dollars" })}
                          </div>

                          {status === "completed" && (
                            <LoadingButton
                              loading={!!downloadingProducts[product._id]}
                              isDisabled={!!downloadingProducts[product._id]}
                              showText={false}
                              className="btn border rounded-0 d-flex align-items-center"
                              onClick={() =>
                                handleDownloadSingle(product._id, product.title)
                              }
                            >
                              <FaDownload size={18} />
                            </LoadingButton>
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
          <div className="card border shadow-sm">
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
