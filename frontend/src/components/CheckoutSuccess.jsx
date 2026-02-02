import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "../components/LoadingSpinner";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [, setCart] = useLocalStorage("cart", []);
  const { user } = useSelector((state) => state.auth);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    setCart([]);

    // Dispatch ONLY here — after real change
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: [] }));

    // Role-aware redirect
    if (user?.role === "seller") {
      navigate("/seller/dashboard/orders-and-sales", { replace: true });
    } else {
      navigate("/buyer/dashboard/orders", { replace: true });
    }
  }, [navigate, setCart, user]);

  return <LoadingSpinner />;
}
