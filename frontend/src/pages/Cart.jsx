import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { productAPI, checkoutAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { formatUsdPrice, getCurrencySymbol } from "../utils/currencyUtils.js";

const PLATFORM_FEE_PERCENT = parseFloat(
  import.meta.env.VITE_PLATFORM_FEE_PERCENT || "10"
);

export default function Cart() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [cartIds, setCartIds] = useLocalStorage("cart", []);

  useEffect(() => {
    const fetch = async () => {
      if (!cartIds.length) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const res = await Promise.all(
          cartIds.map((id) => productAPI.getSingle(id))
        );
        const products = res.map((r) => r.data.data);
        setItems(products.map((p) => ({ product: p })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [cartIds]);

  const removeFromCart = (id) => {
    const newIds = cartIds.filter((i) => i !== id);
    setCartIds(newIds);
    // No need to manually update items; the useEffect will refetch based on cartIds

    window.dispatchEvent(new CustomEvent("cart-updated", { detail: newIds }));
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const productIds = items
        .filter((i) => i.product.shopId?.sellerId._id !== user._id)
        .map((i) => i.product._id);

      if (!productIds.length) {
        alert("No valid items to purchase.");
        setCheckoutLoading(false);
        return;
      }

      const { data } = await checkoutAPI.createCheckoutSession({ productIds });

      window.location.href = data.checkoutUrl;
    } catch (err) {
      alert(err.response?.data?.error || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) return <LoadingSpinner />;

  const validItems = items.filter((i) => i.product.shopId?.sellerId._id !== user._id);

  // Calculate USD total
  const totalUsd = validItems.reduce((sum, i) => {
    // Convert cents → dollars
    const priceInDollars = i.product.currencyCode === "USD"
      ? i.product.price / 100
      : i.product.price / 100 / 280; // cents → USD (or other currency conversion)

    return sum + priceInDollars;
  }, 0);

  const platformFeeUsd = totalUsd * (PLATFORM_FEE_PERCENT / 100);
  const grandTotalUsd = totalUsd + platformFeeUsd;

  return (
    <div className="container py-5">
      <h1 className="mb-4">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-muted">
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      ) : (
        <div className="row align-items-start g-4">
          {/* LEFT: Product List */}
          <div className="col-lg-8">
            {items.map(({ product }) => {
              const isOwner = product.shopId?.sellerId._id === user._id;
              return (
                <div key={product._id} className="card mb-3">
                  <div className="card-body d-flex align-items-center">
                    <img
                      src={product.fileUrl}
                      alt={product.title}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        marginRight: 16,
                      }}
                    />
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{product.title}</h5>
                      <p className="text-muted mb-0">
                        {getCurrencySymbol(product.currencyCode)}{formatUsdPrice(product.price / 100, product.currencyCode)}
                      </p>

                      {isOwner && (
                        <p className="text-warning mt-1 mb-0">
                          You own this product – cannot purchase.
                        </p>
                      )}
                    </div>

                    {!isOwner && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeFromCart(product._id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Summary */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="fs-3 card-title lh-lg">
                  Order Summary
                </h5>

                  {validItems.map(({ product }) => {
                    const priceInDollars = product.currencyCode === "USD"
                      ? product.price / 100
                      : product.price / 100 / 280;

                    return (
                    <React.Fragment key={product._id}>
                      <hr />
                      <div key={product._id} className="d-flex justify-content-between">
                        <span>{product.title}</span>
                        <span>{getCurrencySymbol(product.currencyCode)}{formatUsdPrice(priceInDollars)}</span>
                      </div>
                      </React.Fragment>
                    );
                  })}

                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                  <span>${formatUsdPrice(platformFeeUsd)}</span>
                </div>

                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${formatUsdPrice(grandTotalUsd)}</span>
                </div>

                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || validItems.length === 0}
                >
                  {checkoutLoading ? "Processing…" : "Pay with Stripe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
