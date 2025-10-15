import { useState } from "react";
import { useBuyerData } from "../hooks/useBuyerData";
import { orderAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";

export default function BuyerDashboard() {
  const { data, loading, error } = useBuyerData();
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  const handleDownload = async (orderId) => {
    if (downloadingOrderId) return; // Prevent concurrent downloads

    setDownloadingOrderId(orderId);
    try {
      const response = await orderAPI.downloadProduct(orderId);

      // Create download link
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${orderId}-files.zip`; // Customize filename as needed
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Files downloaded successfully!", toastOptions);
    } catch (err) {
      console.error("Download failed:", err);
      const message = err.response?.data?.message || "Failed to download files";
      toast.error(message, toastOptions);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg">Failed to load your orders</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!data?.orders?.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
        <p className="text-gray-600">You haven't purchased anything yet.</p>
        <a
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Buyer Dashboard</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          Your Orders ({data.orders.length})
        </h2>

        {data.orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Order #{order._id.slice(-6)}</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2">
                  <span className="font-medium">Product:</span>{" "}
                  {order.product.title}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
              </div>

              {order.status === "completed" && (
                <button
                  onClick={() => handleDownload(order._id)}
                  disabled={downloadingOrderId === order._id}
                  className={`px-4 py-2 rounded ${
                    downloadingOrderId === order._id
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {downloadingOrderId === order._id
                    ? "Downloading..."
                    : "Download Files"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
