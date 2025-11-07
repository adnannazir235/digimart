import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { shopAPI } from "../services/api";

export function useSellerData() {
  const { user, loading: authLoading } = useAuth();
  const [shop, setShop] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (user?.role !== "seller") {
      setShop(null);
      setSales([]);
      setLoading(false);
      return;
    }

    const fetchSellerData = async () => {
      setLoading(true);
      setError(null);

      try {
        const shopRes = await shopAPI.getMyShop().catch((err) => {
          if (err.response?.status === 404) {
            return { data: { data: { shop: null } } };
          }
          throw err;
        });
        setShop(shopRes.data.data.shop || null);

        const salesRes = await shopAPI.getMySales().catch((err) => {
          if (err.response?.status === 404 || err.response?.status === 403) {
            return { data: { data: [], count: 0 } };
          }
          throw err;
        });
        setSales(salesRes.data.data || []);

      } catch (err) {
        console.error("Failed to fetch seller data:", err);
        setError(err.response?.data?.message || "Failed to load seller data");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [user, authLoading]);

  return {
    shop,
    setShop,
    sales,
    loading,
    error
  };
}
