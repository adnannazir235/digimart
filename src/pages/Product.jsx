import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useAuth } from "../contexts/authContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCart = () => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  };

  const [cart, setCartState] = useState(getCart());
  const isInCart = user && cart.includes(id);

  const setCart = (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCartState(newCart);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "cart",
        newValue: JSON.stringify(newCart),
      })
    );
  };

  const toggleCart = () => {
    if (!user) return;
    const newCart = isInCart
      ? cart.filter((pid) => pid !== id)
      : [...cart, id];
    setCart(newCart);
  };

  const goToCart = () => {
    navigate("/cart");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await productAPI.getSingle(id);
        setProduct(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!product) return <div className="text-center">Product not found</div>;

  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-lg-6">
          <div className="bg-light rounded overflow-hidden d-flex justify-content-center align-items-center p-4">
            <img
              src={product.fileUrl || "/placeholder-product.jpg"}
              alt={product.title}
              className="img-fluid rounded"
              style={{ maxHeight: "500px", objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="col-lg-6">
          <h1 className="display-5 fw-bold mb-3">{product.title}</h1>

          <div className="mb-3">
            <span className="h3 text-primary me-2">
              ${product.price}
            </span>
            <span className="text-muted">{product.currencyCode || "USD"}</span>
          </div>

          <p className="lead text-muted mb-4">{product.description}</p>

          <div className="mb-3">
            <small className="text-muted">
              Sold by: <strong>{product.sellerId?.username || product.sellerId?.name || "Unknown"}</strong>
            </small>
          </div>

          <div className="d-grid gap-2">
            {user ? (
              <>
                <button
                  onClick={toggleCart}
                  className={`btn btn-lg ${isInCart ? "btn-outline-danger" : "btn-outline-primary"}`}
                >
                  {isInCart ? "Remove from Cart" : "Add to Cart"}
                </button>
                <button
                  onClick={goToCart}
                  className="btn btn-primary btn-lg"
                  disabled={!isInCart}
                >
                  Cart
                </button>
              </>
            ) : (
              <button
                onClick={goToLogin}
                className="btn btn-primary btn-lg"
              >
                Log in to buy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
