import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI, checkoutAPI } from "../services/api";
import { useAuth } from "../contexts/authContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner";
import { useLocalStorage } from "../hooks/useLocalStorage.jsx";

const PLATFORM_FEE_PERCENT = parseFloat(
  import.meta.env.VITE_PLATFORM_FEE_PERCENT || "10"
);

// Format local currency: Rs 1,500 | $15.00
const formatLocalPrice = (priceCents, currencyCode) => {
  const amount = priceCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "PKR" ? 0 : 2,
    maximumFractionDigits: currencyCode === "PKR" ? 0 : 2,
  }).format(amount);
};

// Format USD only
const formatUSD = (cents) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

export default function Cart() {
  const { user } = useAuth();
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
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const productIds = items
        .filter((i) => i.product.sellerId._id !== user._id)
        .map((i) => i.product._id);

      if (!productIds.length) {
        alert("No valid items to purchase.");
        setCheckoutLoading(false);
        return;
      }

      const { data } = await checkoutAPI.createCheckoutSession({ productIds });

      if (data.checkoutUrls.length > 1) {
        alert(
          `Warning: ${data.checkoutUrls.length} sellers. Complete each payment separately.`
        );
      }

      window.location.href = data.checkoutUrls[0];
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

  const validItems = items.filter((i) => i.product.sellerId._id !== user._id);

  // Calculate USD total synchronously (no async in reduce!)
  const totalUsdCents = validItems.reduce((sum, i) => {
    const localCents = i.product.price;
    const usdCents =
      i.product.currencyCode === "PKR"
        ? Math.round(localCents / 280) // fallback rate
        : localCents;
    return sum + usdCents;
  }, 0);

  const platformFeeUsdCents = Math.round(
    totalUsdCents * (PLATFORM_FEE_PERCENT / 100)
  );
  const grandTotalUsdCents = totalUsdCents + platformFeeUsdCents;

  return (
    <div className="container py-5">
      <h1 className="mb-4">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-muted">
          Your cart is empty. <a href="/products">Browse products</a>
        </p>
      ) : (
        <div className="row g-4">
          {/* LEFT: Product List */}
          <div className="col-lg-8">
            {items.map(({ product }) => {
              const isOwner = product.sellerId._id === user._id;
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
                        {formatLocalPrice(product.price, product.currencyCode)}
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

          {/* RIGHT: Summary (USD) */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Order Summary (USD)</h5>
                {validItems.map(({ product }) => {
                  const usdCents =
                    product.currencyCode === "PKR"
                      ? Math.round(product.price / 280)
                      : product.price;
                  return (
                    <div
                      key={product._id}
                      className="d-flex justify-content-between"
                    >
                      <span>{product.title}</span>
                      <span>{formatUSD(usdCents)}</span>
                    </div>
                  );
                })}
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                  <span>{formatUSD(platformFeeUsdCents)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>{formatUSD(grandTotalUsdCents)}</span>
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
