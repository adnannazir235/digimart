import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { productAPI, orderAPI } from "../services/api";

export function useSellerData() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setLoading(true);
    setError(null);

    if (!authLoading && user?.role === "seller") {
      const fetchData = async () => {
        try {
          const [productsRes, ordersRes] = await Promise.all([
            productAPI.getMy(),
            orderAPI.getMyOrders(), // Changed from getSellerOrders
          ]);

          setData({
            products: productsRes.data,
            orders: ordersRes.data,
          });
        } catch (err) {
          console.error("Failed to fetch seller data:", err);
          setError(err.response?.data?.message || "Failed to load seller data");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else if (!authLoading && user?.role !== "seller") {
      setLoading(false);
    }
  }, [user, authLoading]);

  return { data, loading, error };
}
