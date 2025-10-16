import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { orderAPI } from "../services/api";

export function useBuyerData() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setLoading(true);
    setError(null);

    if (!authLoading && user?.role === "buyer") {
      const fetchData = async () => {
        try {
          const ordersRes = await orderAPI.getMyOrders();
          setData({ orders: ordersRes.data.data || [] }); // Updated to use data.data
        } catch (err) {
          console.error("Failed to fetch buyer data:", err);
          setError(err.response?.data?.message || "Failed to load buyer data");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else if (!authLoading && user?.role !== "buyer") {
      setLoading(false);
    }
  }, [user, authLoading]);

  return { data, loading, error };
}
