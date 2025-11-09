import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useAuth } from "../contexts/authContext.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.jsx";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cart, setCart] = useLocalStorage("cart", []);
  const isInCart = user && cart.includes(id);

  const toggleCart = () => {
    if (!user) return;
    const newCart = isInCart ? cart.filter((pid) => pid !== id) : [...cart, id];
    setCart(newCart);
  };

  const goToCart = () => navigate("/cart");
  const goToLogin = () => navigate("/login");

  // fetch product
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
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;
  if (!product) return <div className="text-center">Product not found</div>;

  return (
    <>
      {user && product.isSeller && (
        <div className="alert alert-info" role="alert">
          <strong>You're viewing this product as a buyer would.</strong>
        </div>
      )}

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
              <span className="h3 text-primary me-2">{product.price}</span>
              <span className="text-muted">
                {product.currencyCode || "USD"}
              </span>
            </div>

            <div className="mb-3">
              <small className="text-muted">
                Sold by:{" "}
                <strong>
                  {product.sellerId?.username ||
                    product.sellerId?.name ||
                    "Unknown"}
                </strong>
              </small>
            </div>

            <p className="lead text-muted mb-4">{product.description}</p>

            <div className="d-flex gap-2">
              {user ? (
                <>
                  {!product.isSeller && (
                    <>
                      <button
                        onClick={toggleCart}
                        className={`btn ${
                          isInCart
                            ? "btn-outline-danger w-50"
                            : "btn-outline-primary w-50"
                        }`}
                      >
                        {isInCart ? "Remove from Cart" : "Add to Cart"}
                      </button>
                      <button
                        onClick={goToCart}
                        className="btn btn-primary w-50"
                        disabled={!isInCart}
                      >
                        Cart
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button onClick={goToLogin} className="btn btn-primary w-100">
                  Log in to buy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
