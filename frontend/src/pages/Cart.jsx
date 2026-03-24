import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { FaFileAlt } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { productAPI, checkoutAPI } from "../services/api";
import { formatUsdPrice, getCurrencySymbol } from "../utils/currencyUtils.js";
import LoadingSpinner from "../components/LoadingSpinner";

const PLATFORM_FEE_PERCENT = parseFloat(
  import.meta.env.VITE_PLATFORM_FEE_PERCENT || "10",
);

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
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
          cartIds.map((id) => productAPI.getSingle(id)),
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

  const validItems = items.filter(
    (i) => i.product.shopId?.sellerId._id !== user._id,
  );

  // Calculate USD total
  const totalUsd = validItems.reduce((sum, i) => {
    // Convert cents → dollars
    const priceInDollars =
      i.product.currencyCode === "USD"
        ? i.product.price / 100
        : i.product.price / 100 / 280; // cents → USD (or other currency conversion)

    return sum + priceInDollars;
  }, 0);

  const platformFeeUsd = totalUsd * (PLATFORM_FEE_PERCENT / 100);
  const grandTotalUsd = totalUsd + platformFeeUsd;

  return (
    <div className="container py-5">
      <h1 className="mb-1 text-center text-sm-start">
        Your {items.length > 0 && "Shopping"} Cart
      </h1>
      {items.length > 0 && (
        <p className="mb-5 text-center text-sm-start">
          Review your digital artifacts before checkout.
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-muted mt-4 text-center text-sm-start">
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
                      onClick={() => navigate("/products/" + product._id)}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        marginRight: 16,
                        cursor: "pointer",
                      }}
                    />
                    <div className="flex-grow-1">
                      <h5 className="mb-2">{product.title}</h5>
                      <div className="d-flex align-items-center gap-1 text-muted">
                        <FaFileAlt />
                        <p>{product.mimeType.split("/")[1].toUpperCase()}</p>
                      </div>

                      {isOwner && (
                        <p className="text-warning mt-1 mb-0">
                          You own this product – cannot purchase.
                        </p>
                      )}
                    </div>

                    {!isOwner && (
                      <div className="d-flex flex-column align-items-end gap-3">
                        <h5>
                          {getCurrencySymbol(product.currencyCode)}
                          {formatUsdPrice(
                            product.price / 100,
                            product.currencyCode,
                          )}
                        </h5>
                        <button
                          className="btn btn-outline-danger btn-sm border-0"
                          onClick={() => removeFromCart(product._id)}
                        >
                          <MdDeleteOutline size={25} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {items.length > 0 && (
              <button
                className="mt-3 btn btn-link"
                onClick={() => navigate("/products")}
              >
                <div className="d-flex align-items-center gap-2">
                  <IoMdArrowBack /> Continue Shopping
                </div>
              </button>
            )}
          </div>

          {/* RIGHT: Summary */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="fs-3 card-title lh-lg">Order Summary</h5>

                {validItems.map(({ product }) => {
                  const priceInDollars =
                    product.currencyCode === "USD"
                      ? product.price / 100
                      : product.price / 100 / 280;

                  return (
                    <React.Fragment key={product._id}>
                      <hr />
                      <div
                        key={product._id}
                        className="d-flex justify-content-between"
                      >
                        <span>{product.title}</span>
                        <span>
                          {getCurrencySymbol(product.currencyCode)}
                          {formatUsdPrice(priceInDollars)}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}

                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">
                    Platform Fee ({PLATFORM_FEE_PERCENT}%)
                  </span>
                  <span>${formatUsdPrice(platformFeeUsd)}</span>
                </div>

                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${formatUsdPrice(grandTotalUsd)}</span>
                </div>

                <button
                  className="btn btn-primary w-100 mt-4"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || validItems.length === 0}
                >
                  {checkoutLoading ? (
                    "Processing…"
                  ) : (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      Pay with Stripe <IoMdArrowForward />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
