import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { shopAPI } from "../services/api";

export function useSellerData() {
  const { user, loading: authLoading } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!authLoading && user?.role === "seller") {
      const fetchShop = async () => {
        try {
          const shopRes = await shopAPI.getMyShop().catch((err) => {
            if (err.response?.status === 404) {
              return { data: { data: { shop: null } } };
            }
            throw err;
          });

          setShop(shopRes.data.data.shop || null);
        } catch (err) {
          console.error("Failed to fetch shop:", err);
          setError(err.response?.data?.message || "Failed to load shop");
        } finally {
          setLoading(false);
        }
      };

      fetchShop();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  return { shop, setShop, loading, error };
}
